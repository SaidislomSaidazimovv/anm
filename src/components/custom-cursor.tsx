'use client'

import { useEffect, useRef, useState } from 'react'

/** Minimal awwwards-style cursor: a ring that lags the dot and grows
 *  over interactive elements. Disabled on touch devices.
 *
 *  Gated on the same `(pointer: fine)` query that hides the native cursor in
 *  globals.css — a width breakpoint would leave a narrow desktop window with
 *  no cursor at all. */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...mouse }
    let overElement = false
    let overPlanet = false
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      const t = e.target as HTMLElement
      overElement = !!t.closest('a, button, [role="button"]')
    }

    // The planets are picked by raycast, not by the DOM — so the cursor can only
    // learn about them by being told.
    const onPlanet = (e: Event) => {
      overPlanet = !!(e as CustomEvent<boolean>).detail
    }

    const loop = () => {
      const hovering = overElement || overPlanet
      ringPos.x += (mouse.x - ringPos.x) * 0.18
      ringPos.y += (mouse.y - ringPos.y) * 0.18
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${hovering ? 2.4 : 1})`
        ring.current.style.opacity = hovering ? '0.9' : '0.5'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('planet-hover', onPlanet)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('planet-hover', onPlanet)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={dot}
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
      <div
        ref={ring}
        className="absolute h-9 w-9 rounded-full border border-white/60 transition-[opacity] duration-200"
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}
