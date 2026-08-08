"use client"

import { useEffect } from "react"
import { useReducedMotion, useTransform } from "motion/react"
import { gyroX, gyroY, startGyroSource } from "./gyro-source"

/** Degrees of rotation at full tilt, before the per-layer strength multiplier. */
const ROTATE_RANGE = 14
/** Pixels of translation at full tilt, before the multiplier. */
const SHIFT_RANGE = 26

/**
 * Device-orientation parallax, scaled per layer.
 *
 * Call it with a different `strength` in each layer and move them at different rates —
 * that difference is what produces depth. A single layer tilting on its own just reads as
 * a wobble.
 *
 * Cheap by design: this only derives transforms from the shared source in gyro-source.ts.
 * No listener and no spring per call site, so it can be used freely across the page.
 */
export function useGyroTilt(strength = 1) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!reduce) startGyroSource()
  }, [reduce])

  const scale = reduce ? 0 : strength

  // Rotation in degrees and translation in px, both from the same normalised source.
  const rx = useTransform(gyroX, (v) => v * ROTATE_RANGE * scale)
  const ry = useTransform(gyroY, (v) => v * ROTATE_RANGE * scale)
  const tx = useTransform(gyroY, (v) => v * SHIFT_RANGE * scale)
  const ty = useTransform(gyroX, (v) => -v * SHIFT_RANGE * scale)

  return { rx, ry, tx, ty }
}
