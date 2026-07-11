'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDown } from 'lucide-react'
import { SectionReveal } from '@/components/ui/section-reveal'
import { useSiteEntered } from '@/components/site-entered'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { scrollToSection } from '@/lib/scroll-to'

const headingWords = ['We', 'craft', 'digital', 'experiences', 'beyond', 'imagination']
const marqueeText = 'DESIGN · DEVELOPMENT · MOTION · STRATEGY · BRANDING · '

export function Hero() {
  const [visible, setVisible] = useState(false)
  const entered = useSiteEntered()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!entered) return
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [entered])

  // Reduced motion: everything is already in place, so the word-by-word entrance
  // has nothing to animate from.
  const enter = (offset: string, ms: number, delay: number) =>
    reducedMotion
      ? { opacity: 1, transform: 'none', transition: 'none' }
      : {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : `translateY(${offset})`,
          transition: `opacity ${ms}ms ease-out ${delay}s, transform ${ms}ms ease-out ${delay}s`,
        }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20"
    >
      {/* Soft dark scrim so text stays readable over the 3D field */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at center, rgba(0,0,0,0.55) 0%, transparent 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto w-full">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8" style={enter('16px', 600, 0)}>
          <span className="h-px w-8" style={{ background: 'var(--text-muted)' }} />
          <span
            className="font-body text-xs tracking-[0.35em] uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            Creative Studio — Est. 2024
          </span>
          <span className="h-px w-8" style={{ background: 'var(--text-muted)' }} />
        </div>

        {/* Staggered heading */}
        <h1 className="font-heading font-light text-5xl md:text-7xl lg:text-8xl leading-[1.14] tracking-tight flex flex-wrap justify-center gap-x-[0.28em] gap-y-1">
          {headingWords.map((word, i) => (
            <span key={i} className="inline-block" style={enter('28px', 700, 0.15 + i * 0.09)}>
              {word}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <SectionReveal delay={0.8}>
          <p
            className="font-body font-light text-lg md:text-xl mt-10 max-w-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            A creative studio engineering experiences across the digital cosmos.
          </p>
        </SectionReveal>

        {/* Buttons */}
        <SectionReveal delay={1}>
          <div className="flex flex-wrap gap-4 mt-12 justify-center">
            <button
              onClick={() => scrollToSection('#work')}
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-body font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:gap-3 hover:bg-gray-100 cursor-pointer"
            >
              Explore Work
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
            <button
              onClick={() => scrollToSection('#contact')}
              className="group flex items-center gap-2 px-8 py-4 font-body font-medium text-sm tracking-wide uppercase transition-all duration-300 hover:gap-3 cursor-pointer"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              Get in Touch
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </SectionReveal>
      </div>

      {/* Scroll indicator — anchored to the viewport bottom (absolute) so
          adjusting its position never pushes the centered content up.
          bottom-24 keeps a clear gap from the buttons and above the marquee */}
      <div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2"
        style={
          reducedMotion
            ? { opacity: 1 }
            : { opacity: visible ? 1 : 0, transition: 'opacity 800ms ease-out 1.6s' }
        }
      >
        <span
          className="font-body text-[10px] tracking-[0.3em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Scroll
        </span>
        <ArrowDown
          size={14}
          className={reducedMotion ? '' : 'animate-bounce'}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* Marquee */}
      <div
        className="absolute bottom-0 left-0 w-full overflow-hidden"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="font-heading font-light text-sm tracking-[0.3em] uppercase"
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
