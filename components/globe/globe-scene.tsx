"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import { AFRICA_POINTS, GLOBE_ARCS, GLOBE_CITIES, WORLD_POINTS } from "@/lib/globe-geo"

// Brand tokens. WebGL can't read CSS custom properties, so these mirror app/globals.css.
const ACCENT = "#C0432F"
const FOREGROUND = "#F7F5F2"

const RADIUS = 1
/**
 * Brings ~20°E to face the camera, i.e. Africa dead centre on load.
 * Derived, not guessed: a point at lat 0 sits at x=-cosθ, z=sinθ for θ=(lng+180)°, and
 * facing +Z requires θ=90°, which longitude −90 already satisfies — so the group has to
 * carry the remaining −110°.
 */
const AFRICA_FACING = THREE.MathUtils.degToRad(-110)

function latLngToVec3(lat: number, lng: number, radius = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/** Soft round sprite so points read as dots rather than squares. */
function useDotTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size
    const ctx = canvas.getContext("2d")!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.5, "rgba(255,255,255,0.85)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

function LandPoints({
  data,
  color,
  size,
  opacity,
}: {
  data: number[]
  color: string
  size: number
  opacity: number
}) {
  const texture = useDotTexture()

  // Built imperatively rather than via <bufferAttribute attach="...">: the declarative
  // form leaves the bounding sphere unset until first render, and a Points object whose
  // bounding sphere resolves oddly gets frustum-culled and silently never appears.
  const geometry = useMemo(() => {
    const arr = new Float32Array((data.length / 2) * 3)
    for (let i = 0; i < data.length; i += 2) {
      const v = latLngToVec3(data[i], data[i + 1], RADIUS * 1.004)
      arr[(i / 2) * 3] = v.x
      arr[(i / 2) * 3 + 1] = v.y
      arr[(i / 2) * 3 + 2] = v.z
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3))
    geo.computeBoundingSphere()
    return geo
  }, [data])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: texture,
        color: new THREE.Color(color),
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        depthWrite: false,
        // No alphaTest: it clips the soft edge of the sprite and makes dots look chipped.
        toneMapped: false,
      }),
    [texture, color, size, opacity],
  )

  return <points geometry={geometry} material={material} frustumCulled={false} />

}

/** Rim light that falls off toward the centre — cheap fake atmosphere. */
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(ACCENT) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            // Clamped: on a back-side sphere the dot goes negative across most of the
            // surface, so an unclamped pow blows past 1 and fills the canvas with a bright
            // wash instead of hugging the rim.
            float rim = clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
            float intensity = pow(rim, 4.0) * 0.85;
            gl_FragColor = vec4(uColor * intensity, intensity);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  const geometry = useMemo(() => new THREE.SphereGeometry(RADIUS, 48, 48), [])

  return <mesh scale={1.08} geometry={geometry} material={material} renderOrder={-1} />
}

function CityMarkers() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ringsRef.current) return
    const t = clock.getElapsedTime()
    ringsRef.current.children.forEach((ring, i) => {
      // Staggered outward pulse, restarting per marker.
      const phase = (t * 0.55 + i * 0.22) % 1
      const s = 1 + phase * 2.6
      ring.scale.setScalar(s)
      const mat = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.55
    })
  })

  return (
    <group>
      {GLOBE_CITIES.map((city) => {
        const pos = latLngToVec3(city.lat, city.lng, RADIUS * 1.015)
        return (
          <mesh key={city.name} position={pos}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshBasicMaterial color={FOREGROUND} toneMapped={false} />
          </mesh>
        )
      })}

      <group ref={ringsRef}>
        {GLOBE_CITIES.map((city) => {
          const pos = latLngToVec3(city.lat, city.lng, RADIUS * 1.016)
          // Lay each halo flat against the sphere surface.
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            pos.clone().normalize(),
          )
          return (
            <mesh key={`ring-${city.name}`} position={pos} quaternion={quat}>
              <ringGeometry args={[0.016, 0.022, 24]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

/** Great-circle-ish arcs lifted off the surface, with a bead of light running along each. */
function Arcs() {
  const beadsRef = useRef<THREE.Group>(null)

  const curves = useMemo(
    () =>
      GLOBE_ARCS.map(([a, b]) => {
        const start = latLngToVec3(GLOBE_CITIES[a].lat, GLOBE_CITIES[a].lng)
        const end = latLngToVec3(GLOBE_CITIES[b].lat, GLOBE_CITIES[b].lng)
        // Lift the midpoint proportionally to the separation so long routes arc higher.
        const mid = start.clone().add(end).multiplyScalar(0.5)
        const lift = 1 + start.distanceTo(end) * 0.34
        mid.normalize().multiplyScalar(lift)
        return new THREE.QuadraticBezierCurve3(start, mid, end)
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (!beadsRef.current) return
    const t = clock.getElapsedTime()
    beadsRef.current.children.forEach((bead, i) => {
      const phase = (t * 0.26 + i * 0.12) % 1
      const p = curves[i].getPoint(phase)
      bead.position.copy(p)
      const mat = (bead as THREE.Mesh).material as THREE.MeshBasicMaterial
      // Fade in and out at the ends so beads don't pop at the nodes.
      mat.opacity = Math.sin(phase * Math.PI)
    })
  })

  return (
    <group>
      {curves.map((curve, i) => (
        <mesh key={`arc-${i}`}>
          <tubeGeometry args={[curve, 48, 0.0022, 6, false]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.32} toneMapped={false} />
        </mesh>
      ))}

      <group ref={beadsRef}>
        {curves.map((_, i) => (
          <mesh key={`bead-${i}`}>
            <sphereGeometry args={[0.011, 10, 10]} />
            <meshBasicMaterial color={FOREGROUND} transparent toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Globe({ scrollRef, onReady }: { scrollRef: React.RefObject<number>; onReady?: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const dragRef = useRef({ active: false, lastX: 0, velocity: 0, offset: 0 })
  const framesRef = useRef(0)

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    // Signal on the second frame: the first has been submitted but not necessarily
    // painted, and fading in too early shows an empty canvas.
    framesRef.current += 1
    if (framesRef.current === 2) onReady?.()

    const drag = dragRef.current

    if (!drag.active) {
      // Idle spin, plus whatever momentum is left from the last drag.
      drag.offset += delta * 0.075 + drag.velocity
      drag.velocity *= 0.94
    }

    g.rotation.y = AFRICA_FACING + drag.offset
    // Tip away slightly as the hero scrolls out, so the globe reacts to the page.
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.18 + scrollRef.current * 0.5, 0.06)
    g.position.y = THREE.MathUtils.lerp(g.position.y, scrollRef.current * 0.55, 0.06)
  })

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    dragRef.current.active = true
    dragRef.current.lastX = e.clientX
    dragRef.current.velocity = 0
  }
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.lastX
    dragRef.current.lastX = e.clientX
    dragRef.current.offset += dx * 0.005
    dragRef.current.velocity = dx * 0.0007
  }
  const endDrag = () => {
    dragRef.current.active = false
  }

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {/* Dark body so land dots read against it and the far side is occluded. */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.995, 64, 64]} />
        <meshBasicMaterial color="#0C1D36" />
      </mesh>

      {/* Faint graticule for a sense of rotation even over empty ocean. */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.998, 36, 24]} />
        <meshBasicMaterial color="#22406A" wireframe transparent opacity={0.22} />
      </mesh>

      <LandPoints data={WORLD_POINTS} color="#7C9AC4" size={0.019} opacity={0.55} />
      <LandPoints data={AFRICA_POINTS} color="#E4573D" size={0.032} opacity={1} />

      <CityMarkers />
      <Arcs />
      <Atmosphere />
    </group>
  )
}

export default function GlobeScene({
  scrollRef,
  onReady,
}: {
  scrollRef: React.RefObject<number>
  onReady?: () => void
}) {
  return (
    <Canvas
      // Framing budget: globe fills 83% of the frame, halo 90%. Closer than this and the
      // halo clips into a square again (it hit 108% at z=3.05); further and the globe
      // reads small. Paired with atmosphere scale 1.08 — the two move together.
      camera={{ position: [0, 0, 3.5], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
      // Clear to fully transparent explicitly. Without this the canvas paints its own
      // opaque ground and reads as a dark square sitting over the hero.
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.setClearAlpha(0)
      }}
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <Globe scrollRef={scrollRef} onReady={onReady} />
    </Canvas>
  )
}
