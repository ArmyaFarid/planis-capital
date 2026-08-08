"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { TiltCard } from "@/components/motion/tilt-card"
import { SectorCard, type SectorCardProps } from "./sector-card"
import { SectorCarousel } from "./sector-carousel"

interface SectorShowcaseProps {
  sectors: SectorCardProps[]
}

/**
 * Pins the section and moves the sector cards sideways as you scroll down.
 *
 * Only above lg. Below that it falls back to the ordinary stacked grid: pinning plus
 * horizontal translation on a phone fights the native scroll direction and is a common
 * way to make a site feel broken on touch.
 */
export function SectorShowcase({ sectors }: SectorShowcaseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // Measured, not a hardcoded percentage. A percentage on `x` resolves against the track's
  // own width, so any guess is wrong at every viewport except the one it was tuned on —
  // overshoot scrolls the cards clean off and leaves the tail of the pin empty.
  const [travel, setTravel] = useState(0)

  useEffect(() => {
    const measure = () => {
      const visible = viewportRef.current?.clientWidth ?? 0
      const total = trackRef.current?.scrollWidth ?? 0
      setTravel(Math.max(0, total - visible))
    }
    measure()

    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [sectors.length])

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 34, restDelta: 0.001 })
  const x = useTransform(smooth, [0, 1], [0, -travel])

  return (
    <>
      {/* Touch: a swipeable strip whose centred slide opens, standing in for hover. */}
      <SectorCarousel sectors={sectors} />

      {reduce ? (
        <div className="hidden grid-cols-4 gap-4 lg:grid">
          {sectors.map((sector) => (
            <SectorCard key={sector.title} {...sector} />
          ))}
        </div>
      ) : (
        // Full-bleed: this lives inside `container mx-auto px-4`, and clipping the track
        // to the container leaves only ~2 cards visible at a time.
        <div
          ref={ref}
          className="relative left-1/2 hidden h-[240vh] w-screen -translate-x-1/2 lg:block"
        >
          <div ref={viewportRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div ref={trackRef} className="flex gap-6 px-[6vw]" style={{ x }}>
              {sectors.map((sector) => (
                <div key={sector.title} className="w-[38vw] shrink-0 xl:w-[32vw]">
                  <TiltCard max={6}>
                    <SectorCard {...sector} />
                  </TiltCard>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </>
  )
}
