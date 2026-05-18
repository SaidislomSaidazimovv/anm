'use client'

import { SectionReveal } from '@/components/ui/section-reveal'

/** Shared eyebrow + title block so every section opens consistently. */
export function SectionHeading({
  label,
  title,
  index,
}: {
  label: string
  title: string
  index: string
}) {
  return (
    <div className="mb-16 md:mb-20">
      <SectionReveal>
        <div className="flex items-center gap-3 mb-5">
          <span
            className="font-body text-xs tracking-[0.3em]"
            style={{ color: 'var(--text-muted)' }}
          >
            {index}
          </span>
          <span className="h-px w-10" style={{ background: 'var(--border)' }} />
          <span
            className="font-body text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </span>
        </div>
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <h2
          className="font-heading font-light text-4xl md:text-5xl lg:text-6xl tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
      </SectionReveal>
    </div>
  )
}
