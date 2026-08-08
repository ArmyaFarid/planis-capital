"use client"

import { motion, useReducedMotion } from "motion/react"
import { EASE_OUT_QUART, VIEWPORT, fadeUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedWordsProps {
  text: string
  className?: string
  /**
   * "parent" inherits hidden/visible from an enclosing motion parent (hero, where the
   * headline is one item in a larger sequence). "view" triggers itself on scroll.
   */
  trigger?: "parent" | "view"
  stagger?: number
  delay?: number
}

/**
 * Word-by-word wipe. Each word rides up from under its own overflow mask, which reads as
 * typesetting rather than as a block sliding into place.
 */
export function AnimatedWords({
  text,
  className,
  trigger = "parent",
  stagger = 0.07,
  delay = 0,
}: AnimatedWordsProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <span className={className}>{text}</span>
  }

  const words = text.split(" ")

  const outer =
    trigger === "view"
      ? ({
          initial: "hidden",
          whileInView: "visible",
          viewport: VIEWPORT,
        } as const)
      : {}

  return (
    <motion.span
      className={cn("inline-block", className)}
      {...outer}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%" },
              visible: { y: "0%", transition: { duration: 1.15, ease: EASE_OUT_QUART } },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/**
 * Body copy fades up as one block.
 *
 * Deliberately NOT split per word: a long paragraph becomes ~100 independently animating
 * elements, which janks on scroll and makes the text visibly assemble itself while you are
 * trying to read it. Word-splitting earns its cost on a short headline, not on body copy.
 */
export function AnimatedParagraph({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <p className={className}>{text}</p>
  }

  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={fadeUp}
      transition={{ delay }}
    >
      {text}
    </motion.p>
  )
}

/** Hairline that draws itself across on reveal. Used as a section divider. */
export function AnimatedRule({ className }: { className?: string }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={cn("h-px w-full origin-left bg-current opacity-20", className)}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.4, ease: EASE_OUT_QUART }}
    />
  )
}
