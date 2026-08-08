"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

interface WeightScrollProps {
  children: ReactNode
  className?: string
  as?: "h2" | "h3" | "div" | "span"
}

/**
 * Thickens its text as it crosses the middle of the viewport, then thins again.
 *
 * Driven by --weight-gain (0..1) which app/globals.css maps to -webkit-text-stroke-width.
 * A true variable-font weight axis would be nicer, but Instrument Serif ships one weight,
 * and stroking works on any typeface without changing the display face.
 */
export function WeightScroll({ children, className, as = "div" }: WeightScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const gain = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
  const weight = useMotionTemplate`${gain}`

  const Comp = motion[as] as typeof motion.div

  if (reduce) {
    // No cast: `as` is already a narrow tag union. Widening it to ElementType pulls in
    // R3F's augmented JSX namespace, whose elements declare `children: never`.
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp
      ref={ref}
      className={cn("weight-scroll", className)}
      style={{ "--weight-gain": weight } as React.CSSProperties}
    >
      {children}
    </Comp>
  )
}
