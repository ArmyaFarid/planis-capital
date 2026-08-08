"use client"

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { AnimatedParagraph, AnimatedRule, AnimatedWords } from "@/components/motion/animated-text"
import { TiltCard } from "@/components/motion/tilt-card"
import { SectorCard, type SectorCardProps } from "./sector-card"
import { cardIn } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

export function AboutSection() {
  const { t } = useLanguage()

  const sectors: SectorCardProps[] = [
    {
      image: "/images/sector-manufacturing.jpg",
      title: t("sector.manufacturing"),
      description: t("sector.manufacturing.desc"),
      overlayColor: "bg-primary/90",
    },
    {
      image: "/images/sector-health.jpg",
      title: t("sector.health"),
      description: t("sector.health.desc"),
      overlayColor: "bg-accent/90",
    },
    {
      image: "/images/sector-food.jpg",
      title: t("sector.food"),
      description: t("sector.food.desc"),
      overlayColor: "bg-primary/90",
    },
    {
      // TODO(client): no /images/sector-distribution.jpg exists yet — renders the
      // placeholder plate until one is supplied.
      title: t("sector.distribution"),
      description: t("sector.distribution.desc"),
      overlayColor: "bg-accent/90",
    },
  ]

  return (
    <section id="a-propos" className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto mb-24 max-w-4xl text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              {t("about.section")}
            </span>
          </Reveal>

          <h2 className="mt-6 mb-8 font-serif text-h2 text-balance text-foreground">
            <AnimatedWords text={t("about.title")} trigger="view" />
          </h2>

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
            <h3 className="font-serif text-h2 text-foreground">
              <AnimatedWords text={t("about.sectors")} trigger="view" />
            </h3>
          </div>

          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {sectors.map((sector) => (
              <RevealItem key={sector.title} variants={cardIn}>
                <TiltCard max={7}>
                  <SectorCard {...sector} />
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
