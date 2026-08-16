"use client"

import { useRef, type ReactNode } from "react"

import { motion, useInView, useReducedMotion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"
import { VIEWPORT, fadeUp, staggerParentWith } from "@/lib/motion"
/**
 * Narrowed to real HTML tags on purpose. React's ElementType now also covers three.js
 * elements (R3F augments the global JSX namespace), and those declare `children: never`,
 * which makes a generic `as` prop fail to typecheck.
 */
type HtmlTag = keyof HTMLElementTagNameMap


interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds. Use for one-off ordering; prefer RevealGroup for lists. */
  delay?: number
  variants?: Variants
  as?: HtmlTag
}

/**
 * Scroll-triggered reveal. Replaces the five hand-rolled IntersectionObserver copies
 * that used to live in about/criteria/values/portfolio/contact.
 *
 * Driven by an explicit `useInView` + `animate` rather than `whileInView`. The two are
 * equivalent while reveals are one-shot, but once they replay (`VIEWPORT.once: false`)
 * `whileInView` can strand an element on "hidden" while it is plainly on screen —
 * observed on the footer, which sits at the document end and so gets no further scroll
 * events to correct itself. Reading the boolean and mapping it to a variant label makes
 * the visible state a pure function of "is it in view", which cannot desynchronise.
 */
export function Reveal({ children, className, delay = 0, variants = fadeUp, as = "div" }: RevealProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, VIEWPORT)
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </Comp>
  )
}

interface RevealGroupProps {
  children: ReactNode
  className?: string
  /** Seconds between each direct child. */
  stagger?: number
  delayChildren?: number
  as?: HtmlTag
}

/**
 * Staggers its direct `RevealItem` children. The parent carries no visual variant of its
 * own, so it can be the grid container without fighting the layout.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0.05,
  as = "div",
}: RevealGroupProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, VIEWPORT)
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerParentWith(stagger, delayChildren)}
    >
      {children}
    </Comp>
  )
}

interface RevealItemProps {
  children: ReactNode
  className?: string
  variants?: Variants
  as?: HtmlTag
}

export function RevealItem({ children, className, variants = fadeUp, as = "div" }: RevealItemProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp className={cn(className)} variants={variants}>
      {children}
    </Comp>
  )
}
