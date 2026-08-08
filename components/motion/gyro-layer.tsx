"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, useTransform } from "motion/react"
import { useGyroTilt } from "@/lib/use-gyro-tilt"
import { cn } from "@/lib/utils"

interface GyroLayerProps {
  children: ReactNode
  className?: string
  /** Per-layer multiplier. Vary it between layers — equal rates read as one flat sheet. */
  strength?: number
  /** `shift` translates (good for backgrounds and text), `tilt` rotates (good for cards). */
  mode?: "shift" | "tilt"
}

/**
 * Applies device tilt to whatever it wraps. Inert on desktop and until permission is
 * granted, since the underlying motion values simply stay at zero.
 */
export function GyroLayer({ children, className, strength = 1, mode = "shift" }: GyroLayerProps) {
  const reduce = useReducedMotion()
  const gyro = useGyroTilt(strength)

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn(mode === "tilt" && "[transform-style:preserve-3d]", className)}
      style={
        mode === "tilt"
          ? { rotateX: gyro.rx, rotateY: gyro.ry, transformPerspective: 1000 }
          : { x: gyro.tx, y: gyro.ty }
      }
    >
      {children}
    </motion.div>
  )
}

/**
 * Tilt-reactive sheen on text.
 *
 * The gradient's horizontal position tracks the device, so the highlight slides across the
 * glyphs as you turn the phone — the same read as light catching foil. Uses
 * background-clip:text, which needs a transparent fill, so the base colour is carried by
 * the gradient's own end stops rather than by `color`.
 */
export function GyroSheen({
  children,
  className,
  strength = 1,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const gyro = useGyroTilt(strength)
  const position = useTransform(gyro.ry, (v) => `${50 - v * 2.4}% 0%`)

  if (reduce) {
    return <span className={className}>{children}</span>
  }

  return (
    <motion.span className={cn("gyro-sheen", className)} style={{ backgroundPosition: position }}>
      {children}
    </motion.span>
  )
}
