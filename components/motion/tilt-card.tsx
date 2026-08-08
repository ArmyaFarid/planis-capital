"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max rotation in degrees on each axis. */
  max?: number
  /** Adds a light sheen that tracks the pointer. */
  sheen?: boolean
}

/**
 * 3D tilt following the pointer. The perspective lives on a wrapper rather than the card
 * itself — applying perspective to the rotating element makes the effect flat and wrong.
 */
export function TiltCard({ children, className, max = 8, sheen = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // -0.5..0.5 across the card.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const springCfg = { stiffness: 220, damping: 22, mass: 0.5 }
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), springCfg)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), springCfg)

  const sheenX = useTransform(px, [-0.5, 0.5], ["0%", "100%"])
  const sheenY = useTransform(py, [-0.5, 0.5], ["0%", "100%"])
  const sheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(247,245,242,0.16), transparent 55%)`

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const reset = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div ref={ref} className={cn("[perspective:1100px]", className)} onPointerMove={onPointerMove} onPointerLeave={reset}>
      <motion.div
        className="relative h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        {children}
        {sheen ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: sheenBg }}
          />
        ) : null}
      </motion.div>
    </div>
  )
}
