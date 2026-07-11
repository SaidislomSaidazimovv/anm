'use client'

import { useEffect, useRef, useState } from 'react'
import { JOURNEY_STOPS } from '@/components/three/bodies'
import { scrollToSection } from '@/lib/scroll-to'

/**
 * Where you are in the flight. Each section owns a world, so the page's scroll
 * position has a place name — and clicking a stop flies you to it.
 *
 * Desktop only: on a phone this would cover the content it's describing, and
 * the navbar already handles getting around.
 */
export function JourneyNav() {
  const [active, setActive] = useState(JOURNEY_STOPS[0]?.section ?? 'hero')
  // The fill is written straight to the element. Holding it in state would
  // re-render this list on every frame of every scroll, for a value that only
  // ever ends up as one CSS transform.
  const fill = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Whichever section is nearest the middle of the screen wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )

    for (const stop of JOURNEY_STOPS) {
      const el = document.getElementById(stop.section)
      if (el) observer.observe(el)
    }

    const onScroll = () => {
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
        if (fill.current) fill.current.style.transform = `scaleY(${p})`
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <nav
      aria-label="Journey progress"
      data-no-pick
      className="fixed left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-5"
    >
      {/* The line the stops hang off, filled to how far you've travelled. */}
      <div
        className="absolute left-[3px] top-1 bottom-1 w-px"
        style={{ background: 'var(--border)' }}
        aria-hidden
      >
        <div
          ref={fill}
          className="w-full origin-top transition-transform duration-200 ease-out"
          style={{
            height: '100%',
            background: 'var(--text-primary)',
            transform: 'scaleY(0)',
            opacity: 0.6,
          }}
        />
      </div>

      {JOURNEY_STOPS.map((stop) => {
        const isActive = stop.section === active
        return (
          <button
            key={stop.key}
            onClick={() => scrollToSection(`#${stop.section}`)}
            aria-current={isActive ? 'true' : undefined}
            className="group relative flex items-center gap-4 bg-transparent border-none cursor-pointer p-0 text-left"
          >
            <span
              className="relative z-10 block h-[7px] w-[7px] rounded-full transition-all duration-300"
              style={{
                background: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                transform: isActive ? 'scale(1.35)' : 'scale(1)',
                boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.55)' : 'none',
              }}
            />
            <span
              className="font-body text-[10px] tracking-[0.28em] uppercase transition-all duration-300 group-hover:opacity-100"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                opacity: isActive ? 1 : 0.45,
              }}
            >
              {stop.name}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
