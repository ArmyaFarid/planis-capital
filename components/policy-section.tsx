"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrambleText } from "@/components/motion/scramble-text"
import { WeightScroll } from "@/components/motion/weight-scroll"
import { Reveal } from "@/components/motion/reveal"
import { AnimatedWords } from "@/components/motion/animated-text"
import { useLanguage } from "@/lib/language-context"

// Copy for all of these already lived in language-context.tsx in both languages; nothing
// rendered it, and nav.policy / footer.privacy pointed nowhere.
const CLAUSES = ["access", "cookies", "security", "warning", "changes"] as const

export function PolicySection() {
  const { t } = useLanguage()

  return (
    <section id="notre-politique" className="bg-secondary py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <ScrambleText text={t("policy.section")} />
            </span>
          </Reveal>

          <WeightScroll as="h2" className="mt-6 font-serif text-h2 text-balance text-foreground">
            <AnimatedWords text={t("policy.title")} trigger="view" />
          </WeightScroll>

          <Reveal delay={0.2}>
            <p className="mt-6 text-lead text-pretty text-muted-foreground">{t("policy.intro")}</p>
          </Reveal>

          <Reveal delay={0.3}>
            <Accordion type="single" collapsible className="mt-10 border-t border-border">
              {CLAUSES.map((clause) => (
                <AccordionItem key={clause} value={clause} className="border-border">
                  <AccordionTrigger className="py-5 text-left font-sans text-base font-semibold tracking-tight text-foreground hover:text-accent hover:no-underline">
                    {t(`policy.${clause}`)}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                    {t(`policy.${clause}.desc`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="mt-10 text-muted-foreground">
              {t("policy.contact")}{" "}
              <a
                href="mailto:info@planisgroup.com"
                className="font-medium text-accent transition-colors duration-300 hover:text-accent-hover"
              >
                info@planisgroup.com
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
