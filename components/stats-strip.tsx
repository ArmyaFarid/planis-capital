"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react"
import { useLanguage } from "@/lib/language-context"
import { EASE_OUT_EXPO } from "@/lib/motion"

interface Stat {
  /** Translation key for the label. */
  key: string
  /** null renders an em dash — use it rather than inventing a figure. */
  value: number | null
  suffix?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO(client): confirm these before launch.
//   - stats.founded   — incorporation year. Currently null → renders "—".
//   - stats.countries — number of countries with portfolio exposure. Currently null.
// The other two are asserted elsewhere on the site already (4 sector cards, 1 portfolio
// company), so they are safe to state.
// ─────────────────────────────────────────────────────────────────────────────
const STATS: Stat[] = [
  { key: "stats.founded", value: null },
  { key: "stats.sectors", value: 4 },
  { key: "stats.companies", value: 1 },
  { key: "stats.countries", value: null },
]

function StatValue({ value, suffix }: { value: number | null; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // No negative margin here: the strip sits at the fold, and a 15% inset means the
  // numbers never start counting on a short laptop viewport.
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()

  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("fr-FR"))

  useEffect(() => {
    if (value === null) return
    if (reduce) {
      count.set(value)
      return
    }
    // Reset on exit, otherwise the value is already at target when the strip scrolls back
    // in and animating to it is a no-op — the count would only ever run once.
    if (!inView) {
      count.set(0)
      return
    }
    const controls = animate(count, value, { duration: 1.4, ease: EASE_OUT_EXPO })
    return () => controls.stop()
  }, [inView, value, reduce, count])

  if (value === null) {
    return (
      <span ref={ref} className="font-serif text-3xl text-primary-foreground/40 md:text-4xl">
        —
      </span>
    )
  }

  return (
    <span ref={ref} className="font-serif text-3xl text-primary-foreground md:text-4xl">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function StatsStrip() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <motion.dl
      className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-primary-foreground/12 pt-6 md:grid-cols-4 md:gap-6"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
    >
      {STATS.map((stat) => (
        <motion.div
          key={stat.key}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
          }}
        >
          <dt className="sr-only">{t(stat.key)}</dt>
          <dd>
            <StatValue value={stat.value} suffix={stat.suffix} />
            <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-primary-foreground/55">
              {t(stat.key)}
            </span>
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  )
}
