"use client"

import { useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useScroll, useVelocity, useAnimationFrame } from "motion/react"
import { GyroLayer } from "@/components/motion/gyro-layer"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

interface MarqueeBandProps {
  className?: string
  /** Base px/second. Negative scrolls right. */
  speed?: number
}

/**
 * Continuously scrolling sector strip. Scroll velocity feeds into the speed, so the band
 * surges when the page moves and idles when it doesn't.
 */
export function MarqueeBand({ className, speed = 55 }: MarqueeBandProps) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  const items = [
    t("sector.manufacturing"),
    t("sector.health"),
    t("sector.food"),
    t("sector.distribution"),
  ]

  const x = useMotionValue(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)

  useAnimationFrame((_, delta) => {
    if (reduce || !trackRef.current) return
    // One copy's width — the track holds two, so wrapping at -half is seamless.
    const half = trackRef.current.scrollWidth / 2
    if (!half) return

    const boost = Math.min(Math.abs(scrollVelocity.get()) / 1000, 3)
    let next = x.get() - ((speed * (1 + boost)) / 1000) * delta
    if (next <= -half) next += half
    x.set(next)
  })

  // Two identical copies back to back so the wrap point is invisible.
  const sequence = [...items, ...items, ...items, ...items]

  return (
    <GyroLayer strength={0.45}>
    <div
      className={cn(
        "relative flex overflow-hidden border-y border-border bg-secondary py-6 select-none",
        className,
      )}
      aria-hidden="true"
    >
      {/* Fade the edges so items don't hard-clip at the viewport. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-secondary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-secondary to-transparent" />

      <motion.div ref={trackRef} className="flex shrink-0 items-center gap-10 pr-10" style={{ x }}>
        {[...sequence, ...sequence].map((item, i) => (
          <div key={`${item}-${i}`} className="flex shrink-0 items-center gap-10">
            <span className="font-serif text-2xl whitespace-nowrap text-foreground/70 md:text-3xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
          </div>
        ))}
      </motion.div>
    </div>
    </GyroLayer>
  )
}
