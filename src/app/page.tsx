'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Work } from '@/components/sections/work'
import { Services } from '@/components/sections/services'
import { Process } from '@/components/sections/process'
import { Stats } from '@/components/sections/stats'
import { Contact } from '@/components/sections/contact'
import { SmoothScroll } from '@/components/smooth-scroll'
import { CustomCursor } from '@/components/custom-cursor'
import { JourneyNav } from '@/components/journey-nav'
import { SiteEnteredContext } from '@/components/site-entered'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(
  () => import('@/components/three/scene').then((m) => m.Scene),
  { ssr: false }
)

// Intro lasts at least MIN_MS (so the launch sequence reads), fades as
// soon as textures are ready after that, and never blocks past MAX_MS.
const MIN_MS = 3500
const MAX_MS = 7000

export default function Home() {
  const [introDone, setIntroDone] = useState(false)
  const [spiralFading, setSpiralFading] = useState(false)
  const [enterVisible, setEnterVisible] = useState(false)
  const assetsReady = useRef(false)
  const started = useRef(0)
  const reducedMotion = usePrefersReducedMotion()

  // A launch sequence nobody can skip is exactly the kind of motion the
  // reduced-motion setting exists to refuse: those visitors are simply already
  // inside, so there is no intro state to drive.
  const entered = introDone || reducedMotion

  const beginExit = useCallback(() => {
    setSpiralFading(true)
    setTimeout(() => setIntroDone(true), 1000)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    started.current = performance.now()
    const t0 = setTimeout(() => setEnterVisible(true), 500)

    // Poll the min-time + asset-ready gate; fall back at MAX_MS.
    const iv = setInterval(() => {
      const elapsed = performance.now() - started.current
      if ((assetsReady.current && elapsed >= MIN_MS) || elapsed >= MAX_MS) {
        clearInterval(iv)
        beginExit()
      }
    }, 150)

    return () => {
      clearTimeout(t0)
      clearInterval(iv)
    }
  }, [beginExit, reducedMotion])

  // The sections are in the DOM from the first paint (so the page ships with
  // real content), which means the page is scrollable while the overlay is
  // still up. Freeze it until the journey actually starts.
  useEffect(() => {
    if (entered) return
    window.scrollTo(0, 0)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [entered])

  const onAssetsReady = useCallback(() => {
    assetsReady.current = true
  }, [])

  return (
    <SiteEnteredContext.Provider value={entered}>
      <div className="bg-black min-h-screen w-full relative">

        {/* Fixed 3D layer — mounted immediately so textures preload
            behind the intro overlay (acts as the real loader) */}
        <Scene onReady={onAssetsReady} />

        {/* Navbar must stay OUTSIDE the animated wrapper below: that wrapper
            keeps a transform (translateY) which would make this fixed navbar
            scroll away with it instead of sticking to the viewport */}
        <Navbar />

        <div className={`relative z-10 ${entered ? 'animate-site-in' : ''}`}>
          <main>
            <Hero />
            <About />
            <Work />
            <Services />
            <Process />
            <Stats />
            <Contact />
          </main>
        </div>

        {/* Entry overlay — sits above the site (later in the DOM at the same
            z-index) and fades once assets are ready. Skipped entirely under
            reduced motion, so its GSAP loop never even starts. */}
        {!reducedMotion && (
        <div
          className="fixed inset-0 z-50 bg-black transition-opacity duration-1000"
          style={{
            opacity: spiralFading ? 0 : 1,
            pointerEvents: spiralFading ? 'none' : 'auto',
          }}
          aria-hidden={spiralFading}
        >
          <div className="absolute inset-0 z-0">
            <SpiralAnimation />
          </div>

          {/* Launch text */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div
              className="flex flex-col items-center gap-3 transition-all duration-[1800ms] ease-out"
              style={{
                opacity: enterVisible ? 1 : 0,
                transform: enterVisible ? 'translateY(150px)' : 'translateY(170px)',
              }}
            >
              <p className="animate-enter-breathe text-white text-sm tracking-[0.5em] uppercase font-light select-none">
                Entering the system
              </p>
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-light select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                SPIRAL · Interstellar Studio
              </span>
            </div>
          </div>
        </div>
        )}

        {/* Lenis takes the scroll wheel away from the browser and re-times it —
            the one thing a reduced-motion visitor is most likely to resent. */}
        {entered && !reducedMotion && <SmoothScroll />}
        {entered && <CustomCursor />}
        {entered && <JourneyNav />}

      </div>
    </SiteEnteredContext.Provider>
  )
}
