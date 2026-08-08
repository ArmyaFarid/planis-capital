import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter_Tight } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: '--font-inter-tight',
  weight: ['400', '500', '600', '700']
});

// Display serif — ships a single weight by design. Hierarchy comes from size, not weight,
// so anything below h2 uses Inter Tight semibold instead.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: '--font-instrument-serif',
  weight: '400'
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
    <html lang="fr" className="bg-background">
      <body className={`${interTight.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
