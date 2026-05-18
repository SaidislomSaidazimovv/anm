'use client'

import { useEffect, useRef } from 'react'

export type Anchors = Record<string, number>

/**
 * Measures where each section sits in the page as a 0..1 scroll
 * fraction (matching `useScrollProgress`'s scrollY/max basis).
 * Recomputes on resize and whenever the document height changes
 * (sections mount after the intro), so the 3D bodies can be parked
 * exactly where their section scrolls into view.
 */
export function useSectionAnchors(ids: string[]) {
  const anchors = useRef<Anchors>({})

  useEffect(() => {
    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const center = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2
        anchors.current[id] = max > 0 ? Math.min(1, Math.max(0, center / max)) : 0
      }
    }

    compute()
    window.addEventListener('resize', compute)

    const ro = new ResizeObserver(compute)
    ro.observe(document.body)

    const timers = [400, 1200, 3000].map((t) => setTimeout(compute, t))

    return () => {
      window.removeEventListener('resize', compute)
      ro.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [ids])

  return anchors
}
