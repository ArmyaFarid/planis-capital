"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { EASE_OUT_QUART } from "@/lib/motion"
import { lockScroll } from "@/lib/scroll-lock"

const HOLD_MS = 1700

/**
 * Brand curtain on first load.
 *
 * Starts `visible` so it is present in the server-rendered HTML and covers the very first
 * paint — deciding in an effect instead would let the hero paint first and drop the
 * curtain on top of it, which looks like content flashing behind a loader.
 *
 * Whether this load actually gets a curtain is decided by the blocking script in
 * layout.tsx (session + reduced-motion), which stamps `data-intro` on <html> before any
 * markup is parsed. CSS hides the curtain instantly for the skip case; this component
 * then unmounts it on hydration.
 */
export function IntroCurtain() {
  const [visible, setVisible] = useState(true)
  const [shouldShow, setShouldShow] = useState<boolean | null>(null)

  useEffect(() => {
    const show = document.documentElement.dataset.intro === "show"
    // Syncs React state from an external system on mount (reads the data-intro attribute set before hydration). There is no
    // render-time source for it, and reading during render breaks hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldShow(show)
    if (!show) setVisible(false)
  }, [])

  // Keyed on `visible` so hiding the curtain runs the cleanup and releases the lock.
  // Locking in the effect above would only ever unlock on unmount.
  useEffect(() => {
    if (!shouldShow || !visible) return
    const unlock = lockScroll()
    const timer = window.setTimeout(() => setVisible(false), HOLD_MS)
    return () => {
      window.clearTimeout(timer)
      unlock()
    }
  }, [shouldShow, visible])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="curtain"
          className="intro-curtain fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1, ease: EASE_OUT_QUART }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.4 } }}
            transition={{ duration: 0.9, ease: EASE_OUT_QUART }}
            className="flex flex-col items-center"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={1500}
              height={1080}
              priority
              className="h-24 w-auto brightness-0 invert md:h-28"
            />
            <motion.div
              className="mt-6 h-px w-40 origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: EASE_OUT_QUART, delay: 0.25 }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
