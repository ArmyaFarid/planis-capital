"use client"

import { AfricaMap } from "@/components/africa-map"
import { cn } from "@/lib/utils"

/** Meridian offsets, evenly phased so the set reads as one rotating wireframe. */
const MERIDIANS = [0, 1, 2, 3, 4, 5]
/** Latitude ring half-heights as a fraction of the radius. */
const LATITUDES = [0.35, 0.65, 0.88]

interface GlobeFallbackProps {
  className?: string
}

/**
 * Pure SVG/CSS globe for when WebGL is unavailable or the 3D scene fails.
 *
 * Sells depth without a GPU: a radial gradient offset toward the light gives the sphere
 * volume, latitude rings compress toward the poles, and meridians scale on X — which is
 * exactly how a rotating meridian projects — so the wireframe genuinely appears to turn.
 * Africa stays facing the viewer, matching the 3D version's default orientation.
 */
export function GlobeFallback({ className }: GlobeFallbackProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="gf-sphere" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#1B3358" />
            <stop offset="55%" stopColor="#12233F" />
            <stop offset="100%" stopColor="#080F1E" />
          </radialGradient>
          <clipPath id="gf-clip">
            <circle cx="200" cy="200" r="150" />
          </clipPath>
          <radialGradient id="gf-glow" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="92%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atmosphere */}
        <circle cx="200" cy="200" r="186" fill="url(#gf-glow)" />

        {/* Sphere body, lit from upper-left */}
        <circle cx="200" cy="200" r="150" fill="url(#gf-sphere)" />

        <g clipPath="url(#gf-clip)" stroke="#22406A" fill="none" strokeWidth="1">
          {LATITUDES.map((f) => (
            <g key={`lat-${f}`}>
              <ellipse cx="200" cy={200 - 150 * f} rx={150 * Math.sqrt(1 - f * f)} ry={12 * (1 - f)} />
              <ellipse cx="200" cy={200 + 150 * f} rx={150 * Math.sqrt(1 - f * f)} ry={12 * (1 - f)} />
            </g>
          ))}
          <ellipse cx="200" cy="200" rx="150" ry="16" />

          {MERIDIANS.map((i) => (
            <ellipse
              key={`mer-${i}`}
              cx="200"
              cy="200"
              rx="150"
              ry="150"
              className="globe-meridian"
              style={{ animationDelay: `${(-18 / MERIDIANS.length) * i}s` }}
            />
          ))}
        </g>

        {/* Rim */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="1.5" />
      </svg>

      {/* Real Africa geometry, reusing the same generated data as the 3D globe. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AfricaMap className="h-[62%] w-auto" />
      </div>
    </div>
  )
}
