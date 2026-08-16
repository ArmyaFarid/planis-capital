"use client"

import { motion } from "motion/react"
import {
  LeverageIcon,
  MajorityIcon,
  MarketIcon,
  ProfitabilityIcon,
} from "@/components/criteria-icons"
import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { AnimatedWords } from "@/components/motion/animated-text"
import { TiltCard } from "@/components/motion/tilt-card"
import { GyroLayer } from "@/components/motion/gyro-layer"
import { EASE_OUT_QUART, cardIn3D } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

export function CriteriaSection() {
  const { t } = useLanguage()

  const criteria = [
    {
      Icon: MajorityIcon,
      title: t("criteria.majority"),
      description: t("criteria.majority.desc"),
    },
    {
      Icon: ProfitabilityIcon,
      title: t("criteria.profitability"),
      description: t("criteria.profitability.desc"),
    },
    {
      Icon: MarketIcon,
      title: t("criteria.market"),
      description: t("criteria.market.desc"),
    },
    {
      Icon: LeverageIcon,
      title: t("criteria.leverage"),
      description: t("criteria.leverage.desc"),
    },
  ]

  return (
    <section id="nos-criteres" className="bg-secondary py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="sticky top-[4.5rem] z-20 -mx-4 mb-10 max-w-3xl bg-secondary px-4 pb-4 pt-3 lg:static lg:mx-0 lg:mb-16 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <ScrambleText text={t("criteria.section")} />
            </span>
          </Reveal>

          <WeightScroll as="h2" className="mt-6 font-display text-h2 text-balance text-foreground">
            <AnimatedWords text={t("criteria.title")} trigger="view" />
          </WeightScroll>
        </div>

        <RevealGroup className="grid grid-cols-1 gap-6 [perspective:1200px] md:grid-cols-2 lg:gap-8" stagger={0.1}>
          {criteria.map((item) => (
            <RevealItem key={item.title} variants={cardIn3D} className="h-full">
              <GyroLayer mode="tilt" strength={0.55} className="h-full">
              <TiltCard max={6} className="h-full">
              <div className="group h-full border border-transparent bg-background p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-lg md:p-10">
                <div className="flex items-start gap-6">
                  <motion.div
                    className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-primary/10 transition-colors duration-500 group-hover:bg-accent/10 md:h-16 md:w-16"
                    variants={{
                      hidden: { scale: 0.85, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.9, ease: EASE_OUT_QUART, delay: 0.15 },
                      },
                    }}
                  >
                    <item.Icon />
                  </motion.div>
                  <div>
                    <h3 className="mb-4 font-sans text-h3 font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
              </TiltCard>
              </GyroLayer>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
