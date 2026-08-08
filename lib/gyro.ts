"use client"

/**
 * Device-orientation permission, which is only a thing on iOS 13+.
 *
 * Everywhere else the sensor reports freely, so `granted` starts true there and the
 * prompt never appears. On iOS `requestPermission()` must be called from a real user
 * gesture and the grant does not survive a reload, so this is session-scoped: we ask once
 * per session, and remember a refusal so we never nag.
 */

/**
 * Deliberately in-memory rather than sessionStorage.
 *
 * iOS does not carry a device-orientation grant across page loads — requestPermission()
 * has to be called again from a fresh gesture every time. So suppressing the prompt for
 * the rest of the session would leave the feature permanently dead after one reload:
 * permission gone, but no way left to re-ask. Resetting per load is the only behaviour
 * that matches the platform.
 */
let askedThisLoad = false

type Listener = (granted: boolean) => void

let granted = false
let initialised = false
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((fn) => fn(granted))
}

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">
}

/** True only where an explicit gesture-triggered grant is required (iOS). */
export function needsGyroPermission() {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false
  return typeof (window.DeviceOrientationEvent as OrientationCtor).requestPermission === "function"
}

export function isGyroGranted() {
  if (!initialised) {
    initialised = true
    // No permission model here — the sensor is already readable.
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window && !needsGyroPermission()) {
      granted = true
    }
  }
  return granted
}

export function subscribeGyro(fn: Listener) {
  listeners.add(fn)
  // Braced deliberately: Set.delete returns a boolean, and returning that from a
  // useEffect makes React treat it as an invalid cleanup.
  return () => {
    listeners.delete(fn)
  }
}

/** Whether the prompt should be offered: iOS, touch, and not already asked this session. */
export function shouldOfferGyro() {
  if (typeof window === "undefined") return false

  // Preview escape hatch: ?gyro=1 shows the bar on any device. The real prompt only ever
  // appears on iOS Safari, which cannot be reproduced by devtools device emulation —
  // requestPermission simply does not exist outside it.
  if (new URLSearchParams(window.location.search).has("gyro")) return true

  if (!needsGyroPermission()) return false
  if (!window.matchMedia("(pointer: coarse)").matches) return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  return !askedThisLoad && !granted
}

/** Suppresses re-offering within this page view only; a reload offers again. */
export function markGyroAsked() {
  if (new URLSearchParams(window.location.search).has("gyro")) return
  askedThisLoad = true
}

/** Must be called synchronously from a user gesture, or iOS rejects it outright. */
export async function requestGyro(): Promise<boolean> {
  markGyroAsked()
  if (!needsGyroPermission()) {
    granted = true
    emit()
    return true
  }
  try {
    const result = await (window.DeviceOrientationEvent as OrientationCtor).requestPermission!()
    granted = result === "granted"
  } catch {
    granted = false
  }
  emit()
  return granted
}
