'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/sections/hero'
import { Work } from '@/components/sections/work'
import { Services } from '@/components/sections/services'
import { Contact } from '@/components/sections/contact'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(
  () => import('@/components/three/scene').then((m) => m.Scene),
  { ssr: false }
)

export default function Home() {
  const [showSite, setShowSite] = useState(false)
  const [spiralFading, setSpiralFading] = useState(false)
  const [enterVisible, setEnterVisible] = useState(false)

  useEffect(() => {
    const t0 = setTimeout(() => setEnterVisible(true), 500)
    const t1 = setTimeout(() => setSpiralFading(true), 14500)
    const t2 = setTimeout(() => setShowSite(true), 15500)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="bg-black min-h-screen w-full relative">

      {/* Entry overlay — fades out automatically */}
      <div
        className="fixed inset-0 z-50 bg-black transition-opacity duration-1000"
        style={{
          opacity: spiralFading ? 0 : 1,
          pointerEvents: spiralFading ? 'none' : 'auto'
        }}
      >
        {/* Spiral canvas */}
        <div className="absolute inset-0 z-0">
          <SpiralAnimation />
        </div>

        {/* ENTER text — slightly below center, breathing animation, decorative only */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div
            className="transition-all duration-[1800ms] ease-out"
            style={{
              opacity: enterVisible ? 1 : 0,
              transform: enterVisible
                ? 'translateY(160px)'
                : 'translateY(180px)',
            }}
          >
            <p className="animate-enter-breathe text-white text-sm tracking-[0.5em] uppercase font-light select-none">
              ENTER
            </p>
          </div>
        </div>
      </div>

      {/* Main site — mounted only after the intro ends so each section's
          entrance animation plays in sync instead of behind the overlay */}
      {showSite && (
        <>
          {/* Fixed 3D layer behind everything */}
          <Scene />

          <div className="animate-site-in relative z-10">
            <Navbar />
            <main>
              <Hero />
              <Work />
              <Services />
              <Contact />
            </main>
          </div>
        </>
      )}

    </div>
  )
}
