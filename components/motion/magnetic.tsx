"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

interface MagneticProps {
  children: ReactNode
  className?: string
  /** How far the element is allowed to travel toward the pointer, in px. */
  strength?: number
}

/**
 * Pulls its child toward the pointer while hovered, then springs home. Pointer-fine only:
 * on touch there is no hover, and the transform would just never reset.
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.6 })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    // Offset from centre, normalised, so the pull is even regardless of element size.
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  )
}
