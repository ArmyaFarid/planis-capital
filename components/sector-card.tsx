"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useGyroTilt } from "@/lib/use-gyro-tilt"
import { EASE_OUT_QUART, VIEWPORT } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface SectorCardProps {
  /** Omit when no photo exists yet — the card falls back to a tinted plate. */
  image?: string
  title: string
  description: string
  overlayColor?: string
  /** Touch equivalent of hover: the carousel's centred slide is "active". */
  active?: boolean
  /**
   * Disables the scroll-triggered entrance. Required for both sliding tracks — the mobile
   * carousel and the desktop showcase. Their slides sit in an overflow-hidden container,
   * and IntersectionObserver honours ancestor clipping, so an off-screen slide has zero
   * intersection, whileInView never fires, and the card is left permanently at clipPath
   * inset(0 0 100% 0), i.e. invisible. Now that reveals replay this is not self-correcting
   * either: a card can revert to hidden and never get another trigger. Each track supplies
   * its own motion — horizontal travel, and per-slide scale/opacity — so nothing is lost.
   */
  inCarousel?: boolean
}

/**
 * Hover swaps the title plate for the full description on pointer devices. Touch devices
 * have no hover, so the description is opened by tapping the card — the ⊕ button is the
 * affordance that says so, and it only exists below the `can-hover` guard.
 */
export function SectorCard({
  image,
  title,
  description,
  overlayColor = "bg-primary/50",
  active = false,
  inCarousel = false,
}: SectorCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // Touch-only open state. Pointer devices never read it — hover owns them entirely.
  const [open, setOpen] = useState(false)

  // Swiping to another card closes this one, so you never leave a trail of open cards
  // behind you in the carousel. Adjusted during render rather than in an effect: this is
  // state derived from a prop change, which React prescribes this exact pattern for.
  const [wasActive, setWasActive] = useState(active)
  if (wasActive !== active) {
    setWasActive(active)
    if (!active) setOpen(false)
  }

  const gyro = useGyroTilt(0.7)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  // Image drifts slower than the card, so the crop feels like a window onto the scene.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return
        e.preventDefault()
        setOpen((o) => !o)
      }}
      className="group relative aspect-[4/5] overflow-hidden can-hover:cursor-default"
      initial={reduce || inCarousel ? false : { clipPath: "inset(0 0 100% 0)" }}
      whileInView={inCarousel ? undefined : { clipPath: "inset(0 0 0% 0)" }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE_OUT_QUART }}
    >
      {/* Second layer: an accent panel that rides up out of the frame just behind the
          card's own reveal, so the image is uncovered rather than simply faded in. */}
      {reduce || inCarousel ? null : (
        <motion.div
          className="absolute inset-0 z-20 bg-accent"
          initial={{ y: "0%" }}
          whileInView={{ y: "-100%" }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE_OUT_QUART, delay: 0.25 }}
        />
      )}
      {/* Two nested layers on purpose: `y` and `translateY` are the same property in
          motion, so putting the scroll parallax and the gyro shift on one element makes
          the second silently overwrite the first. */}
      <motion.div
        className="absolute inset-[-8%]"
        style={reduce ? undefined : { x: gyro.tx, y: gyro.ty }}
      >
        <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imageY }}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
            "object-cover transition-all duration-700 ease-out",
            active ? "scale-105 saturate-100" : "saturate-[0.55]",
            "can-hover:group-hover:scale-110 can-hover:group-hover:saturate-100",
          )}
          />
        ) : (
          // TODO(client): supply a photo for this sector; until then the card holds its
          // place with a tinted plate instead of rendering a broken image.
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--card),var(--background))]">
            <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(45deg,var(--accent)_0_2px,transparent_2px_11px)]" />
          </div>
        )}
        </motion.div>
      </motion.div>

      {/* Readability scrim, always present. */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent" />

      {/* Accent wash: opacity-driven so it can't intercept pointer events when hidden. */}
      <div
        className={cn(
          overlayColor,
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          "can-hover:group-hover:opacity-100",
          active && "opacity-100",
        )}
      />

      {/* Tap affordance. Touch only — on pointer devices hover already reveals the copy,
          so a button telling you to click would be noise. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full",
          "bg-accent text-accent-foreground shadow-lg transition-transform duration-500 ease-out",
          "can-hover:hidden",
          open ? "rotate-[135deg]" : "rotate-0",
        )}
      >
        <Plus className="h-5 w-5" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="pr-14 font-sans text-h3 font-semibold uppercase tracking-tight text-primary-foreground">
          {title}
        </h3>
        <p
          className={cn(
            "mt-3 overflow-hidden pr-14 text-sm leading-relaxed text-primary-foreground/90",
            "transition-all duration-500 ease-out",
            // Touch: opened by tapping the card, not by being the centred slide.
            open ? "max-h-52 opacity-100" : "max-h-0 opacity-0",
            // Pointer devices: hover takes over entirely.
            "can-hover:max-h-0 can-hover:opacity-0",
            "can-hover:group-hover:max-h-52 can-hover:group-hover:opacity-100",
          )}
        >
          {description}
        </p>
      </div>
    </motion.div>
  )
}
