"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { AnimatedWords } from "@/components/motion/animated-text"
import { fadeUp } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

/**
 * The oversized numeral drifts against the scroll while the card text stays put. It's the
 * one piece of scroll-linked motion on the page — enough to read as considered, not busy.
 */
function ValueCard({ index, title, description }: { index: number; title: string; description: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [34, -34])
  // The numeral also brightens as it passes through the middle of the viewport.
  const numberOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.07, 0.22, 0.07])

  return (
    <RevealItem variants={fadeUp}>
      <div ref={ref} className="group relative">
        <motion.span
          aria-hidden="true"
          style={reduce ? undefined : { y, opacity: numberOpacity }}
          className="block font-serif text-8xl leading-none text-primary-foreground transition-colors duration-500 group-hover:text-accent"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        <div className="relative -mt-8 pl-4">
          <h3 className="mb-3 font-sans text-h3 font-semibold uppercase tracking-tight text-primary-foreground transition-colors duration-500 group-hover:text-accent">
            {title}
          </h3>
          <p className="leading-relaxed text-primary-foreground/60">{description}</p>
        </div>
      </div>
    </RevealItem>
  )
}

export function ValuesSection() {
  const { t } = useLanguage()

  const values = [
    { title: t("values.performance"), description: t("values.performance.desc") },
    { title: t("values.agility"), description: t("values.agility.desc") },
    { title: t("values.rigor"), description: t("values.rigor.desc") },
    { title: t("values.innovation"), description: t("values.innovation.desc") },
  ]

  return (
    <section id="nos-valeurs" className="bg-primary py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 max-w-3xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <ScrambleText text={t("values.section")} />
            </span>
          </Reveal>

          <WeightScroll as="h2" className="mt-6 font-serif text-h2 text-balance text-primary-foreground">
            <AnimatedWords text={t("values.title")} trigger="view" />
          </WeightScroll>

          <Reveal delay={0.2}>
            <p className="mt-6 text-lead text-primary-foreground/70">{t("values.subtitle")}</p>
          </Reveal>
        </div>

        <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {values.map((value, index) => (
            <ValueCard key={value.title} index={index} title={value.title} description={value.description} />
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
