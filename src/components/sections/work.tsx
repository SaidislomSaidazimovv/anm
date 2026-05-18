'use client'

import { ArrowUpRight } from 'lucide-react'
import { SectionReveal } from '@/components/ui/section-reveal'
import { SectionHeading } from '@/components/ui/section-heading'

const projects = [
  { name: 'Void Interface', category: 'UI / Motion', year: '2024', tint: '#6366f1' },
  { name: 'Orbital Systems', category: 'Branding / Web', year: '2024', tint: '#06b6d4' },
  { name: 'Echo Protocol', category: 'Development / 3D', year: '2023', tint: '#a855f7' },
]

export function Work() {
  return (
    <section id="work" className="relative py-28 md:py-36 px-6 md:px-12 lg:px-24">
      <SectionHeading index="02" label="Missions" title="Selected work" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {projects.map((project, i) => (
          <SectionReveal key={project.name} delay={i * 0.12}>
            <div
              className="group relative flex h-[380px] flex-col justify-between overflow-hidden p-8 transition-all duration-500 hover:-translate-y-2"
              style={{
                backgroundColor: 'rgba(10,10,10,0.7)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Visual motif — soft glow + centered concentric rings,
                  kept behind content so nothing overlaps the corner arrow */}
              <div
                className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: project.tint }}
              />
              <svg
                viewBox="0 0 120 120"
                className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 opacity-15 transition-all duration-700 group-hover:rotate-90 group-hover:opacity-30"
              >
                {[56, 42, 28, 14].map((r) => (
                  <circle
                    key={r}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke={project.tint}
                    strokeWidth="1"
                  />
                ))}
              </svg>

              {/* Top row */}
              <div className="relative z-10 flex items-start justify-between">
                <span
                  className="font-body text-xs tracking-[0.25em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {project.year}
                </span>
                <ArrowUpRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  style={{ color: 'var(--text-secondary)' }}
                />
              </div>

              {/* Bottom content */}
              <div className="relative z-10">
                <h3
                  className="font-heading font-light text-3xl md:text-[2rem] mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {project.name}
                </h3>
                <p
                  className="font-body font-light text-sm tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {project.category}
                </p>
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
