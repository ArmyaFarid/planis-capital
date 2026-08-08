"use client"

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import { SECTION_IDS, useActiveSection } from "@/lib/use-active-section"
import { scrollToHash } from "@/lib/scroll-lock"
import { cn } from "@/lib/utils"

const HEADER_OFFSET = -88

/**
 * Fixed 01–06 index down the left edge, with a rail that fills as you progress.
 *
 * Hidden below xl: at narrower widths it would sit on top of the content rather than in
 * the margin. Decorative but interactive — the numbers are real navigation.
 */
export function SectionRail() {
  const active = useActiveSection()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 240, damping: 40, restDelta: 0.001 })

  return (
    <nav
      aria-label="Sections"
      className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block 2xl:left-10"
    >
      <div className="relative flex flex-col gap-5 pl-4">
        {/* Rail + fill */}
        <div className="absolute left-0 top-1 bottom-1 w-px bg-foreground/15" />
        <motion.div
          className="absolute left-0 top-1 bottom-1 w-px origin-top bg-accent"
          style={{ scaleY: reduce ? 1 : progress }}
        />

        {SECTION_IDS.map((id, i) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => scrollToHash(`#${id}`, HEADER_OFFSET)}
              className="group flex items-center gap-2 text-left"
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={cn(
                  "font-sans text-[10px] tabular-nums tracking-[0.2em] transition-all duration-500",
                  isActive
                    ? "text-accent"
                    : "text-foreground/35 group-hover:text-foreground/70",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "h-px bg-accent transition-all duration-500",
                  isActive ? "w-5 opacity-100" : "w-0 opacity-0",
                )}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
