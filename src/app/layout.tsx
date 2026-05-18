import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SPIRAL — Interstellar Creative Studio',
  description:
    'A creative studio engineering experiences across the digital cosmos. An interactive journey through the solar system.',
  keywords: ['creative studio', '3D web', 'WebGL', 'solar system', 'interactive', 'awwwards'],
  openGraph: {
    title: 'SPIRAL — Interstellar Creative Studio',
    description: 'A creative studio engineering experiences across the digital cosmos.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#02020a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body
        className="min-h-screen w-full"
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
