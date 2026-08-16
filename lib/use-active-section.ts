"use client"

import { useEffect, useState } from "react"

/** Section anchors in document order. The index rail's numbering depends on this order. */
export const SECTION_IDS = [
  "a-propos",
  "nos-criteres",
  "nos-valeurs",
  "portefeuille",
  "contact",
] as const

export type SectionId = (typeof SECTION_IDS)[number]

/**
 * Which section currently owns the reading area, or null while the hero is in view.
 *
 * The band is deliberately narrow (middle 10% of the viewport): a section counts as
 * active once it holds the centre, not when its top edge merely peeks in — otherwise the
 * value thrashes between two sections at every boundary.
 */
export function useActiveSection() {
  const [active, setActive] = useState<SectionId | null>(null)

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id as SectionId)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    sections.forEach((s) => observer.observe(s))

    // Above the first section there is no active entry — fall back to null so the hero
    // can be treated as its own state rather than inheriting "a-propos".
    const onScroll = () => {
      const first = sections[0]
      if (window.scrollY + window.innerHeight * 0.55 < first.offsetTop) setActive(null)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return active
}
