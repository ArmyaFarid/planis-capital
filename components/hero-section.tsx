"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { HeroGlobe } from "@/components/globe/hero-globe"
import { StatsStrip } from "@/components/stats-strip"
import { AnimatedWords } from "@/components/motion/animated-text"
import { Magnetic } from "@/components/motion/magnetic"
import { EASE_OUT_QUART } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"

// Swap in a dedicated hero shot by editing this array — nothing else depends on the count.
// Specs for a replacement: landscape, >=2400px wide, dark/low-key so the scrim stays readable.
const HERO_IMAGES = [
  "/images/sector-manufacturing.jpg",
  "/images/sector-health.jpg",
  "/images/sector-food.jpg",
]

const SLIDE_MS = 7000

function HeroBackdrop() {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || HERO_IMAGES.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_IMAGES.length), SLIDE_MS)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_IMAGES.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <motion.div
            className="relative h-full w-full"
            // Ken Burns restarts each time this slide becomes active.
            animate={reduce ? undefined : { scale: i === index ? 1.09 : 1 }}
            transition={{ duration: 12, ease: "linear" }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Scrim. The photo is texture — it must never compete with the headline. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628]/96 via-[#16294A]/88 to-[#0A1628]/96" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/85 via-transparent to-[#0A1628]" />
    </div>
  )
}

export function HeroSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  }
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_OUT_QUART } },
  }

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-primary">
      <HeroBackdrop />

      <div className="container relative z-10 mx-auto flex flex-1 items-center px-4 pt-28 pb-10 md:px-8 md:pt-32 md:pb-14">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          {/* Copy */}
          <motion.div initial={reduce ? false : "hidden"} animate="visible" variants={container}>
            <motion.p
              variants={item}
              className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-accent md:text-base"
            >
              {t("hero.subtitle")}
            </motion.p>

            <h1 className="font-serif text-display text-primary-foreground">
              <AnimatedWords text={t("hero.title1")} />
              <br />
              <AnimatedWords text={t("hero.title2")} className="text-accent" />
            </h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-lead text-pretty text-primary-foreground/75"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-start">
              <Magnetic>
                <Link
                  href="#a-propos"
                  data-cursor="link"
                  className="block bg-accent px-8 py-4 text-center font-semibold text-accent-foreground transition-colors duration-300 hover:bg-accent-hover"
                >
                  {t("hero.cta1")}
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="#contact"
                  data-cursor="link"
                  className="btn-wipe block border-2 border-primary-foreground/70 px-8 py-4 text-center font-semibold text-primary-foreground transition-colors duration-300 hover:border-accent"
                >
                  {t("hero.cta2")}
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>

          {/* 3D globe. Hidden below lg — at phone widths it only ever fights the copy,
              and it's the most expensive thing on the page. */}
          <div className="hidden justify-center lg:flex">
            <HeroGlobe className="max-h-[52vh]" />
          </div>
        </div>
      </div>

      {/* Stat band + scroll cue */}
      <div className="container relative z-10 mx-auto px-4 pb-8 md:px-8">
        <StatsStrip />
        <div className="mt-8 hidden justify-center md:flex">
          <Link
            href="#a-propos"
            className="flex flex-col items-center text-primary-foreground/55 transition-colors duration-300 hover:text-primary-foreground"
          >
            <span className="mb-2 text-xs uppercase tracking-widest">{t("hero.scroll")}</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </Link>
        </div>
      </div>
    </section>
  )
}
