import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Signal lost — SPIRAL',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span
        className="font-body text-xs tracking-[0.35em] uppercase mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        404 — Signal lost
      </span>

      <h1
        className="font-heading font-light text-5xl md:text-7xl leading-[1.15] tracking-tight max-w-2xl"
        style={{ color: 'var(--text-primary)' }}
      >
        This page drifted out of orbit.
      </h1>

      <p
        className="font-body font-light text-base md:text-lg mt-8 max-w-md leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Nothing is transmitting from these coordinates. The system is back the
        way you came.
      </p>

      <Link
        href="/"
        className="mt-12 px-8 py-4 bg-white text-black font-body font-medium text-sm tracking-wide uppercase transition-colors duration-300 hover:bg-gray-100"
      >
        Return to the system
      </Link>
    </main>
  )
}
