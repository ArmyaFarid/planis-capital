"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

interface KineticWordmarkProps {
  text: string
  className?: string
}

/**
 * Oversized wordmark that drifts as you reach the bottom of the page, clipped by its own
 * container so it bleeds off both edges. Gives the footer a deliberate ending instead of
 * the page simply stopping.
 *
 * Sized in vw so it always spans the viewport regardless of breakpoint, and marked
 * aria-hidden — it is a graphic, and the real company name is already in the footer.
 */
export function KineticWordmark({ text, className }: KineticWordmarkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
  const x = useTransform(scrollYProgress, [0, 1], ["-14%", "4%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.5, 1])

  return (
    <div ref={ref} className={cn("pointer-events-none overflow-hidden", className)} aria-hidden="true">
      <motion.div
        style={reduce ? undefined : { x, opacity }}
        className="whitespace-nowrap font-serif leading-[0.8] text-primary-foreground/[0.07]"
      >
        <span className="text-[19vw]">{text}</span>
      </motion.div>
    </div>
  )
}
