import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AGD Justowska',
    template: '%s · AGD Justowska',
  },
  description: 'Salon AGD w Krakowie. Sprzęt, technika kuchenna i blaty. Doradztwo oparte na 27 latach pracy w branży.',
}

export const viewport: Viewport = {
  themeColor: '#4c0014',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`${outfit.variable} ${cormorant.variable}`} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col bg-cream font-sans text-wine-ink antialiased">
        {children}
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  )
}
