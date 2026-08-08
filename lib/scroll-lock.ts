import type Lenis from "lenis"

// SmoothScroll mounts once at the app root, so a module singleton is enough — no context
// plumbing for a value with exactly one producer and one consumer.
let lenis: Lenis | null = null

export function registerLenis(instance: Lenis | null) {
  lenis = instance
}

/**
 * Locks page scrolling.
 *
 * `overflow: hidden` is deliberately not the mechanism here — it does not hold. Lenis
 * drives the page with programmatic scroll calls that ignore overflow, so the page keeps
 * moving behind the overlay (verified in-browser). Pinning the body with `position: fixed`
 * removes the scroll container outright, which also stops iOS rubber-banding.
 *
 * Returns the matching unlock. Pass `restore: false` when the overlay is closing *because*
 * the user picked a destination — restoring the old position would clobber that jump.
 */
export function lockScroll(): (restore?: boolean) => void {
  const body = document.body
  const y = window.scrollY

  const previous = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    overflow: body.style.overflow,
  }

  lenis?.stop()
  body.style.position = "fixed"
  body.style.top = `-${y}px`
  body.style.left = "0"
  body.style.right = "0"
  body.style.overflow = "hidden"

  return (restore = true) => {
    Object.assign(body.style, previous)

    // While the body was pinned the native scroll position collapsed to 0, and Lenis
    // observed that. Restoring has to happen after the layout is back and after Lenis is
    // running again, otherwise its next frame drives the page straight back to 0.
    lenis?.start()
    requestAnimationFrame(() => {
      lenis?.resize()
      if (!restore) return
      window.scrollTo(0, y)
      lenis?.scrollTo(y, { immediate: true, force: true })
    })
  }
}

/** Scrolls to a `#hash` target, through Lenis when it's driving, natively otherwise. */
export function scrollToHash(hash: string, offset: number) {
  const target = document.querySelector(hash)
  if (!target) return

  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset })
    return
  }
  const top = target.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: "smooth" })
}
