"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#—"
const FRAME_MS = 38
/** Frames each character scrambles before locking, per index. Lower = faster settle. */
const HOLD_PER_CHAR = 2.2

interface ScrambleTextProps {
  text: string
  className?: string
}

/**
 * Decodes from noise into the real string when scrolled into view.
 *
 * Characters lock left to right; anything already settled is never re-randomised, so the
 * label stays readable the whole way rather than churning. Whitespace and the section
 * numbering separator are held fixed so the shape of the label is stable from frame one.
 */
export function ScrambleText({ text, className }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (reduce || !inView) {
      // Syncs React state from an external system on mount (seeds from props on first view). There is no
      // render-time source for it, and reading during render breaks hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(text)
      return
    }

    let frame = 0
    const total = text.length * HOLD_PER_CHAR + 8

    const id = window.setInterval(() => {
      frame += 1
      const settled = frame / HOLD_PER_CHAR

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (i < settled) return char
            // Keep the skeleton: spaces and punctuation never scramble.
            if (char === " " || char === "—") return char
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join(""),
      )

      if (frame >= total) {
        window.clearInterval(id)
        setDisplay(text)
      }
    }, FRAME_MS)

    return () => window.clearInterval(id)
  }, [inView, text, reduce])

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {/* The real string stays in the accessibility tree; the noise is decorative. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
