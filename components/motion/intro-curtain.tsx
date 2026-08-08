"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { EASE_OUT_QUART } from "@/lib/motion"
import { lockScroll } from "@/lib/scroll-lock"

const SESSION_KEY = "planis.introShown"

/**
 * Brand curtain on first load. Shown once per tab session — replaying it on every internal
 * navigation turns a flourish into an obstacle.
 */
export function IntroCurtain() {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduce) return
    if (window.sessionStorage.getItem(SESSION_KEY)) return

    window.sessionStorage.setItem(SESSION_KEY, "1")
    setVisible(true)

    const unlock = lockScroll()
    const timer = window.setTimeout(() => setVisible(false), 1700)

    return () => {
      window.clearTimeout(timer)
      unlock(false)
    }
  }, [reduce])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]"
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
