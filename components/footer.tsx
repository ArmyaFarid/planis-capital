"use client"

import Image from "next/image"
import Link from "next/link"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()
  
  const menuLinks = [
    { href: "#a-propos", label: t("nav.about") },
    { href: "#nos-criteres", label: t("nav.criteria") },
    { href: "#nos-valeurs", label: t("nav.values") },
    { href: "#portefeuille", label: t("nav.portfolio") },
  ]

  return (
    <footer className="relative overflow-hidden bg-primary pt-16">
      <div className="container mx-auto px-4 md:px-8">
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" stagger={0.12}>
          {/* Logo, description & contact */}
          <RevealItem className="lg:col-span-2">
            {/* 1500x1080 intrinsic — the old 160x50 props declared the wrong ratio and
                reserved the wrong space. TODO(client): a real logo-white.png would avoid
                brightness-0 invert flattening the red "capital" to white. */}
            <Image
              src="/images/logo.png"
              alt="Planis Capital"
              width={1500}
              height={1080}
              className="mb-6 h-16 w-auto brightness-0 invert md:h-14"
            />
            <p className="text-primary-foreground/60 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>
            <Link
              href="#contact"
              className="mt-6 inline-block text-primary-foreground/60 hover:text-accent transition-colors duration-300"
            >
              {t("nav.contact")}
            </Link>
          </RevealItem>

          {/* Menu */}
          <RevealItem>
            <h4 className="text-primary-foreground font-medium mb-6 uppercase tracking-wider text-sm">
              {t("footer.menu")}
            </h4>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/60 hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RevealItem>

        </RevealGroup>

        {/* Bottom */}
        <Reveal className="mt-16 pt-8 pb-10 border-t border-primary-foreground/10 flex justify-center md:justify-start">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Planis Capital Ltd. {t("footer.rights")}
          </p>
        </Reveal>
      </div>
    </footer>
  )
}
