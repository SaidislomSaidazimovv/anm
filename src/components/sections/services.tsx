'use client'

import { PenTool, Code2, Box, Compass, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { SectionReveal } from '@/components/ui/section-reveal'
import { SectionHeading } from '@/components/ui/section-heading'

const services: { num: string; title: string; desc: string; icon: LucideIcon }[] = [
  { num: '01', title: 'Digital Design', desc: 'Interfaces that breathe and behave with purpose', icon: PenTool },
  { num: '02', title: 'Web Development', desc: 'Fast, scalable, obsessively detailed builds', icon: Code2 },
  { num: '03', title: 'Motion & 3D', desc: 'Animation systems that bring depth to flat surfaces', icon: Box },
  { num: '04', title: 'Strategy', desc: 'Clarity before execution, always', icon: Compass },
]

export function Services() {
  return (
    <section id="services" className="relative py-28 md:py-36 px-6 md:px-12 lg:px-24">
      <SectionHeading index="03" label="Capabilities" title="What we do" />

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}
      >
        {services.map((service, i) => {
          const Icon = service.icon
          return (
            <SectionReveal key={service.num} delay={i * 0.1}>
              <div
                className="group relative h-full p-8 md:p-12 transition-colors duration-500"
                style={{
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="mb-8 flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 group-hover:border-white"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--text-primary)' }} strokeWidth={1.25} />
                  </div>
                  <span
                    className="font-heading text-xs tracking-[0.3em] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {service.num}
                  </span>
                </div>

                <h3
                  className="font-heading font-light text-2xl md:text-3xl mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {service.title}
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </h3>
                <p
                  className="font-body font-light text-base leading-relaxed max-w-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {service.desc}
                </p>
              </div>
            </SectionReveal>
          )
        })}
      </div>
    </section>
  )
}
