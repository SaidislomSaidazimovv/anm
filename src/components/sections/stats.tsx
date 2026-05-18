'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionReveal } from '@/components/ui/section-reveal'
import { SectionHeading } from '@/components/ui/section-heading'

const stats = [
  { value: 120, suffix: '+', label: 'Missions launched' },
  { value: 8, suffix: '', label: 'Years in orbit' },
  { value: 14, suffix: '', label: 'Awards & honors' },
  { value: 40, suffix: '+', label: 'Partners worldwide' },
]

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const dur = 1600
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur)
          const eased = 1 - Math.pow(1 - t, 3)
          setN(Math.round(to * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to])

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section
      id="stats"
      className="relative min-h-screen flex flex-col justify-center py-28 md:py-36 px-6 md:px-12 lg:px-24"
    >
      <SectionHeading index="05" label="Telemetry" title="Distance covered" />

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
        style={{ background: 'var(--border)' }}
      >
        {stats.map((s, i) => (
          <SectionReveal key={s.label} delay={i * 0.1}>
            <div
              className="h-full p-8 md:p-10 flex flex-col gap-4"
              style={{ background: 'rgba(2,2,10,0.55)' }}
            >
              <span
                className="font-heading font-light text-5xl md:text-6xl lg:text-7xl tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span
                className="font-body text-xs md:text-sm tracking-[0.2em] uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s.label}
              </span>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
