/**
 * One quality decision, made once on mount, that the whole scene reads from.
 *
 * The flight is the same on every device — what changes is how much silicon it
 * costs. A phone gets fewer rocks, fewer stars, coarser spheres and no god-rays;
 * it does not get a different journey.
 */
export type Quality = {
  tier: 'lite' | 'full'
  dprMin: number
  dprMax: number
  /** Rocks in the asteroid belt. */
  asteroids: number
  stars: number
  /** Segments per planet sphere. */
  segments: number
  sunSegments: number
  godRays: boolean
}

// Pixels are the currency here: cost scales with dpr², and three full-screen
// post passes run over every one of them. At 1.75 we were rendering 3.1× the
// pixels the screen actually has; 1.5 is 2.25× and looks the same on a laptop.
const FULL: Quality = {
  tier: 'full',
  dprMin: 1,
  dprMax: 1.5,
  asteroids: 520,
  stars: 3500,
  segments: 64,
  sunSegments: 64,
  godRays: true,
}

const LITE: Quality = {
  tier: 'lite',
  dprMin: 1,
  dprMax: 1.25,
  asteroids: 160,
  stars: 1200,
  segments: 32,
  sunSegments: 40,
  godRays: false,
}

/** Client-only: the scene is mounted with `ssr: false`. */
export function detectQuality(): Quality {
  if (typeof window === 'undefined') return LITE

  const nav = navigator as Navigator & { deviceMemory?: number }
  const touch = window.matchMedia('(pointer: coarse)').matches
  const smallScreen = window.innerWidth < 900
  const lowMemory = (nav.deviceMemory ?? 8) <= 4
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4

  return touch || smallScreen || lowMemory || fewCores ? LITE : FULL
}
