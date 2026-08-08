"use client"

import { motionValue } from "motion/react"
import { isGyroGranted, subscribeGyro } from "./gyro"

/**
 * One sensor, one listener, one smoothing loop — shared by every consumer.
 *
 * Previously each useGyroTilt() call attached its own `deviceorientation` handler and its
 * own spring. With tilt applied across the page that reached ~25 handlers plus 25 springs
 * all recomputing from the same reading at sensor rate, which is exactly the kind of thing
 * that makes a phone hot and janky. Consumers now derive cheap transforms from these two
 * shared values instead.
 */

/** Normalised -1..1, already smoothed. */
export const gyroX = motionValue(0)
export const gyroY = motionValue(0)

/** Beyond this the reading is treated as the user repositioning, not aiming. */
const CLAMP = 28
/** Per-frame approach rate. Low enough to swallow sensor noise without feeling laggy. */
const LERP = 0.09

let targetX = 0
let targetY = 0
let started = false
let rafId = 0
let listening = false

function clamp(v: number) {
  return Math.max(-CLAMP, Math.min(CLAMP, v)) / CLAMP
}

function onOrient(e: DeviceOrientationEvent) {
  // beta is offset by ~45deg because a phone is held tilted back, not flat.
  targetX = -clamp((e.beta ?? 0) - 45)
  targetY = clamp(e.gamma ?? 0)
}

function tick() {
  gyroX.set(gyroX.get() + (targetX - gyroX.get()) * LERP)
  gyroY.set(gyroY.get() + (targetY - gyroY.get()) * LERP)
  rafId = requestAnimationFrame(tick)
}

function attach() {
  if (listening) return
  listening = true
  window.addEventListener("deviceorientation", onOrient)
  rafId = requestAnimationFrame(tick)
}

function detach() {
  if (!listening) return
  listening = false
  window.removeEventListener("deviceorientation", onOrient)
  cancelAnimationFrame(rafId)
  targetX = 0
  targetY = 0
  gyroX.set(0)
  gyroY.set(0)
}

/** Idempotent — safe to call from every consumer's effect. */
export function startGyroSource() {
  if (started) return
  started = true

  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return
  // Coarse pointer only: a laptop with an accelerometer would tilt from desk vibration.
  if (!window.matchMedia("(pointer: coarse)").matches) return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  if (isGyroGranted()) attach()
  subscribeGyro((granted) => (granted ? attach() : detach()))

  // Sensors keep reporting in a backgrounded tab on some devices; stop burning frames.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) detach()
    else if (isGyroGranted()) attach()
  })
}
