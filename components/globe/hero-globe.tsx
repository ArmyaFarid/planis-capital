"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"
import { AfricaMap } from "@/components/africa-map"
import { cn } from "@/lib/utils"

// three + R3F is ~150kb gz. Keep it out of the main bundle and off the server.
const GlobeScene = dynamic(() => import("./globe-scene"), {
  ssr: false,
  loading: () => null,
})

interface HeroGlobeProps {
  className?: string
}

export function HeroGlobe({ className }: HeroGlobeProps) {
  const reduce = useReducedMotion()
  const [webglOk, setWebglOk] = useState<boolean | null>(null)
  const scrollRef = useRef(0)

  useEffect(() => {
    // Probe once. Older phones and locked-down browsers still fail this.
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl")
      setWebglOk(Boolean(ctx))
    } catch {
      setWebglOk(false)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      // 0 at the top of the hero, 1 once it has scrolled a full viewport away.
      scrollRef.current = Math.min(window.scrollY / window.innerHeight, 1)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Reduced motion or no WebGL: the flat map is the honest fallback, not a blank hole.
  if (reduce || webglOk === false) {
    return <AfricaMap className={cn("h-[min(44vh,24rem)] w-auto", className)} />
  }

  return (
    <div className={cn("relative aspect-square w-full max-w-[34rem]", className)}>
      {webglOk ? <GlobeScene scrollRef={scrollRef} /> : null}
    </div>
  )
}
