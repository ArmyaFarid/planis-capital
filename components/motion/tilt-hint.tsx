"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * A phone rocking side to side.
 *
 * Shows the gesture rather than naming it — "tilt your phone" is an instruction people
 * read and ignore, whereas a rocking handset is understood without reading anything, and
 * works the same in both languages.
 */
export function TiltHint({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={cn("h-7 w-7 overflow-visible", className)}
      fill="none"
      aria-hidden="true"
      animate={{ rotate: [-14, 14, -14] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "24px 30px" }}
    >
      {/* Handset */}
      <rect
        x="16"
        y="10"
        width="16"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line x1="21" y1="15" x2="27" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Motion arcs, fading in on the outstroke of each rock */}
      <motion.path
        d="M8 20 A 18 18 0 0 0 8 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.15, 0.9, 0.15] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M40 20 A 18 18 0 0 1 40 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ opacity: [0.9, 0.15, 0.9] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  )
}
