'use client'

import { useEffect, useRef } from 'react'

/** Minimal awwwards-style cursor: a ring that lags the dot and grows
 *  over interactive elements. Disabled on touch devices. */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...mouse }
    let hovering = false
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      const t = e.target as HTMLElement
      hovering = !!t.closest('a, button, [role="button"]')
    }

    const loop = () => {
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

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
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
