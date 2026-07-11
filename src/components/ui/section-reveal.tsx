'use client'

import { useEffect, useRef, useState } from 'react'
import { useSiteEntered } from '@/components/site-entered'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

interface SectionRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SectionReveal({ children, delay = 0, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const entered = useSiteEntered()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    // Hold the reveal while the intro overlay is up: the hero is already
    // intersecting behind it, and we'd waste the animation on a black screen.
    if (!el || !entered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [entered])

  // Reduced motion: the content is simply there. No fade, no rise, no delay
  // — and no dependence on the observer having fired.
  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 700ms ease-out ${delay}s, transform 700ms ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
