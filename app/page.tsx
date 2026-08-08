"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { CriteriaSection } from "@/components/criteria-section"
import { ValuesSection } from "@/components/values-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { PolicySection } from "@/components/policy-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { LanguageProvider } from "@/lib/language-context"

export default function HomePage() {
  return (
    <LanguageProvider>
      <SmoothScroll />
      <main className="min-h-screen bg-background">
        <Navigation />
        <HeroSection />
        <AboutSection />
        <CriteriaSection />
        <ValuesSection />
        <PortfolioSection />
        <PolicySection />
        <ContactSection />
        <Footer />
      </main>
    </LanguageProvider>
  )
}
