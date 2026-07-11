/**
 * Canonical origin for metadata (OG tags, sitemap, robots).
 *
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment; the fallback only keeps
 * local builds honest.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SITE_NAME = 'SPIRAL'
export const SITE_TAGLINE = 'Interstellar Creative Studio'
