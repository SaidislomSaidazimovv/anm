'use client'

import { Mail, ArrowUpRight, ArrowUp } from 'lucide-react'
import { SectionReveal } from '@/components/ui/section-reveal'

const socials = [
  { name: 'Github', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'LinkedIn', href: '#' },
]

export function Contact() {
  return (
    <section
      id="contact"
      className="relative min-h-screen flex flex-col justify-center py-28 md:py-36 px-6 md:px-12 lg:px-24"
    >
      {/* readability scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(0,0,0,0.6) 0%, transparent 75%)',
        }}
      />

      <div className="relative z-10">
        <SectionReveal>
          <span
            className="font-body text-xs tracking-[0.3em] uppercase block mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            06 — Open a channel
          </span>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="font-heading font-light text-5xl md:text-7xl lg:text-8xl leading-[1.12] tracking-tight max-w-4xl">
            <span className="block">Let&apos;s build something</span>
            <span className="block">that escapes orbit.</span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.25}>
          <a
            href="mailto:hello@spiral.studio"
            className="email-link group font-body font-light text-xl md:text-3xl mt-14 inline-flex items-center gap-3"
            style={{ color: 'var(--text-primary)' }}
          >
            <Mail size={24} strokeWidth={1.25} style={{ color: 'var(--text-secondary)' }} />
            hello@spiral.studio
          </a>
        </SectionReveal>

        <SectionReveal delay={0.35}>
          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className="group flex items-center gap-1.5 font-body text-sm tracking-[0.15em] uppercase transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {s.name}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ))}
          </div>
        </SectionReveal>

        {/* Footer */}
        <div
          className="mt-28 pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p
            className="font-body font-light text-xs tracking-[0.1em]"
            style={{ color: 'var(--text-muted)' }}
          >
            © {new Date().getFullYear()} SPIRAL. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            Back to top
            <ArrowUp
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
