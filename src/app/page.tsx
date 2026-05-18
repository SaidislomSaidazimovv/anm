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
  const [showSite, setShowSite] = useState(false)
  const [spiralFading, setSpiralFading] = useState(false)
  const [enterVisible, setEnterVisible] = useState(false)
  const assetsReady = useRef(false)
  const started = useRef(0)

  const beginExit = useCallback(() => {
    setSpiralFading(true)
    setTimeout(() => setShowSite(true), 1000)
  }, [])

  useEffect(() => {
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
  }, [beginExit])

  const onAssetsReady = useCallback(() => {
    assetsReady.current = true
  }, [])

  return (
    <div className="bg-black min-h-screen w-full relative">

      {/* Fixed 3D layer — mounted immediately so textures preload
          behind the intro overlay (acts as the real loader) */}
      <Scene onReady={onAssetsReady} />

      {/* Entry overlay — fades once assets are ready */}
      <div
        className="fixed inset-0 z-50 bg-black transition-opacity duration-1000"
        style={{
          opacity: spiralFading ? 0 : 1,
          pointerEvents: spiralFading ? 'none' : 'auto',
        }}
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

      {/* Main site — mounted after the intro so section animations sync */}
      {showSite && (
        <>
          <SmoothScroll />
          <CustomCursor />

          {/* Navbar must stay OUTSIDE the animated wrapper: that wrapper
              keeps a transform (translateY) which would make this fixed
              navbar scroll away with it instead of sticking to the viewport */}
          <Navbar />

          <div className="animate-site-in relative z-10">
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
        </>
      )}

    </div>
  )
}
