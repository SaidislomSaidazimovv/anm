'use client'

import { SectionReveal } from '@/components/ui/section-reveal'

const services = [
  {
    num: '01',
    title: 'Digital Design',
    desc: 'Interfaces that breathe and behave with purpose',
  },
  {
    num: '02',
    title: 'Web Development',
    desc: 'Fast, scalable, obsessively detailed builds',
  },
  {
    num: '03',
    title: 'Motion & 3D',
    desc: 'Animation systems that bring depth to flat surfaces',
  },
  {
    num: '04',
    title: 'Strategy',
    desc: 'Clarity before execution, always',
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 px-6 md:px-12 lg:px-24">
      <SectionReveal>
        <h2
          className="font-heading font-light text-4xl md:text-5xl tracking-tight mb-16"
          style={{ color: 'var(--text-primary)' }}
        >
          What We Do
        </h2>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {services.map((service, i) => (
          <SectionReveal key={service.num} delay={i * 0.1}>
            <div
              className="service-item group p-8 md:p-10 cursor-default"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span
                className="font-heading text-xs tracking-[0.3em] uppercase block mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {service.num}
              </span>
              <h3
                className="font-heading font-light text-2xl md:text-3xl mb-3 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                {service.title}
              </h3>
              <p className="font-body font-light text-base" style={{ color: 'var(--text-secondary)' }}>
                {service.desc}
              </p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
