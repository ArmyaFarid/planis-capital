"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import useEmblaCarousel from "embla-carousel-react"
import { GyroLayer } from "@/components/motion/gyro-layer"
import { SectorCard, type SectorCardProps } from "./sector-card"
import { cn } from "@/lib/utils"

interface SectorCarouselProps {
  sectors: SectorCardProps[]
}

/** Extra scroll distance, in vh, allotted to each card after the first. */
const VH_PER_CARD = 78

/**
 * Pinned sector carousel for touch.
 *
 * The section holds still while scrolling steps through the cards one at a time, then
 * releases and the page continues. Swiping still works and stays in sync: a manual swipe
 * moves the page to the scroll position that card corresponds to, so the two inputs can
 * never disagree about which card is showing.
 *
 * The centred card is "active", which drives the open state that hover drives on desktop —
 * without it the descriptions are unreachable on a phone.
 */
export function SectorCarousel({ sectors }: SectorCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "center", containScroll: false })
  const [selected, setSelected] = useState(0)
  const reduce = useReducedMotion()
  const pinRef = useRef<HTMLDivElement>(null)

  // Guards against the two inputs fighting: while a finger is down, page scroll must not
  // move the strip; while we are scrolling the page to match a swipe, the scroll handler
  // must not re-issue a carousel move.
  const draggingRef = useRef(false)
  const syncingRef = useRef(false)

  const lastIndex = Math.max(sectors.length - 1, 1)

  /** Page scroll offset that corresponds to a given card. */
  const scrollTopFor = useCallback(
    (index: number) => {
      const el = pinRef.current
      if (!el) return 0
      const travel = el.offsetHeight - window.innerHeight
      return el.offsetTop + (index / lastIndex) * travel
    },
    [lastIndex],
  )

  const onSelect = useCallback(() => {
    if (!embla) return
    const index = embla.selectedScrollSnap()
    setSelected(index)

    // Only realign the page for a swipe the user made, not one we made from scrolling.
    if (!draggingRef.current) return
    syncingRef.current = true
    window.scrollTo({ top: scrollTopFor(index), behavior: "smooth" })
    window.setTimeout(() => {
      syncingRef.current = false
    }, 600)
  }, [embla, scrollTopFor])

  useEffect(() => {
    if (!embla) return
    setSelected(embla.selectedScrollSnap())
    const onDown = () => {
      draggingRef.current = true
    }
    const onSettle = () => {
      draggingRef.current = false
    }
    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    embla.on("pointerDown", onDown)
    embla.on("settle", onSettle)
    return () => {
      embla.off("select", onSelect)
      embla.off("reInit", onSelect)
      embla.off("pointerDown", onDown)
      embla.off("settle", onSettle)
    }
  }, [embla, onSelect])

  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] })

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!embla || reduce || draggingRef.current || syncingRef.current) return
    const index = Math.min(Math.max(Math.round(p * lastIndex), 0), lastIndex)
    if (index !== embla.selectedScrollSnap()) embla.scrollTo(index)
  })

  // Reduced motion: no pin, no scroll hijack — just a readable stack.
  if (reduce) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
        {sectors.map((sector) => (
          <SectorCard key={sector.title} {...sector} active />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={pinRef}
      // Full-bleed so a card can take nearly the whole screen width.
      className="relative left-1/2 w-screen -translate-x-1/2 lg:hidden"
      style={{ height: `calc(100svh + ${lastIndex * VH_PER_CARD}svh)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center">
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {sectors.map((sector, i) => (
              <div key={sector.title} className="min-w-0 shrink-0 grow-0 basis-[86vw] px-2">
                <GyroLayer
                  mode="tilt"
                  strength={i === selected ? 1 : 0.4}
                  className={cn(
                    "transition-all duration-500 ease-out",
                    i === selected ? "scale-100 opacity-100" : "scale-[0.9] opacity-45",
                  )}
                >
                  <SectorCard {...sector} active={i === selected} />
                </GyroLayer>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {sectors.map((sector, i) => (
            <button
              key={sector.title}
              onClick={() => {
                draggingRef.current = true
                embla?.scrollTo(i)
                window.setTimeout(() => {
                  draggingRef.current = false
                }, 50)
              }}
              aria-label={sector.title}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === selected ? "w-6 bg-accent" : "w-1.5 bg-foreground/25",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
