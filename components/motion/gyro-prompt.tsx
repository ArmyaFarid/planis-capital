"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"
import { TiltHint } from "./tilt-hint"
import { EASE_OUT_QUART } from "@/lib/motion"
import { markGyroAsked, requestGyro, shouldOfferGyro } from "@/lib/gyro"
import { useLanguage } from "@/lib/language-context"

/**
 * One-time iOS prompt for device-orientation access.
 *
 * Only appears where a grant is actually required (iOS + touch), never on Android or
 * desktop. Deliberately opt-in and dismissible: an unexplained system permission dialog
 * on page load is hostile, so this asks in the page first, in the user's language.
 */
export function GyroPrompt() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [coaching, setCoaching] = useState(false)

  useEffect(() => {
    if (!shouldOfferGyro()) return

    // Preview flag shows immediately so the design can be checked.
    if (new URLSearchParams(window.location.search).has("gyro")) {
      // Syncs React state from an external system on mount (reads the URL). There is no
      // render-time source for it, and reading during render breaks hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true)
      return
    }

    // Offered straight away. The only wait is for the intro curtain to clear — the bar
    // sits above it, and asking while the logo is still covering the screen would be
    // asking about something the visitor cannot see yet.
    const curtainRunning = document.documentElement.dataset.intro === "show"
    const timer = window.setTimeout(() => setVisible(true), curtainRunning ? 2600 : 500)
    return () => window.clearTimeout(timer)
  }, [])

  const accept = async () => {
    // Must run synchronously off the tap — iOS rejects a deferred requestPermission.
    const ok = await requestGyro()
    setVisible(false)
    if (!ok) return
    // Granting is silent otherwise: without a cue people put the phone down and never
    // discover the effect they just enabled.
    setCoaching(true)
    window.setTimeout(() => setCoaching(false), 3200)
  }

  const dismiss = () => {
    markGyroAsked()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-x-4 z-[110] flex items-center gap-3 border border-primary-foreground/20 bg-[#0A1628] px-4 py-3 shadow-2xl xl:hidden"
          style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
        >
          <TiltHint className="shrink-0 text-accent" />

          <p className="flex-1 text-sm leading-snug text-primary-foreground/85">
            {t("gyro.hint")}
          </p>

          <button
            onClick={accept}
            className="shrink-0 bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground"
          >
            {t("gyro.enable")}
          </button>
          <button
            onClick={dismiss}
            aria-label={t("gyro.dismiss")}
            className="shrink-0 p-1 text-primary-foreground/50"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}

      {coaching ? (
        <motion.div
          key="coach"
          className="pointer-events-none fixed inset-x-0 bottom-28 z-[110] flex flex-col items-center gap-3 xl:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
        >
          <TiltHint className="h-12 w-12 text-accent" />
          <span className="text-sm font-medium text-primary-foreground/80">{t("gyro.hint")}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
