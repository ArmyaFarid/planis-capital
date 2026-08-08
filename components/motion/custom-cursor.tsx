"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

type CursorMode = "default" | "link" | "label"

/**
 * Trailing cursor. Desktop pointers only — on touch there is no cursor to replace, and on
 * a trackpad-less device the lag reads as broken.
 *
 * Elements opt in with data attributes rather than the component knowing about sections:
 *   data-cursor="link"           → grows into a ring
 *   data-cursor-label="Visiter"  → grows into a labelled disc
 */
export function CustomCursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<CursorMode>("default")
  const [label, setLabel] = useState("")
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  // Light spring: enough lag to feel alive, not so much that it feels detached.
  const springX = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 })

  useEffect(() => {
    if (reduce) return
    setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches)
  }, [reduce])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)

      const target = (e.target as Element | null)?.closest?.("[data-cursor],[data-cursor-label],a,button")
      if (!target) {
        setMode("default")
        return
      }
      const labelled = target.getAttribute("data-cursor-label")
      if (labelled) {
        setLabel(labelled)
        setMode("label")
        return
      }
      setMode("link")
    }

    const onLeave = () => setVisible(false)

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const size = mode === "label" ? 76 : mode === "link" ? 44 : 14

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full border border-white text-[10px] font-semibold uppercase tracking-widest text-white"
        animate={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          backgroundColor: mode === "default" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
          x: -size / 2,
          y: -size / 2,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        {mode === "label" ? label : null}
      </motion.div>
    </motion.div>
  )
}
