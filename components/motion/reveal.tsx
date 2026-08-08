"use client"

import type { ElementType, ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"
import { VIEWPORT, fadeUp, staggerParentWith } from "@/lib/motion"

interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds. Use for one-off ordering; prefer RevealGroup for lists. */
  delay?: number
  variants?: Variants
  as?: ElementType
}

/**
 * Scroll-triggered reveal. Replaces the five hand-rolled IntersectionObserver copies
 * that used to live in about/criteria/values/portfolio/contact.
 */
export function Reveal({ children, className, delay = 0, variants = fadeUp, as = "div" }: RevealProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as as ElementType
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
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
  as?: ElementType
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
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as as ElementType
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
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
  as?: ElementType
}

export function RevealItem({ children, className, variants = fadeUp, as = "div" }: RevealItemProps) {
  const reduce = useReducedMotion()
  const Comp = motion[as as keyof typeof motion] as typeof motion.div

  if (reduce) {
    const Static = as as ElementType
    return <Static className={className}>{children}</Static>
  }

  return (
    <Comp className={cn(className)} variants={variants}>
      {children}
    </Comp>
  )
}
