"use client"

import Image from "next/image"
import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { GyroLayer } from "@/components/motion/gyro-layer"
import { AnimatedWords } from "@/components/motion/animated-text"
import { cardIn3D } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

interface PortfolioCompany {
  name: string
  logo: string
  description: string
  website: string
  sector: string
}

export function PortfolioSection() {
  const { t } = useLanguage()

  const portfolioCompanies: PortfolioCompany[] = [
    {
      name: "West-ML Innovation",
      // White lockup: the card sits on navy, and the .jpg carries a white background box.
      logo: "/images/westml-logo-white.png",
      description: t("portfolio.westml.desc"),
      website: "https://westml-innovation.com/",
      sector: t("portfolio.westml.sector"),
    },
  ]

  // A lone card inside a 2-col grid renders half-width and reads unfinished.
  const isSingle = portfolioCompanies.length === 1

  return (
    <section id="portefeuille" className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <ScrambleText text={t("portfolio.section")} />
            </span>
          </Reveal>

          <WeightScroll as="h2" className="mt-6 font-display text-h2 text-balance text-foreground">
            <AnimatedWords text={t("portfolio.title")} trigger="view" />
          </WeightScroll>

          <Reveal delay={0.2}>
            <p className="mt-6 text-lead text-pretty text-muted-foreground">
              {t("portfolio.subtitle")}
            </p>
          </Reveal>
        </div>

        <RevealGroup className="mx-auto max-w-4xl [perspective:1200px]" stagger={0.1}>
          <div className={cn("grid gap-6", isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            {portfolioCompanies.map((company) => (
              <RevealItem key={company.website} variants={cardIn3D}>
                <GyroLayer mode="tilt" strength={0.8}>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label={t("portfolio.visit")}
                  className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
                >
                  {/* The logo IS the company name — no heading, no description, just the
                      mark. Still fully clickable everywhere on the card. */}
                  <div className="relative flex flex-1 items-center justify-center p-12 md:p-16">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={280}
                      height={100}
                      className="max-h-28 object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105 md:max-h-20"
                    />
                  </div>
                </a>
                </GyroLayer>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  )
}
