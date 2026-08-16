"use client"

import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal } from "@/components/motion/reveal"
import { AnimatedParagraph, AnimatedRule, AnimatedWords } from "@/components/motion/animated-text"
import { type SectorCardProps } from "./sector-card"
import { SectorShowcase } from "./sector-showcase"
import { useLanguage } from "@/lib/language-context"

export function AboutSection() {
  const { t } = useLanguage()

  const sectors: SectorCardProps[] = [
    {
      image: "/images/sector-manufacturing.jpg",
      title: t("sector.manufacturing"),
      description: t("sector.manufacturing.desc"),
      overlayColor: "bg-primary/50",
    },
    {
      image: "/images/sector-health.jpg",
      title: t("sector.health"),
      description: t("sector.health.desc"),
      overlayColor: "bg-accent/50",
    },
    {
      image: "/images/sector-food.jpg",
      title: t("sector.food"),
      description: t("sector.food.desc"),
      overlayColor: "bg-primary/50",
    },
    {
      // Public domain (work of the U.S. federal government), via Wikimedia Commons:
      // "JFC-UA to transfer ETU resupply mission to World Food Program", Liberia, 2014.
      // Cropped square and tone-lifted to sit with the other three. Free for commercial
      // use with no attribution required — replace freely if the client commissions one.
      image: "/images/sector-distribution.jpg",
      title: t("sector.distribution"),
      description: t("sector.distribution.desc"),
      overlayColor: "bg-accent/50",
    },
  ]

  return (
    <section id="a-propos" className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto mb-24 max-w-4xl text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <ScrambleText text={t("about.section")} />
            </span>
          </Reveal>

          <WeightScroll as="h2" className="mt-6 mb-8 font-display text-h2 text-balance text-foreground">
            <AnimatedWords text={t("about.title")} trigger="view" />
          </WeightScroll>

          <AnimatedParagraph
            text={t("about.p1")}
            className="text-lead text-pretty text-muted-foreground"
            delay={0.1}
          />

          <AnimatedParagraph
            text={t("about.p2")}
            className="mt-6 text-lead text-pretty text-muted-foreground"
            delay={0.15}
          />
        </div>

        <div>
          <div className="mb-16 text-center">
            <AnimatedRule className="mx-auto mb-16 max-w-xs text-foreground" />
            <h3 className="font-display text-h2 text-foreground">
              <AnimatedWords text={t("about.sectors")} trigger="view" />
            </h3>
          </div>

          <SectorShowcase sectors={sectors} />
        </div>
      </div>
    </section>
  )
}
