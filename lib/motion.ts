import type { Variants } from "motion/react"

// Mirrors --ease-out-expo / --ease-out-quart in app/globals.css. Keep the two in step.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const

/**
 * Shared viewport trigger. `once: false` — every reveal replays each time it re-enters, so
 * the page animates on the way back up as well as down.
 *
 * The inset is deliberately top-only ("-10% 0px 0px 0px"), not "-10% 0px". A bottom inset
 * shrinks the trigger area up from the viewport floor, and anything sitting closer to the
 * document end than that band can never enter it — the footer's copyright line, 40px above
 * the page bottom, simply never appeared. The top inset still does the useful work: it
 * stops an element retriggering while it straddles the upper edge on the way out.
 */
export const VIEWPORT = { once: false, margin: "-10% 0px 0px 0px" } as const

/**
 * Timing scale. Long and quart-eased rather than short and expo-eased: expo front-loads
 * almost all its travel into the first fraction of the duration, which is what makes a
 * reveal feel like a snap even when the number looks slow.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.05, ease: EASE_OUT_QUART } },
}

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT_QUART } },
}

/** Cards: no scale — a grid of tiles each easing their own size reads as wobble. */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.05, ease: EASE_OUT_QUART } },
}

/**
 * Card entrance with depth. Touch loses the pointer-driven 3D tilt entirely, so the
 * entrance is where mobile gets its sense of dimension instead.
 */
export const cardIn3D: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: 12 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 1.1, ease: EASE_OUT_QUART },
  },
}

/** Press feedback. Touch UI feels dead without it — this is the mobile hover state. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 26 },
}

/** Headings wipe in under a mask rather than fading — reads as typeset, not as a slide. */
export const maskUp: Variants = {
  hidden: { opacity: 0, y: "0.25em", clipPath: "inset(0 0 100% 0)" },
  visible: {
    opacity: 1,
    y: "0em",
    clipPath: "inset(0 0 -15% 0)",
    transition: { duration: 1.1, ease: EASE_OUT_QUART },
  },
}

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
}

export function staggerParentWith(staggerChildren: number, delayChildren = 0.05): Variants {
  return { hidden: {}, visible: { transition: { staggerChildren, delayChildren } } }
}
