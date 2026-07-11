/** Scroll to a `#section` anchor through Lenis when it's running, so the
 *  inertial scroll stays in charge of window.scrollY (the 3D flight reads it). */
export function scrollToSection(href: string) {
  const lenis = typeof window !== 'undefined' ? window.__lenis : undefined
  if (lenis) {
    lenis.scrollTo(href, { offset: -80 })
  } else {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }
}
