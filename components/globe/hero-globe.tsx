"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "motion/react"
import { GlobeFallback } from "./globe-fallback"
import { WebGLBoundary } from "./webgl-boundary"
import type { GlobeFocus } from "./globe-scene"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// TESTING: flip to true to force the 2D fallback everywhere, or append ?no3d=1
// to the URL to force it for a single page load without touching code.
// ─────────────────────────────────────────────────────────────────────────────
export const FORCE_2D_FALLBACK = false

// three + R3F is ~250kb gz. Keep it out of the main bundle and off the server.
const GlobeScene = dynamic(() => import("./globe-scene"), {
  ssr: false,
  loading: () => null,
})

type Status = "probing" | "ok" | "fallback"

interface HeroGlobeProps {
  className?: string
  /** Section-driven target; null lets the globe idle-spin. */
  focusRef?: React.RefObject<GlobeFocus | null>
}

export function HeroGlobe({ className, focusRef }: HeroGlobeProps) {
  const reduce = useReducedMotion()
  const [status, setStatus] = useState<Status>("probing")
  const [sceneReady, setSceneReady] = useState(false)
  const scrollRef = useRef(0)
  // Own ref when no stage drives us, so GlobeScene always has a stable target.
  const ownFocus = useRef<GlobeFocus | null>(null)

  const idleFocus = focusRef ?? ownFocus

  const fail = useCallback(() => {
    setSceneReady(false)
    setStatus("fallback")
  }, [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])

  // Start fetching the 3D chunk immediately rather than waiting on the probe — it is the
  // download, not the probe, that dominates the delay before the globe can appear.
  useEffect(() => {
    if (FORCE_2D_FALLBACK) return
    void import("./globe-scene")
  }, [])

  useEffect(() => {
    if (FORCE_2D_FALLBACK || new URLSearchParams(window.location.search).has("no3d")) {
      // Syncs React state from an external system on mount (reads a WebGL capability probe). There is no
      // render-time source for it, and reading during render breaks hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("fallback")
      return
    }

    try {
      const canvas = document.createElement("canvas")
      const ctx = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null
      if (!ctx) {
        setStatus("fallback")
        return
      }
      // Release the probe context immediately — browsers cap how many can be live at
      // once, and a leaked one can starve the real canvas on weaker devices.
      ctx.getExtension("WEBGL_lose_context")?.loseContext()
      setStatus("ok")
    } catch {
      setStatus("fallback")
    }
  }, [])

  // A context can be lost after a clean start (GPU reset, driver recovery, memory
  // pressure on mobile). Without this the hero would just go blank.
  useEffect(() => {
    if (status !== "ok") return
    const onLost = (e: Event) => {
      e.preventDefault()
      fail()
    }
    window.addEventListener("webglcontextlost", onLost, true)
    return () => window.removeEventListener("webglcontextlost", onLost, true)
  }, [status, fail])

  useEffect(() => {
    const onScroll = () => {
      // 0 at the top of the hero, 1 once it has scrolled a full viewport away.
      scrollRef.current = Math.min(window.scrollY / window.innerHeight, 1)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const boxClass = cn("relative aspect-square w-full max-w-[min(52rem,64vh)]", className)

  // Reduced motion gets the 2D globe too: it still renders, the CSS spin is disabled by
  // the global reduced-motion rule, and it avoids spinning up a GPU context for nothing.
  if (reduce || status === "fallback") {
    return (
      <div className={boxClass}>
        <GlobeFallback />
      </div>
    )
  }

  // Both are layered and cross-faded rather than swapped. A swap reads as a glitch: the
  // 2D globe appears, blanks while the 3D chunk downloads, then the canvas pops in. Here
  // the 2D globe holds the frame until the 3D scene has actually painted, then dissolves.
  return (
    <div className={boxClass}>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: sceneReady ? 0 : 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <GlobeFallback />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: sceneReady ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      >
        {status === "ok" ? (
          <WebGLBoundary fallback={null} onError={fail}>
            <GlobeScene scrollRef={scrollRef} focusRef={idleFocus} onReady={handleSceneReady} />
          </WebGLBoundary>
        ) : null}
      </motion.div>
    </div>
  )
}
