'use client'

import { SectionReveal } from '@/components/ui/section-reveal'
import { SectionHeading } from '@/components/ui/section-heading'

const facts = [
  { k: 'Based', v: 'Everywhere / Remote' },
  { k: 'Founded', v: 'Earth, 2024' },
  { k: 'Discipline', v: 'Design · Code · Motion' },
]

export function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center py-28 md:py-36 px-6 md:px-12 lg:px-24"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 75% 70% at 25% 50%, rgba(0,0,0,0.6) 0%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-3xl">
        <SectionHeading index="01" label="Manifesto" title="We chart the unknown" />

        <SectionReveal delay={0.15}>
          <p
            className="font-body font-light text-xl md:text-2xl leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            SPIRAL is an interstellar creative studio. We treat every project
            like a launch — a precise trajectory from a faint signal to a
            living, breathing experience that bends light and attention.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <p
            className="font-body font-light text-base md:text-lg leading-relaxed mt-8"
            style={{ color: 'var(--text-muted)' }}
          >
            Design, engineering and motion as one continuous craft. No filler,
            no noise — just gravity.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.45}>
          <div
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ background: 'var(--border)' }}
          >
            {facts.map((f) => (
              <div key={f.k} className="p-6" style={{ background: 'rgba(2,2,10,0.6)' }}>
                <p
                  className="font-body text-xs tracking-[0.25em] uppercase mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {f.k}
                </p>
                <p
                  className="font-heading font-light text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.v}
                </p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
