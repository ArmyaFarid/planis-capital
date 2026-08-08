"use client"

import { Mail, Send } from "lucide-react"
import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal } from "@/components/motion/reveal"
import { Magnetic } from "@/components/motion/magnetic"
import { AnimatedWords } from "@/components/motion/animated-text"
import { cardIn } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

const EMAIL = "info@planisgroup.com"

export function ContactSection() {
  const { t } = useLanguage()

  return (
    <section id="contact" className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <Reveal>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                <ScrambleText text={t("contact.section")} />
              </span>
            </Reveal>

            <WeightScroll as="h2" className="mt-6 font-serif text-h2 text-balance text-foreground">
              <AnimatedWords text={t("contact.title")} trigger="view" />
            </WeightScroll>
          </div>

          <Reveal delay={0.2} variants={cardIn}>
            <div className="group bg-primary p-8 text-center md:p-16">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center bg-accent/20 transition-transform duration-500 group-hover:scale-105">
                <Mail className="h-10 w-10 text-accent" />
              </div>

              <p className="mx-auto mb-6 max-w-xl text-lead text-pretty text-primary-foreground/70">
                {t("contact.subtitle")}
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="mb-8 inline-block font-serif text-3xl text-accent transition-colors duration-300 hover:text-accent-hover"
              >
                {EMAIL}
              </a>

              <div className="flex justify-center">
                <Magnetic>
                <a
                  href={`mailto:${EMAIL}`}
                  data-cursor="link"
                  className="group/cta inline-flex items-center bg-accent px-8 py-4 font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-hover"
                >
                  <Send className="mr-2 h-5 w-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  {t("contact.cta")}
                </a>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
