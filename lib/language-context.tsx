"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { flushSync } from "react-dom"

type Language = "fr" | "en"

const STORAGE_KEY = "planis.language"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.about": "À Propos",
    "nav.criteria": "Nos Critères",
    "nav.values": "Nos Valeurs",
    "nav.portfolio": "Portefeuille",
    "nav.contact": "Nous Contacter",
    
    // Hero
    "hero.subtitle": "Planis Capital",
    "hero.title1": "Capital stratégique.",
    "hero.title2": "Croissance durable.",
    "hero.description": "Nous investissons durablement dans les personnes, les idées et les infrastructures stratégiques nécessaires pour accélérer le développement de l'économie africaine.",
    "hero.cta1": "Découvrir notre mission",
    "hero.cta2": "Nous contacter",
    "hero.scroll": "Défiler",
    "gyro.enable": "Activer",
    "gyro.hint": "Inclinez votre téléphone pour explorer",
    "gyro.dismiss": "Ignorer",

    // About
    "about.section": "01 — À Propos",
    "about.title": "Investir dans l'avenir de l'Afrique",
    "about.p1": "Planis Capital est une société de portefeuille, incorporée sous régime fédéral canadien, qui vise l'acquisition et la consolidation de PME opérant dans les secteurs de la santé publique et du développement industriel en Afrique.",
    "about.p2": "Nous investissons durablement dans les personnes, les idées et les infrastructures stratégiques nécessaires pour accélérer le développement de l'économie africaine, tout en offrant de solides rendements.",
    "about.sectors": "Les secteurs que nous ciblons",
    
    // Sectors
    "sector.manufacturing": "Manufacturier",
    "sector.manufacturing.desc": "Le secteur manufacturier est un pilier du développement économique et industriel en Afrique, avec un fort potentiel de transformation locale des ressources, de création d'emplois et de réduction des importations.",
    "sector.health": "Santé",
    "sector.health.desc": "Le santé en Afrique représente à la fois un défi structurel et une opportunité majeure de croissance à fort impact social.",
    "sector.food": "Transformation alimentaire",
    "sector.food.desc": "La transformation alimentaire représente une opportunité stratégique pour accroître la valeur ajoutée des productions agricoles locales.",
    "sector.distribution": "Distribution",
    "sector.distribution.desc": "La distribution joue un rôle stratégique dans la structuration des marchés et l'accès des populations aux biens essentiels.",
    
    // Criteria
    "criteria.section": "02 — Nos Critères",
    "criteria.title": "Critères d'investissement",
    "criteria.majority": "Position majoritaire",
    "criteria.majority.desc": "Notre stratégie d'investissement privilégie la prise de participation majoritaire, gage de notre volonté d'accompagner activement les entreprises cibles dans leur développement.",
    "criteria.profitability": "Rentabilité soutenable",
    "criteria.profitability.desc": "Nous ciblons des entreprises capables de générer des performances économiques solides tout en assurant la résilience de leur modèle d'affaires sur le long terme.",
    "criteria.market": "Marché adressable à fort potentiel",
    "criteria.market.desc": "Nous misons sur des PME positionnées sur des marchés africains en pleine mutation, où l'innovation et les besoins non satisfaits créent un terrain propice.",
    "criteria.leverage": "Leviers financiers adéquats",
    "criteria.leverage.desc": "L'accès à des mécanismes financiers sur mesure constitue un levier clé pour accélérer la montée en puissance des PME que nous accompagnons.",
    
    // Values
    "values.section": "03 — Nos Valeurs",
    "values.title": "Valeurs du groupe Planis",
    "values.subtitle": "Assumer des projections audacieuses",
    "values.performance": "Performance",
    "values.performance.desc": "Excellence dans l'exécution et la création de valeur mesurable.",
    "values.agility": "Agilité",
    "values.agility.desc": "Capacité d'adaptation rapide aux dynamiques des marchés africains.",
    "values.rigor": "Rigueur",
    "values.rigor.desc": "Discipline dans l'analyse, la gouvernance et le suivi des investissements.",
    "values.innovation": "Innovation",
    "values.innovation.desc": "Promotion de solutions créatives et transformatrices.",
    
    // Portfolio
    "portfolio.section": "04 — Investissements",
    "portfolio.title": "Notre Portefeuille",
    "portfolio.subtitle": "Liste des PME à fort potentiel qui composent notre portefeuille d'investissements",
    "portfolio.visit": "Visiter le site",
    "portfolio.westml.desc": "West-ML Innovation est spécialisée dans les solutions technologiques innovantes pour l'Afrique de l'Ouest.",
    "portfolio.westml.sector": "Innovation & Technologie",

    // Contact
    "contact.section": "05 — Contact",
    "contact.title": "Contactez-nous dès maintenant",
    "contact.subtitle": "Vous avez un projet ? Vous souhaitez en savoir plus sur nos opportunités d'investissement ?",
    
    // Footer
    "footer.description": "Société de portefeuille canadienne dédiée à l'acquisition et la consolidation de PME dans les secteurs de la santé et du développement industriel en Afrique.",
    "footer.menu": "Menu",
    "footer.home": "Accueil",
    "footer.rights": "Tous droits réservés.",
  },
  en: {
    // Navigation
    "nav.about": "About",
    "nav.criteria": "Our Criteria",
    "nav.values": "Our Values",
    "nav.portfolio": "Portfolio",
    "nav.contact": "Contact Us",
    
    // Hero
    "hero.subtitle": "Planis Capital",
    "hero.title1": "Strategic capital.",
    "hero.title2": "Sustainable growth.",
    "hero.description": "We invest sustainably in people, ideas and strategic infrastructure needed to accelerate the development of the African economy.",
    "hero.cta1": "Discover our mission",
    "hero.cta2": "Contact us",
    "hero.scroll": "Scroll",
    "gyro.enable": "Enable",
    "gyro.hint": "Tilt your phone to explore",
    "gyro.dismiss": "Dismiss",

    // About
    "about.section": "01 — About",
    "about.title": "Investing in Africa's future",
    "about.p1": "Planis Capital is a holding company, incorporated under Canadian federal law, that focuses on acquiring and consolidating SMEs operating in the public health and industrial development sectors in Africa.",
    "about.p2": "We invest sustainably in people, ideas and strategic infrastructure needed to accelerate the development of the African economy, while delivering solid returns.",
    "about.sectors": "Sectors we target",
    
    // Sectors
    "sector.manufacturing": "Manufacturing",
    "sector.manufacturing.desc": "The manufacturing sector is a pillar of economic and industrial development in Africa, with strong potential for local resource transformation, job creation and import reduction.",
    "sector.health": "Healthcare",
    "sector.health.desc": "Healthcare in Africa represents both a structural challenge and a major growth opportunity with high social impact.",
    "sector.food": "Food Processing",
    "sector.food.desc": "Food processing represents a strategic opportunity to increase the added value of local agricultural production.",
    "sector.distribution": "Distribution",
    "sector.distribution.desc": "Distribution plays a strategic role in market structuring and population access to essential goods.",
    
    // Criteria
    "criteria.section": "02 — Our Criteria",
    "criteria.title": "Investment Criteria",
    "criteria.majority": "Majority Position",
    "criteria.majority.desc": "Our investment strategy favors majority shareholding, demonstrating our commitment to actively supporting target companies in their development.",
    "criteria.profitability": "Sustainable Profitability",
    "criteria.profitability.desc": "We target companies capable of generating solid economic performance while ensuring the resilience of their business model over the long term.",
    "criteria.market": "High-Potential Addressable Market",
    "criteria.market.desc": "We focus on SMEs positioned in fast-changing African markets, where innovation and unmet needs create fertile ground.",
    "criteria.leverage": "Adequate Financial Leverage",
    "criteria.leverage.desc": "Access to tailored financial mechanisms is a key lever for accelerating the growth of the SMEs we support.",
    
    // Values
    "values.section": "03 — Our Values",
    "values.title": "Planis Group Values",
    "values.subtitle": "Embracing bold projections",
    "values.performance": "Performance",
    "values.performance.desc": "Excellence in execution and measurable value creation.",
    "values.agility": "Agility",
    "values.agility.desc": "Ability to adapt quickly to African market dynamics.",
    "values.rigor": "Rigor",
    "values.rigor.desc": "Discipline in analysis, governance and investment monitoring.",
    "values.innovation": "Innovation",
    "values.innovation.desc": "Promoting creative and transformative solutions.",
    
    // Portfolio
    "portfolio.section": "04 — Investments",
    "portfolio.title": "Our Portfolio",
    "portfolio.subtitle": "List of high-potential SMEs that make up our investment portfolio",
    "portfolio.visit": "Visit website",
    "portfolio.westml.desc": "West-ML Innovation specializes in innovative technology solutions for West Africa.",
    "portfolio.westml.sector": "Innovation & Technology",

    // Contact
    "contact.section": "05 — Contact",
    "contact.title": "Contact us now",
    "contact.subtitle": "Do you have a project? Would you like to learn more about our investment opportunities?",
    
    // Footer
    "footer.description": "Canadian holding company dedicated to acquiring and consolidating SMEs in the healthcare and industrial development sectors in Africa.",
    "footer.menu": "Menu",
    "footer.home": "Home",
    "footer.rights": "All rights reserved.",
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Starts "fr" to match the server-rendered <html lang>; the stored choice is applied
  // after mount so the first paint never mismatches and trips hydration.
  const [language, setLanguageState] = useState<Language>("fr")

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "fr" || stored === "en") {
      // Syncs React state from an external system on mount (reads localStorage). There is no
      // render-time source for it, and reading during render breaks hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Persist on the action, not in an effect — an effect would write the default "fr"
  // on mount and clobber the stored choice before the read above lands.
  const setLanguage = (lang: Language) => {
    const apply = () => {
      setLanguageState(lang)
      window.localStorage.setItem(STORAGE_KEY, lang)
    }

    // Crossfade the whole document through the View Transitions API where supported.
    // flushSync is required: startViewTransition snapshots the DOM when the callback
    // returns, and React's async rendering would otherwise not have committed yet.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> }
    }
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => flushSync(apply))
      return
    }
    apply()
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
