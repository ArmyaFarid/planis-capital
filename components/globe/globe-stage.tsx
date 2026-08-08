"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { HeroGlobe } from "./hero-globe"
import { GLOBE_CITIES } from "@/lib/globe-geo"
import { useActiveSection, type SectionId } from "@/lib/use-active-section"
import type { GlobeFocus } from "./globe-scene"

/**
 * Which African city the globe turns to for each section. Indices are into GLOBE_CITIES:
 * 0 Casablanca, 1 Dakar, 2 Abidjan, 3 Accra, 4 Lagos, 5 Cairo, 6 Nairobi, 7 Johannesburg.
 * Portfolio points at Abidjan because West-ML is a West African business.
 */
const SECTION_CITY: Partial<Record<SectionId, number>> = {
  "a-propos": 4,
  "nos-criteres": 6,
  "nos-valeurs": 7,
  portefeuille: 2,
}

/** Ambient opacity once the globe leaves the hero. It sits above section backgrounds
 *  (they are opaque, so it cannot sit behind them) — keep this low or it fights the copy. */
const AMBIENT_OPACITY = 0.17

export function GlobeStage() {
  const active = useActiveSection()
  const reduce = useReducedMotion()
  const focusRef = useRef<GlobeFocus | null>(null)

  const inHero = active === null
  const cityIndex = active ? SECTION_CITY[active] : undefined
  // Policy and contact have no city: the globe has done its job by then.
  const retired = active != null && cityIndex === undefined

  useEffect(() => {
    if (cityIndex === undefined) {
      focusRef.current = null
      return
    }
    const city = GLOBE_CITIES[cityIndex]
    focusRef.current = { lat: city.lat, lng: city.lng, city: cityIndex }
  }, [cityIndex])

  return (
    <div
      className="pointer-events-none fixed inset-y-0 right-0 z-20 hidden w-1/2 items-center justify-center lg:flex"
      aria-hidden="true"
    >
      <motion.div
        className="flex w-full items-center justify-center"
        initial={false}
        animate={{
          opacity: retired ? 0 : inHero ? 1 : AMBIENT_OPACITY,
          scale: inHero ? 1 : 0.66,
          x: inHero ? 0 : "14%",
          filter: inHero ? "blur(0px)" : "blur(1.5px)",
        }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.25, 1, 0.5, 1] }}
        // Only interactive over the hero — elsewhere it must never eat clicks on the copy.
        style={{ pointerEvents: inHero ? "auto" : "none" }}
      >
        <HeroGlobe focusRef={focusRef} />
      </motion.div>
    </div>
  )
}
