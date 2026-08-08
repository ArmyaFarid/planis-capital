"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { registerLenis } from "@/lib/scroll-lock"

/** Scrolled-state header height, so anchored sections don't land under the nav. */
const HEADER_OFFSET = -88

/**
 * Owns page scrolling. Mounted once at the app root.
 *
 * Deliberately does nothing on touch or under prefers-reduced-motion — smoothing touch
 * fights native momentum and breaks the mobile address-bar collapse. In both cases the
 * browser handles anchors natively, which is why <html> no longer sets scroll-smooth:
 * we add it back below only for the reduced-motion-off native path.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isCoarse = window.matchMedia("(pointer: coarse)").matches

    if (prefersReduced || isCoarse) {
      // No Lenis: let the browser do it. Reduced motion still gets an instant jump
      // because the global media query in globals.css forces scroll-behavior: auto.
      document.documentElement.classList.add("scroll-smooth")
      return () => document.documentElement.classList.remove("scroll-smooth")
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      anchors: { offset: HEADER_OFFSET },
    })

    // Published so the mobile menu can stop it while it locks the page.
    registerLenis(lenis)

    return () => {
      registerLenis(null)
      lenis.destroy()
    }
  }, [])

  return null
}
