"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

/**
 * Colour-grades the whole page as you scroll, so the site reads as one continuous surface
 * rather than a stack of separately-coloured blocks.
 *
 * Implemented as a blended overlay rather than by animating the section backgrounds: the
 * sections alternate between three different background tokens, and morphing each of them
 * independently would break that rhythm. soft-light at low opacity shifts temperature
 * without washing out text.
 */
export function ScrollTint() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Warm through the middle of the page, neutral at both ends.
  const opacity = useTransform(scrollYProgress, [0, 0.28, 0.55, 0.82, 1], [0, 0.3, 0.42, 0.26, 0])
  const hue = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7, 1],
    ["var(--accent)", "var(--accent)", "#2E6F8E", "var(--accent)"],
  )

  if (reduce) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 mix-blend-soft-light"
      style={{ opacity, backgroundColor: hue }}
    />
  )
}
