"use client"

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import { SECTION_IDS, useActiveSection } from "@/lib/use-active-section"
import { scrollToHash } from "@/lib/scroll-lock"
import { cn } from "@/lib/utils"

const HEADER_OFFSET = -88

/**
 * Compact section indicator for touch, standing in for the xl-only left rail.
 *
 * Pinned to the right edge rather than the bottom so it never collides with the browser's
 * own bottom chrome or a phone's home indicator.
 */
export function MobileProgress() {
  const active = useActiveSection()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 240, damping: 40, restDelta: 0.001 })

  return (
    <nav
      aria-label="Sections"
      className="fixed right-3 top-1/2 z-30 -translate-y-1/2 xl:hidden"
    >
      <div className="relative flex flex-col items-center gap-3 py-2">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground/12" />
        <motion.div
          className="absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2 bg-accent/70"
          style={{ scaleY: reduce ? 1 : progress }}
        />

        {SECTION_IDS.map((id) => (
          <button
            key={id}
            onClick={() => scrollToHash(`#${id}`, HEADER_OFFSET)}
            aria-label={id}
            aria-current={active === id ? "true" : undefined}
            className="relative flex h-4 w-4 items-center justify-center"
          >
            <span
              className={cn(
                "block rounded-full transition-all duration-500",
                active === id ? "h-2 w-2 bg-accent" : "h-1 w-1 bg-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
    </nav>
  )
}
