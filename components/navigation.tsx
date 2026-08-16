"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Globe, Menu, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import { cn } from "@/lib/utils"
import { EASE_OUT_EXPO } from "@/lib/motion"
import { lockScroll, scrollToHash } from "@/lib/scroll-lock"

/** Matches the scrolled-header height so anchored sections don't land under the nav. */
const HEADER_OFFSET = -88
import { useLanguage } from "@/lib/language-context"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { language, setLanguage, t } = useLanguage()
  const reduce = useReducedMotion()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 })

  const navLinks = [
    { href: "#a-propos", label: t("nav.about") },
    { href: "#nos-criteres", label: t("nav.criteria") },
    { href: "#nos-valeurs", label: t("nav.values") },
    { href: "#portefeuille", label: t("nav.portfolio") },
    { href: "#contact", label: t("nav.contact") },
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Which section owns the viewport right now, so the nav indicator can follow along.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => Boolean(el))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(`#${visible.target.id}`)
      },
      // Band across the middle of the viewport: a section counts as active once it owns
      // the reading area, not when its top edge merely peeks in.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
    // navLinks is rebuilt each render from t(), but the hrefs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set when the overlay closes because a link was tapped: the unlock must not restore
  // the old scroll position, and the jump has to wait until the body is unpinned.
  const pendingHashRef = useRef<string | null>(null)

  // Lock scrolling while the overlay is up — without this the page moves behind it.
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const unlock = lockScroll()
    return () => {
      const hash = pendingHashRef.current
      pendingHashRef.current = null
      unlock(!hash)
      if (hash) {
        requestAnimationFrame(() => scrollToHash(hash, HEADER_OFFSET))
      }
    }
  }, [isMobileMenuOpen])

  // Escape to close, and keep Tab inside the panel while it's open.
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key !== "Tab") return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || active === triggerRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isMobileMenuOpen])

  const toggleLanguage = () => setLanguage(language === "fr" ? "en" : "fr")

  // The overlay pins the body, so the browser's own anchor jump is a no-op here. Record
  // the destination and let the unlock perform it once the page is scrollable again.
  const handleMobileNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    pendingHashRef.current = href
    setIsMobileMenuOpen(false)
  }

  // The logo needs inverting whenever what's behind it is dark: the hero, or the open
  // mobile panel (which is bg-primary even when the bar itself has turned white).
  const onDark = !isScrolled || isMobileMenuOpen

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isScrolled && !isMobileMenuOpen
          ? "bg-white/95 py-3 shadow-md backdrop-blur-md"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between">
          {/* 1500x1080 intrinsic. The old 260x86 props declared a ratio the file doesn't
              have, so the reserved box never matched the rendered logo. */}
          <Link href="/" className="relative z-50" aria-label="Planis Capital">
            <Image
              src="/images/logo.png"
              alt="Planis Capital"
              width={1500}
              height={1080}
              priority
              className={cn(
                "w-auto transition-all duration-500",
                isScrolled ? "h-14 md:h-14" : "h-16 md:h-20",
                onDark && "brightness-0 invert",
              )}
            />
          </Link>

          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative text-sm font-medium transition-colors duration-300",
                    isActive
                      ? "text-accent"
                      : isScrolled
                        ? "text-[#0A1628] hover:text-accent"
                        : "text-primary-foreground hover:text-accent",
                  )}
                >
                  {link.label}
                  {/* Shared layoutId: the accent bar physically travels between links
                      instead of blinking out and in. */}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              )
            })}

            <button
              onClick={toggleLanguage}
              aria-label={language === "fr" ? "Switch to English" : "Passer en français"}
              className={cn(
                "ml-4 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-300",
                isScrolled
                  ? "border-[#0A1628]/20 text-[#0A1628] hover:border-accent hover:text-accent"
                  : "border-primary-foreground/30 text-primary-foreground hover:border-accent hover:text-accent",
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{language === "fr" ? "EN" : "FR"}</span>
            </button>
          </div>

          <div className="relative z-50 flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleLanguage}
              aria-label={language === "fr" ? "Switch to English" : "Passer en français"}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-1 text-sm font-medium transition-colors duration-300",
                isScrolled && !isMobileMenuOpen
                  ? "border-[#0A1628]/20 text-[#0A1628]"
                  : "border-primary-foreground/30 text-primary-foreground",
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="text-xs uppercase">{language === "fr" ? "EN" : "FR"}</span>
            </button>

            <button
              ref={triggerRef}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center transition-colors duration-300",
                isScrolled && !isMobileMenuOpen ? "text-[#0A1628]" : "text-primary-foreground",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMobileMenuOpen ? "close" : "open"}
                  initial={reduce ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* Reading progress. Only once the bar has gone solid, so it never floats over the hero. */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px origin-left bg-accent"
        style={{ scaleX: progress }}
        animate={{ opacity: isScrolled && !isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            className="fixed inset-0 z-40 bg-primary lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <motion.div
              className="flex h-full flex-col items-center justify-center gap-7"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleMobileNavClick(event, link.href)}
                  className="font-display text-3xl text-primary-foreground transition-colors duration-300 hover:text-accent"
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
