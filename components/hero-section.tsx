"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { MobileGlobe } from "@/components/globe/mobile-globe"
import { useGyroTilt } from "@/lib/use-gyro-tilt"
import { Magnetic } from "@/components/motion/magnetic"
import { EASE_OUT_QUART } from "@/lib/motion"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

// Swap in a dedicated hero shot by editing this array — nothing else depends on the count.
// Specs for a replacement: landscape, >=2400px wide, dark/low-key so the scrim stays readable.
const HERO_IMAGES = [
  "/images/sector-manufacturing.jpg",
  "/images/sector-health.jpg",
  "/images/sector-food.jpg",
]

const SLIDE_MS = 7000

function HeroBackdrop({
  index,
  setIndex,
}: {
  index: number
  setIndex: (updater: (i: number) => number) => void
}) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || HERO_IMAGES.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_IMAGES.length), SLIDE_MS)
    return () => clearInterval(id)
  }, [reduce, setIndex])

  // Slowest layer: a large background should barely move, or the depth illusion inverts.
  const tilt = useGyroTilt(0.9)

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={reduce ? undefined : { x: tilt.tx, y: tilt.ty, scale: 1.06 }}
    >
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
    </motion.div>
  )
}

export function HeroSection() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const [slide, setSlide] = useState(0)
  // Faintest layer. Copy that swims makes text hard to read — this is barely perceptible
  // on its own, and only reads as depth against the backdrop and globe moving more.
  const copyTilt = useGyroTilt(0.5)

  // Cycles the two-line tagline: each half shows, then hides, then the other takes its
  // turn, on a loop.
  const [taglineIndex, setTaglineIndex] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setTaglineIndex((i) => (i + 1) % 2), 2800)
    return () => clearInterval(id)
  }, [reduce])

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
      <HeroBackdrop index={slide} setIndex={setSlide} />

      {/* Mobile globe. Positioned behind the copy rather than stacked below it: phone
          heroes have no spare vertical room, and the 2D globe costs no GPU or bandwidth
          (see GlobeStage for the desktop 3D one). */}
      <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center lg:hidden">
        <MobileGlobe />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 items-center px-4 pt-28 pb-10 md:px-8 md:pt-32 md:pb-14">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Copy */}
          <motion.div
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={container}
            style={
              reduce
                ? undefined
                : {
                    x: copyTilt.tx,
                    y: copyTilt.ty,
                    rotateY: copyTilt.ry,
                    transformPerspective: 1200,
                  }
            }
          >
            {/* No "Planis Capital" eyebrow: the logo in the header already carries the
                name, so repeating it above the headline is the same redundancy as the
                portfolio card's duplicated wordmark. */}
            {/* Cycles between the two lines of the tagline, one at a time, on a timed
                loop. Opacity/y only (no background-clip:text), so it avoids the
                blank-paint issue the earlier GyroSheen/sweep effects had here. */}
            <h1 className="font-display text-display text-primary-foreground">
              <AnimatePresence mode="wait">
                <motion.span
                  key={taglineIndex}
                  className={cn("block", taglineIndex === 1 && "text-accent")}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -16 }}
                  transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
                >
                  {taglineIndex === 0 ? t("hero.title1") : t("hero.title2")}
                </motion.span>
              </AnimatePresence>
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

            {/* In flow, not absolutely positioned: at bottom-[8.5rem] these pills landed
                on top of the stat strip and read as stray dashes beside its labels. */}
            <div className="mt-8 flex gap-2 lg:hidden">
              {HERO_IMAGES.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setSlide(() => i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i === slide ? "w-6 bg-accent" : "w-3 bg-primary-foreground/30",
                  )}
                />
              ))}
            </div>
          </motion.div>

          {/* The globe lives in GlobeStage (fixed, persists across sections). This column
              is reserved so the copy never runs under it. */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>

      {/* Swipe layer: drag horizontally to change the backdrop. Sits above the art but
          below the copy, and only on touch, so it never intercepts CTA taps. */}
      <motion.div
        className="absolute inset-0 z-[2] lg:hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) < 60) return
          const dir = info.offset.x < 0 ? 1 : -1
          setSlide((i) => (i + dir + HERO_IMAGES.length) % HERO_IMAGES.length)
        }}
      />

      {/* Scroll cue */}
      <div className="container relative z-10 mx-auto px-4 pb-8 md:px-8">
        <div className="hidden justify-center md:flex">
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
