'use client'

import { useEffect, useRef } from 'react'

/**
 * Tracks whole-page scroll as a 0..1 progress value.
 * Stored in a ref (no re-render) so it can be read every frame
 * inside the R3F render loop.
 */
export function useScrollProgress() {
  const progress = useRef(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.current = max > 0 ? window.scrollY / max : 0
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return progress
}
