# Planis Capital — project handoff

State as of the end of the redesign/motion work. Everything below is verified: lint clean,
`tsc --noEmit` clean, `next build` passing with error-suppression removed.

---

## Running it

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"   # pnpm 11 needs Node 22+
pnpm dev            # or: npm run dev  (skips pnpm's Node requirement entirely)
```

| Command | Note |
|---|---|
| `pnpm dev` | needs the Node 22 export above |
| `npm run dev` | works on the default Node 20 — simplest |
| `pnpm build && pnpm start` | production |
| `pnpm lint` | ESLint 9 (see "Gotchas") |
| `./node_modules/.bin/tsc --noEmit` | typecheck |

### Preview flags

| URL | Effect |
|---|---|
| `?no3d=1` | forces the 2D globe fallback on any device |
| `?gyro=1` | forces the tilt-permission bar to appear on any device |

Intro curtain is once per tab session — `sessionStorage.clear()` or a new tab to replay it.

### Testing device tilt

**iOS requires HTTPS.** Device-orientation events never fire over `http://`, permission or
not. Use `npm run dev -- --experimental-https`, then `https://<lan-ip>:3000` and accept the
certificate warning. Android works over plain HTTP with no prompt at all.

---

## Architecture

### Motion system
- `lib/motion.ts` — shared variants (`fadeUp`, `cardIn`, `cardIn3D`, `maskUp`), easing
  constants, and `VIEWPORT` (the shared `whileInView` trigger). Easing values mirror the
  CSS custom properties in `app/globals.css` — **keep the two in step.**
- `components/motion/reveal.tsx` — `Reveal` / `RevealGroup` / `RevealItem`. Replaced five
  hand-rolled IntersectionObserver copies.
- `components/motion/animated-text.tsx` — `AnimatedWords`, `AnimatedChars` (+ gradient
  sweep), `AnimatedParagraph`, `AnimatedRule`.
- Other primitives: `magnetic`, `tilt-card`, `weight-scroll`, `scramble-text`,
  `kinetic-wordmark`, `custom-cursor`, `intro-curtain`, `scroll-tint`, `section-rail`,
  `mobile-progress`.

### 3D globe
- `lib/globe-geo.ts` + `lib/africa-geo.ts` — **generated**, do not hand-edit. Regenerate
  with the sibling `.gen.mjs` scripts (need `d3-geo` + `topojson-*`, dev-only).
- `components/globe/globe-scene.tsx` — the R3F scene (lazy, `ssr: false`).
- `components/globe/hero-globe.tsx` — capability probe, error boundary, 2D↔3D crossfade,
  and the `FORCE_2D_FALLBACK` switch.
- `components/globe/globe-fallback.tsx` — pure SVG/CSS globe, no GPU.
- `components/globe/globe-stage.tsx` — desktop only; pins the globe across sections and
  flies it to a city per section.
- `components/globe/mobile-globe.tsx` — mobile uses the **2D** globe deliberately (at
  ~340px the WebGL detail is imperceptible and costs 246KB + battery).

### Tilt (gyroscope)
- `lib/gyro.ts` — iOS permission. **In-memory, not sessionStorage**: iOS does not carry a
  grant across page loads, so suppressing per-session would leave the feature permanently
  dead after one reload.
- `lib/gyro-source.ts` — **one** listener and one smoothing loop shared by all consumers.
- `lib/use-gyro-tilt.ts` — `useGyroTilt(strength)`, cheap transforms only.

Per-layer strengths (the *differences* are what create depth):
hero copy 0.5 · backdrop 0.9 · globe 1.0 · stats 0.4 · marquee 0.45 · sector card 1.0 ·
criteria 0.55 · values numerals 0.9 · portfolio 0.8 · policy 0.3 · contact 0.7 · footer 0.6

---

## Open items (need the client)

1. **`SITE_URL` in `lib/site.ts`** is a guess (`https://planiscapital.com`). OG images and
   canonical URLs break silently if wrong. **Highest priority.**
2. **Stat values** — `STATS` in `components/stats-strip.tsx`. Founding year and countries
   render `—`; sectors (4) and portfolio companies (1) are real.
3. **`public/images/sector-distribution.jpg`** missing — that card shows a placeholder.
4. **Favicon** is still the stock v0 "V" mark (`public/icon.svg`, `icon-*.png`).
5. **`logo-white.png`** absent, so `brightness-0 invert` flattens the red "capital".

---

## Known risks / not done

- **No version control.** Biggest production risk: no history, no rollback, no review.
  `git init` before anything else. It is also why known-dead files were left in place —
  `styles/globals.css` (orphan, not imported) and `components/theme-provider.tsx` (zero
  references) — deletions are unrecoverable here.
- **55 of 56 `components/ui/*` are unused** (only `accordion` is imported). Tree-shaken, so
  no bundle cost; repo noise only.
- **Bundle: ~522KB gz total, ~228KB of it three.js.** Code-split and lazy; mobile never
  downloads it.
- **The `.dark` block in `app/globals.css`** still holds stock shadcn values while the navy
  palette lives in `:root`. Harmless today, but wiring up `next-themes` would break the brand.
- **Unused translation key** `hero.subtitle` — the hero eyebrow was removed as redundant
  with the logo.

---

## Gotchas that cost real time

- **pnpm needs Node 22+**; the shell defaults to 20. `npm run dev` sidesteps it.
- **`pnpm-workspace.yaml` `allowBuilds`** must list `sharp` and `unrs-resolver`, or *every*
  pnpm command fails its deps check.
- **ESLint must stay on v9.** `eslint-plugin-react` (via `eslint-config-next`) does not
  support ESLint 10's context API, and `FlatCompat` crashes ESLint 10 outright.
- **`ignoreBuildErrors` was removed** — do not put it back. It hid a real type error.
- **Tailwind v4 `@custom-variant`**: the shorthand `(@media ...)` form silently emits
  nothing. Use the block form with `@slot` (see `can-hover`).
- **motion**: `y` and `translateY` are the *same* property. Putting scroll parallax and
  gyro on one element makes the second silently overwrite the first — nest two layers.
- **motion cannot animate `offset-distance`** (resolves to px, percentage keyframes never
  take). The map's travelling pulses are CSS keyframes for this reason.
- **`whileInView` inside an `overflow-hidden` carousel never fires** for off-screen slides —
  IntersectionObserver honours ancestor clipping. Hence `SectorCard`'s `inCarousel` prop.
- **`bg-[inherit]` resolves to transparent** (background-color is not inherited). Sticky
  headings need their section's real colour.
