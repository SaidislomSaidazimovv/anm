'use client'

import { useEffect, useState } from 'react'

/**
 * Whether the visitor has asked their OS to cut animation. For a site whose
 * whole premise is a flight through the solar system, this can't mean "remove
 * everything" — it means: no autoplaying motion, no launch sequence, no
 * inertial scroll hijack. What's left is driven by the scroll bar the visitor
 * is holding, which is motion they asked for.
 *
 * Starts false so the server render and the first client paint agree.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}
