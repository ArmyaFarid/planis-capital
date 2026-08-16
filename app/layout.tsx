import type { Metadata, Viewport } from 'next'
import { Comfortaa, Inter_Tight } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600', '700']
});

// Display face. Matches the rounded geometric wordmark in the Planis Capital logo, and the
// heading face on planisgroup.webflow.io. Body copy stays on Inter Tight — Comfortaa is a
// display type and long paragraphs set in it are noticeably harder to read.
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: '--font-comfortaa',
  weight: ['400', '500', '600', '700']
});

const TITLE = 'Planis Capital | Capital stratégique. Croissance durable.'
const DESCRIPTION =
  'Planis Capital est une société de portefeuille canadienne qui vise l\'acquisition et la consolidation de PME opérant dans les secteurs de la santé publique et du développement industriel en Afrique.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['investissement', 'Afrique', 'PME', 'santé', 'industrie', 'holding', 'Canada'],
  authors: [{ name: 'Planis Capital' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    alternateLocale: ['en_CA'],
    url: '/',
    siteName: 'Planis Capital',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1628',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // lang is kept in sync with the FR/EN toggle by LanguageProvider.
  // No scroll-smooth here: SmoothScroll owns scrolling and re-adds it on its fallback path.
  return (
    // suppressHydrationWarning is required, not a workaround: the script below stamps
    // data-intro on <html> before React hydrates, so the server markup and the live DOM
    // legitimately differ on that attribute. Applies one level deep, so it covers only
    // <html>'s own attributes — and incidentally the ones browser extensions inject here.
    <html lang="fr" className="bg-background" suppressHydrationWarning>
      <body className={`${interTight.variable} ${comfortaa.variable} font-sans antialiased`}>
        {/*
          Blocking, and deliberately placed before {children}: it decides the intro-curtain
          state before the page markup is even parsed. Doing this in a useEffect means the
          hero paints first and the curtain drops on top of it a frame later, which reads
          as content flashing behind a loader. Same pattern as a no-flash theme script.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='skip';return}
d.dataset.intro='show';
if(!location.hash){if('scrollRestoration' in history){history.scrollRestoration='manual'}window.scrollTo(0,0)}
}catch(e){d.dataset.intro='skip'}})()`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
