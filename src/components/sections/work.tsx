'use client'

import { SectionReveal } from '@/components/ui/section-reveal'

const projects = [
  { name: 'Void Interface', category: 'UI / Motion', year: '2024' },
  { name: 'Orbital Systems', category: 'Branding / Web', year: '2024' },
  { name: 'Echo Protocol', category: 'Development / 3D', year: '2023' },
]

export function Work() {
  return (
    <section id="work" className="py-32 px-6 md:px-12 lg:px-24">
      <SectionReveal>
        <h2
          className="font-heading font-light text-4xl md:text-5xl tracking-tight mb-16"
          style={{ color: 'var(--text-primary)' }}
        >
          Selected Work
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <SectionReveal key={project.name} delay={i * 0.15}>
            <div
              className="group relative p-8 min-h-[320px] flex flex-col justify-end transition-all duration-500 cursor-pointer hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Animated gradient inside */}
              <div className="absolute inset-0 card-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <p
                  className="font-body text-xs tracking-[0.2em] uppercase mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {project.year}
                </p>
                <h3 className="font-heading font-light text-2xl md:text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
                  {project.name}
                </h3>
                <p className="font-body font-light text-sm" style={{ color: 'var(--text-secondary)' }}>
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
