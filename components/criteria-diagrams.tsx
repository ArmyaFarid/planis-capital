"use client"

import { motion, useReducedMotion } from "motion/react"
import { EASE_OUT_QUART, VIEWPORT } from "@/lib/motion"

const STROKE = "var(--accent)"
const MUTED = "var(--muted-foreground)"

/** Shared frame: 56×56 viewBox, 2px strokes, no fill unless stated. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 56 56" className="h-9 w-9 overflow-visible" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 1.3, ease: EASE_OUT_QUART } },
}

/** Majority position — a ring filling past halfway to 51%. */
export function MajorityDiagram() {
  const reduce = useReducedMotion()
  const r = 20
  const c = 2 * Math.PI * r

  return (
    <Frame>
      <circle cx="28" cy="28" r={r} stroke={MUTED} strokeOpacity="0.3" strokeWidth="4" />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        stroke={STROKE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 28 28)"
        initial={reduce ? false : { strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c * (1 - 0.51) }}
        viewport={VIEWPORT}
        transition={{ duration: 1.5, ease: EASE_OUT_QUART }}
      />
    </Frame>
  )
}

/** Sustainable profitability — bars growing to a steady, rising line. */
export function ProfitabilityDiagram() {
  const reduce = useReducedMotion()
  const bars = [
    { x: 8, h: 14 },
    { x: 21, h: 24 },
    { x: 34, h: 32 },
    { x: 47, h: 40 },
  ]

  return (
    <Frame>
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {bars.map((b) => (
          <motion.rect
            key={b.x}
            x={b.x - 3}
            width="6"
            rx="1"
            fill={STROKE}
            variants={{
              hidden: { height: 0, y: 48 },
              visible: { height: b.h, y: 48 - b.h, transition: { duration: 0.8, ease: EASE_OUT_QUART } },
            }}
          />
        ))}
      </motion.g>
      <motion.path
        d="M5 48 L51 48"
        stroke={MUTED}
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={draw}
      />
    </Frame>
  )
}

/** Addressable market — concentric rings expanding outward. */
export function MarketDiagram() {
  const reduce = useReducedMotion()

  return (
    <Frame>
      <circle cx="28" cy="28" r="4" fill={STROKE} />
      {[11, 18, 25].map((r, i) => (
        <motion.circle
          key={r}
          cx="28"
          cy="28"
          r={r}
          stroke={STROKE}
          strokeWidth="2"
          initial={reduce ? false : { scale: 0.3, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.75 - i * 0.2 }}
          viewport={VIEWPORT}
          style={{ transformOrigin: "28px 28px" }}
          transition={{ duration: 1.1, ease: EASE_OUT_QUART, delay: 0.15 * i }}
        />
      ))}
    </Frame>
  )
}

/** Financial leverage — two streams converging into one thicker channel. */
export function LeverageDiagram() {
  const reduce = useReducedMotion()

  return (
    <Frame>
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{ visible: { transition: { staggerChildren: 0.18 } } }}
      >
        <motion.path
          d="M6 14 C22 14, 22 28, 34 28"
          stroke={MUTED}
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
        />
        <motion.path
          d="M6 42 C22 42, 22 28, 34 28"
          stroke={MUTED}
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
        />
        <motion.path
          d="M34 28 L50 28"
          stroke={STROKE}
          strokeWidth="5"
          strokeLinecap="round"
          variants={draw}
        />
      </motion.g>
    </Frame>
  )
}
