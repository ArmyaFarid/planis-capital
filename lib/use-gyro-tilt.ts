"use client"

import { useEffect, useState } from "react"
import { useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { isGyroGranted, subscribeGyro } from "./gyro"

/** Degrees of rotation at full tilt, before the per-layer strength multiplier. */
const ROTATE_RANGE = 14
/** Pixels of translation at full tilt, before the multiplier. */
const SHIFT_RANGE = 26
/** Beyond this the reading is treated as the user repositioning, not aiming. */
const CLAMP = 28

/**
 * Device-orientation parallax, scaled per layer.
 *
 * Call it with a different `strength` in each layer and move them at different rates —
 * that difference is what produces depth. A single layer tilting on its own just looks
 * like a wobble.
 *
 * iOS 13+ requires a gesture-triggered grant, so this never asks on its own: it waits for
 * lib/gyro to report permission. Android and iPadOS report without a prompt. Springs
 * rather than raw readings keep it from jittering on sensor noise.
 */
export function useGyroTilt(strength = 1) {
  const reduce = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const springCfg = { stiffness: 90, damping: 20, mass: 0.6 }
  const sx = useSpring(rawX, springCfg)
  const sy = useSpring(rawY, springCfg)

  // Rotation in degrees and translation in px, both from the same normalised source.
  const rx = useTransform(sx, (v) => v * ROTATE_RANGE * strength)
  const ry = useTransform(sy, (v) => v * ROTATE_RANGE * strength)
  const tx = useTransform(sy, (v) => v * SHIFT_RANGE * strength)
  const ty = useTransform(sx, (v) => -v * SHIFT_RANGE * strength)

  // Re-runs when permission is granted, so the listener attaches the moment the user
  // accepts rather than only on the next mount.
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    setAllowed(isGyroGranted())
    return subscribeGyro(setAllowed)
  }, [])

  useEffect(() => {
    if (reduce || !allowed) return
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return
    // Coarse pointer only: a laptop with an accelerometer would tilt from desk vibration.
    if (!window.matchMedia("(pointer: coarse)").matches) return

    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0 // front-back
      const gamma = e.gamma ?? 0 // left-right
      const clamp = (v: number) => Math.max(-CLAMP, Math.min(CLAMP, v)) / CLAMP
      // beta is offset by ~45deg because a phone is held tilted back, not flat.
      rawX.set(-clamp(beta - 45))
      rawY.set(clamp(gamma))
    }

    window.addEventListener("deviceorientation", onOrient)
    return () => window.removeEventListener("deviceorientation", onOrient)
  }, [reduce, allowed, rawX, rawY])

  return { rx, ry, tx, ty, allowed }
}
