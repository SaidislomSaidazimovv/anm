'use client'

import { createContext, useContext } from 'react'

/**
 * True once the intro overlay has cleared. Sections stay mounted from the
 * first render (so the HTML ships with real content), but they hold their
 * entrance animations until the site is actually visible — otherwise every
 * reveal would play behind the black overlay and be over before it lifts.
 *
 * Defaults to true so a section rendered outside the provider still animates.
 */
export const SiteEnteredContext = createContext(true)

export function useSiteEntered() {
  return useContext(SiteEnteredContext)
}
