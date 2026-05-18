'use client'

import { useEffect, useState } from 'react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (href: string) => {
    setMenuOpen(false)
    const lenis = typeof window !== 'undefined' ? window.__lenis : undefined
    if (lenis) {
      lenis.scrollTo(href, { offset: -80 })
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-12 lg:px-24 h-16">
        {/* Logo */}
        <a href="#hero" onClick={() => handleClick('#hero')} className="flex items-center gap-3">
          {/* Orbital mark — matches the favicon */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="opacity-90">
            <ellipse
              cx="11"
              cy="11"
              rx="9.5"
              ry="3.8"
              transform="rotate(-28 11 11)"
              stroke="white"
              strokeWidth="1.2"
              opacity="0.55"
            />
            <circle cx="11" cy="11" r="3.6" fill="white" />
            <circle cx="19" cy="5" r="1.3" fill="white" />
          </svg>
          <span className="font-heading font-light text-sm tracking-[0.3em] uppercase" style={{ color: 'var(--text-primary)' }}>
            Spiral
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="nav-link font-body font-light text-sm tracking-[0.1em] uppercase bg-transparent border-none cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-[1px] bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-[1px] bg-white transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-[1px] bg-white transition-all duration-300"
            style={{
              transform: menuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className="md:hidden overflow-hidden transition-all duration-500"
        style={{
          maxHeight: menuOpen ? '300px' : '0',
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link.href)}
              className="font-body font-light text-lg tracking-[0.1em] uppercase bg-transparent border-none cursor-pointer text-left"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
