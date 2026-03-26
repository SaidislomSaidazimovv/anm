'use client'

import { SectionReveal } from '@/components/ui/section-reveal'

const socials = [
  { name: 'Github', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'LinkedIn', href: '#' },
]

export function Contact() {
  return (
    <section id="contact" className="py-32 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col justify-center">
      <SectionReveal>
        <h2 className="font-heading font-light text-5xl md:text-7xl lg:text-8xl leading-tight tracking-tight max-w-4xl">
          <span className="block">Let&apos;s build something</span>
          <span className="block">remarkable.</span>
        </h2>
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <a
          href="mailto:hello@spiral.studio"
          className="email-link font-body font-light text-xl md:text-2xl mt-12 inline-block"
          style={{ color: 'var(--text-secondary)' }}
        >
          hello@spiral.studio
        </a>
      </SectionReveal>

      <SectionReveal delay={0.3}>
        <div className="flex gap-8 mt-10">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              className="nav-link font-body text-sm tracking-[0.15em] uppercase transition-colors duration-300"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {s.name}
            </a>
          ))}
        </div>
      </SectionReveal>

      {/* Copyright */}
      <div
        className="mt-auto pt-24"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="font-body font-light text-xs tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} SPIRAL. All rights reserved.
        </p>
      </div>
    </section>
  )
}
