"use client"

import { Banknote, Globe, Target, TrendingUp } from "lucide-react"
import { motion } from "motion/react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { AnimatedWords } from "@/components/motion/animated-text"
import { TiltCard } from "@/components/motion/tilt-card"
import { EASE_OUT_QUART, cardIn } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

export function CriteriaSection() {
  const { t } = useLanguage()

  const criteria = [
    {
      icon: Target,
      title: t("criteria.majority"),
      description: t("criteria.majority.desc"),
    },
    {
      icon: TrendingUp,
      title: t("criteria.profitability"),
      description: t("criteria.profitability.desc"),
    },
    {
      icon: Globe,
      title: t("criteria.market"),
      description: t("criteria.market.desc"),
    },
    {
      icon: Banknote,
      title: t("criteria.leverage"),
      description: t("criteria.leverage.desc"),
    },
  ]

  return (
    <section id="nos-criteres" className="bg-secondary py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 max-w-3xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              {t("criteria.section")}
            </span>
          </Reveal>

          <h2 className="mt-6 font-serif text-h2 text-balance text-foreground">
            <AnimatedWords text={t("criteria.title")} trigger="view" />
          </h2>
        </div>

        <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8" stagger={0.1}>
          {criteria.map((item) => (
            <RevealItem key={item.title} variants={cardIn} className="h-full">
              <TiltCard max={6} className="h-full">
              <div className="group h-full border border-transparent bg-background p-8 transition-all duration-500 hover:border-accent/40 hover:shadow-lg md:p-10">
                <div className="flex items-start gap-6">
                  <motion.div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-primary/10 transition-colors duration-500 group-hover:bg-accent/10"
                    variants={{
                      hidden: { scale: 0.85, opacity: 0 },
                      visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.9, ease: EASE_OUT_QUART, delay: 0.15 },
                      },
                    }}
                  >
                    <item.icon className="h-7 w-7 text-primary transition-all duration-500 group-hover:scale-110 group-hover:text-accent" />
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
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
