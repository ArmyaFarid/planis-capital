"use client"

import { motion } from "motion/react"
import { AFRICA_OUTLINE } from "@/lib/africa-geo"
import { EASE_OUT_QUART } from "@/lib/motion"

const ACCENT = "var(--accent)"
const MUTED = "var(--muted-foreground)"

/**
 * Line-art icon set, redrawn from the criteria icons on planisgroup.webflow.io: uniform
 * stroke, round caps and joins, no fills. Because everything is stroked, each shape can
 * draw itself on with pathLength, which the previous solid-fill set could not do.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14 overflow-visible md:h-11 md:w-11"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/*
        Deliberately carries no `initial`/`whileInView` of its own: it inherits the
        hidden/visible label from the card's icon tile and only supplies the stagger for
        the shapes below it. Giving this element its own viewport trigger makes it a
        second variant root, and it then never receives the parent's "visible" — which
        left every icon frozen at pathLength 0.
      */}
      <motion.g variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        {children}
      </motion.g>
    </svg>
  )
}

/** Stroked shapes draw themselves on. */
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 1.1, ease: EASE_OUT_QUART } },
}

/** Filled shapes have no stroke to trace, so they scale up instead. */
const pop = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_QUART } },
}

const polar = (cx: number, cy: number, r: number, a: number) =>
  `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`

/** Toothed gear outline. Teeth are trapezoidal — narrower at the tip than at the root. */
function gearPath(cx: number, cy: number, rOut: number, rIn: number, teeth = 8) {
  const step = (Math.PI * 2) / teeth
  const tip = step * 0.22
  const root = step * 0.34
  let d = ""

  for (let i = 0; i < teeth; i++) {
    const a = i * step
    d += `${i === 0 ? "M" : "L"}${polar(cx, cy, rIn, a - root)}`
    d += `L${polar(cx, cy, rOut, a - tip)}`
    d += `L${polar(cx, cy, rOut, a + tip)}`
    d += `L${polar(cx, cy, rIn, a + root)}`
  }

  return `${d}Z`
}

/** Five-pointed star. */
function starPath(cx: number, cy: number, rOut: number, rIn: number) {
  let d = ""

  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    d += `${i === 0 ? "M" : "L"}${polar(cx, cy, i % 2 === 0 ? rOut : rIn, a)}`
  }

  return `${d}Z`
}

const MAJORITY_GEAR = gearPath(16, 34, 9, 6.8)
const MAJORITY_STAR = starPath(36, 34, 7.5, 3.1)
const LEVERAGE_GEAR = gearPath(24, 16, 11, 8.4)
const LEVERAGE_GEAR_L = gearPath(14, 37, 6.4, 4.7, 7)
const LEVERAGE_GEAR_R = gearPath(34, 37, 6.4, 4.7, 7)

/**
 * Position majoritaire — the operator, the mechanism they control and the result of it.
 * Mirrors the person + gear + star + rising arrows of the original.
 */
export function MajorityIcon() {
  return (
    <Frame>
      {/* Operator */}
      <motion.circle cx="16" cy="11" r="5.5" stroke={ACCENT} variants={draw} />
      <motion.path d="M7 25.5A9.5 9.5 0 0 1 25 25.5" stroke={ACCENT} variants={draw} />

      {/* Rising arrows, the shorter one behind */}
      <motion.path d="M31 26V15M31 15l-3 3.4M31 15l3 3.4" stroke={MUTED} variants={draw} />
      <motion.path d="M40 26V8M40 8l-3 3.4M40 8l3 3.4" stroke={ACCENT} variants={draw} />

      {/* Mechanism + result */}
      <motion.path d={MAJORITY_GEAR} stroke={MUTED} variants={draw} />
      <motion.circle cx="16" cy="34" r="3.2" stroke={MUTED} variants={draw} />
      <motion.path d={MAJORITY_STAR} stroke={ACCENT} variants={draw} />
    </Frame>
  )
}

/**
 * Rentabilité soutenable — a climb measured against a clock, which is the whole point of
 * "soutenable": the return has to hold over time, not spike.
 */
export function ProfitabilityIcon() {
  return (
    <Frame>
      {/* Columns the trend runs over */}
      <motion.path d="M20 34V22M28 34V17M36 34V12" stroke={MUTED} variants={draw} />

      {/* Trend line into its arrowhead */}
      <motion.path d="M15 27l7-7 5 5 9-11" stroke={ACCENT} variants={draw} />
      <motion.path d="M30 14h6v6" stroke={ACCENT} variants={draw} />

      {/* Stopwatch */}
      <motion.circle cx="15" cy="35" r="8.5" stroke={ACCENT} variants={draw} />
      <motion.path d="M12.5 24.5h5M15 27v-2.5M15 35v-4.5M15 35h3.2" stroke={ACCENT} variants={draw} />
    </Frame>
  )
}

/**
 * Marché adressable à fort potentiel — the continent inside the globe, exactly as the
 * original. The silhouette is the generated Natural Earth outline the map already uses,
 * scaled into this icon's grid rather than redrawn by hand.
 */
export function MarketIcon() {
  return (
    <Frame>
      <motion.circle cx="24" cy="24" r="20" stroke={MUTED} variants={draw} />
      {/* Two nested groups on purpose: motion drives `scale` through the style transform,
          which replaces a `transform` attribute on the same element outright — the static
          fit would silently vanish and the continent would render at its authored size. */}
      <motion.g style={{ transformOrigin: "24px 24px" }} variants={pop}>
        {/* AFRICA_OUTLINE is authored in a 520x580 viewBox; 0.0425 fits it inside the ring. */}
        <g transform="translate(12.8 10.2) scale(0.0425)">
          <path d={AFRICA_OUTLINE} fill={ACCENT} stroke="none" />
        </g>
      </motion.g>
    </Frame>
  )
}

/**
 * Leviers financiers adéquats — capital as the driving gear, with the lift it produces on
 * either side. Keeps the original's gear-and-arrows reading.
 */
export function LeverageIcon() {
  return (
    <Frame>
      {/* Driving gear: the capital itself */}
      <motion.path d={LEVERAGE_GEAR} stroke={ACCENT} variants={draw} />
      <motion.circle cx="24" cy="16" r="5.6" stroke={ACCENT} variants={draw} />
      {/* Currency mark */}
      <motion.path
        d="M24 10.6v10.8M26.5 13a2.8 2.8 0 0 0-2.5-1.7 2.3 2.3 0 0 0 0 4.6 2.3 2.3 0 0 1 0 4.6A2.8 2.8 0 0 1 21.5 19"
        stroke={ACCENT}
        variants={draw}
      />

      {/* The lift it produces, on either side */}
      <motion.path d="M5 34V22M5 22l-3 3.4M5 22l3 3.4" stroke={MUTED} variants={draw} />
      <motion.path d="M43 34V22M43 22l-3 3.4M43 22l3 3.4" stroke={MUTED} variants={draw} />

      {/* Driven gears */}
      <motion.path d={LEVERAGE_GEAR_L} stroke={MUTED} variants={draw} />
      <motion.circle cx="14" cy="37" r="2.3" stroke={MUTED} variants={draw} />
      <motion.path d={LEVERAGE_GEAR_R} stroke={MUTED} variants={draw} />
      <motion.circle cx="34" cy="37" r="2.3" stroke={MUTED} variants={draw} />
    </Frame>
  )
}
