"use client"

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { AFRICA_ARCS, AFRICA_COUNTRIES, AFRICA_NODES, AFRICA_OUTLINE, AFRICA_VIEWBOX } from "@/lib/africa-geo"

// Bow each arc away from the straight line so overlapping routes stay readable.
function arcPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const len = Math.hypot(dx, dy) || 1
  const bow = len * 0.22
  return `M${from.x},${from.y} Q${mx - (dy / len) * bow},${my + (dx / len) * bow} ${to.x},${to.y}`
}

const COUNTRY_STAGGER = 0.016
const OUTLINE_AT = AFRICA_COUNTRIES.length * COUNTRY_STAGGER + 0.1
const NODES_AT = OUTLINE_AT + 1.1
const ARCS_AT = NODES_AT + 0.35

interface AfricaMapProps {
  className?: string
}

export function AfricaMap({ className }: AfricaMapProps) {
  // defs ids must be unique per instance or a second map steals the first one's gradients.
  const uid = useId().replace(/:/g, "")
  const fillId = `af-fill-${uid}`
  const glowId = `af-glow-${uid}`

  const reduce = useReducedMotion()

  return (
    <svg
      viewBox={AFRICA_VIEWBOX}
      // No h-full/w-full base: the viewBox supplies the intrinsic ratio, so the caller
      // fixes one axis and the other follows. h-full in an auto-height grid cell resolves
      // circularly and blows the row up to thousands of pixels.
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Carte de l'Afrique"
      fill="none"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
        <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Country fills — internal borders read as texture, not as a political map. */}
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: false, margin: "-15% 0px" }}
        variants={{ visible: { transition: { staggerChildren: COUNTRY_STAGGER } } }}
      >
        {AFRICA_COUNTRIES.map((c) => (
          <motion.path
            key={c.id}
            d={c.d}
            fill={`url(#${fillId})`}
            stroke="var(--accent)"
            strokeOpacity="0.22"
            strokeWidth="0.5"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.5 } },
            }}
          />
        ))}
      </motion.g>

      {/* Coastline traced on. Two subpaths: mainland + Madagascar. */}
      <motion.path
        d={AFRICA_OUTLINE}
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-15% 0px" }}
        transition={{
          pathLength: { duration: 2.2, delay: OUTLINE_AT, ease: [0.25, 1, 0.5, 1] },
          opacity: { duration: 0.2, delay: OUTLINE_AT },
        }}
      />

      {/* Trade-route arcs between the city nodes. */}
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: false, margin: "-15% 0px" }}
        variants={{ visible: { transition: { delayChildren: ARCS_AT, staggerChildren: 0.08 } } }}
      >
        {AFRICA_ARCS.map(([a, b]) => (
          <motion.path
            key={`${a}-${b}`}
            d={arcPath(AFRICA_NODES[a], AFRICA_NODES[b])}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="3 5"
            strokeOpacity="0.5"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1, transition: { duration: 1.3, ease: "easeOut" } },
            }}
          />
        ))}
      </motion.g>

      {/* Capital moving along the routes — the one perpetual element, so the hero never
          settles into a still image. offset-path drives it, so it follows the exact curve. */}
      {reduce ? null : (
        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-15% 0px" }}
          transition={{ delay: ARCS_AT + 0.9, duration: 0.6 }}
        >
          {AFRICA_ARCS.map(([a, b], i) => (
            <circle
              key={`pulse-${a}-${b}`}
              r="2.6"
              fill="var(--foreground)"
              filter={`url(#${glowId})`}
              className="route-pulse"
              style={{
                offsetPath: `path("${arcPath(AFRICA_NODES[a], AFRICA_NODES[b])}")`,
                animationDelay: `${i * 0.55}s`,
              }}
            />
          ))}
        </motion.g>
      )}

      {/* City nodes: entrance pop on the group, perpetual halo on the inner circle. */}
      <motion.g
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: false, margin: "-15% 0px" }}
        variants={{ visible: { transition: { delayChildren: NODES_AT, staggerChildren: 0.09 } } }}
      >
        {AFRICA_NODES.map((n, i) => (
          <motion.g
            key={n.name}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } },
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="5"
              fill="var(--accent)"
              animate={reduce ? undefined : { r: [5, 13], opacity: [0.55, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: i * 0.28 }}
            />
            <circle cx={n.x} cy={n.y} r="3.5" fill="var(--foreground)" filter={`url(#${glowId})`} />
          </motion.g>
        ))}
      </motion.g>
    </svg>
  )
}
