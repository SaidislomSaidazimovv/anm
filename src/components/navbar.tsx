'use client'

import { useEffect, useState } from 'react'
import { scrollToSection } from '@/lib/scroll-to'

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
    scrollToSection(href)
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
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault() // let Lenis own the scroll; the native jump fights it
            handleClick('#hero')
          }}
          className="flex items-center gap-3"
        >
          {/* Gargantua mark — same geometry as the favicon (src/app/icon.svg),
              monochrome here so it sits inside the site's black-and-white palette */}
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="1.8" opacity="0.75" />
            <ellipse cx="16" cy="16.4" rx="14" ry="2.7" fill="none" stroke="white" strokeWidth="1.8" opacity="0.75" />
            {/* event horizon — punches out the middle of the ring and the disk's far side */}
            <circle cx="16" cy="16" r="6.3" fill="#000000" />
            {/* near side of the disk crosses in front of the hole */}
            <path
              d="M2 16.4 A14 2.7 0 0 0 30 16.4"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
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
