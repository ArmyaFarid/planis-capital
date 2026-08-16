"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { CriteriaSection } from "@/components/criteria-section"
import { ValuesSection } from "@/components/values-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { IntroCurtain } from "@/components/motion/intro-curtain"
import { CustomCursor } from "@/components/motion/custom-cursor"
import { MarqueeBand } from "@/components/marquee-band"
import { GlobeStage } from "@/components/globe/globe-stage"
import { SectionRail } from "@/components/motion/section-rail"
import { MobileProgress } from "@/components/motion/mobile-progress"
import { GyroPrompt } from "@/components/motion/gyro-prompt"
import { ScrollTint } from "@/components/motion/scroll-tint"
import { LanguageProvider } from "@/lib/language-context"

export default function HomePage() {
  return (
    <LanguageProvider>
      <SmoothScroll />
      <IntroCurtain />
      <CustomCursor />
      <GlobeStage />
      <SectionRail />
      <MobileProgress />
      <GyroPrompt />
      <ScrollTint />
      <main className="min-h-screen bg-background">
        <Navigation />
        <HeroSection />
        <AboutSection />
        <MarqueeBand />
        <CriteriaSection />
        <ValuesSection />
        <PortfolioSection />
        <MarqueeBand className="border-y-0" />
        <ContactSection />
        <Footer />
      </main>
    </LanguageProvider>
  )
}
