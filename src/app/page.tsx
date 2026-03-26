'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/sections/hero'
import { Work } from '@/components/sections/work'
import { Services } from '@/components/sections/services'
import { Contact } from '@/components/sections/contact'
import { useState, useEffect } from 'react'

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
    <div className="bg-black min-h-screen w-full">

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

        {/* ENTER text — centered, decorative only, not clickable */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p
            className="text-white text-sm tracking-[0.5em] uppercase font-light select-none transition-opacity duration-[2000ms]"
            style={{ opacity: enterVisible ? 1 : 0 }}
          >
            ENTER
          </p>
        </div>
      </div>

      {/* Main site — fades in after spiral fades out */}
      <div
        className="transition-all duration-1000 ease-out"
        style={{
          opacity: showSite ? 1 : 0,
          transform: showSite ? 'translateY(0px)' : 'translateY(24px)'
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <Work />
          <Services />
          <Contact />
        </main>
      </div>

    </div>
  )
}
