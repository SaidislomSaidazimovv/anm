'use client'

import { useEffect, useState } from 'react'
import { SectionReveal } from '@/components/ui/section-reveal'

const headingWords = ['We', 'craft', 'digital', 'experiences', 'beyond', 'imagination']
const marqueeText = 'DESIGN \u00B7 DEVELOPMENT \u00B7 MOTION \u00B7 STRATEGY \u00B7 BRANDING \u00B7 '

export function Hero() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-5xl mx-auto">
        {/* Staggered heading */}
        <h1 className="font-heading font-light text-5xl md:text-7xl lg:text-8xl leading-tight tracking-tight">
          {headingWords.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-[0.3em] last:mr-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 600ms ease-out ${i * 0.1}s, transform 600ms ease-out ${i * 0.1}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <SectionReveal delay={0.7}>
          <p
            className="font-body font-light text-lg md:text-xl mt-8 max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            A creative studio at the intersection of design and technology.
          </p>
        </SectionReveal>

        {/* Buttons */}
        <SectionReveal delay={0.9}>
          <div className="flex flex-wrap gap-4 mt-10 justify-center">
            <button className="px-8 py-3 bg-white text-black font-body font-normal text-sm tracking-wide uppercase transition-all duration-300 hover:bg-gray-200">
              Explore Work
            </button>
            <button
              className="px-8 py-3 font-body font-normal text-sm tracking-wide uppercase transition-all duration-300 hover:bg-white/5"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Get in Touch
            </button>
          </div>
        </SectionReveal>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="font-heading font-light text-sm tracking-[0.3em] uppercase mx-0"
              style={{ color: 'var(--text-muted)' }}
            >
              {marqueeText}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
