'use client'

import { SectionReveal } from '@/components/ui/section-reveal'
import { SectionHeading } from '@/components/ui/section-heading'

const stages = [
  { n: '01', t: 'Signal', d: 'We listen for the idea — goals, constraints, the gravitational pull of the brand.' },
  { n: '02', t: 'Blueprint', d: 'Trajectory mapped: architecture, motion language, and the visual system.' },
  { n: '03', t: 'Build', d: 'Engineered in orbit — performant, accessible, obsessively detailed.' },
  { n: '04', t: 'Launch', d: 'Ignition and handover, with telemetry to keep it climbing.' },
]

export function Process() {
  return (
    <section
      id="process"
      className="relative min-h-screen flex flex-col justify-center py-28 md:py-36 px-6 md:px-12 lg:px-24"
    >
      <SectionHeading index="04" label="Trajectory" title="How we launch" />

      <div className="relative z-10">
        {stages.map((s, i) => (
          <SectionReveal key={s.n} delay={i * 0.1}>
            <div
              className="group grid grid-cols-[auto_1fr] md:grid-cols-[120px_1fr_2fr] gap-6 md:gap-10 items-baseline py-8 md:py-10 transition-colors duration-500"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span
                className="font-heading font-light text-3xl md:text-5xl transition-colors duration-500 group-hover:text-white"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.n}
              </span>
              <h3
                className="font-heading font-light text-2xl md:text-4xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {s.t}
              </h3>
              <p
                className="col-span-2 md:col-span-1 font-body font-light text-base md:text-lg leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s.d}
              </p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
