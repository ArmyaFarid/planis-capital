"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { GlobeFallback } from "./globe-fallback"
import { useGyroTilt } from "@/lib/use-gyro-tilt"

/**
 * Phone-sized globe, sitting behind the hero copy.
 *
 * Deliberately the 2D SVG globe, not WebGL: at ~340px the land dots, atmosphere falloff
 * and arc depth that three.js buys are not perceptible, so the 246kb download and the
 * continuous GPU/battery cost buy nothing a phone user can see.
 */
export function MobileGlobe() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 90])
  const tilt = useGyroTilt(1)

  return (
    <motion.div
      className="w-[78vw] max-w-[26rem] opacity-45"
      style={
        reduce
          ? undefined
          : { y, rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 900 }
      }
    >
      <GlobeFallback />
    </motion.div>
  )
}
