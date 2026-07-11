'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Body } from '@/components/three/bodies'

/**
 * What you get for clicking a world: its real numbers, next to the staged one
 * you're flying past. Slides in from the right on desktop, up from the bottom
 * on a phone.
 */
export function PlanetPanel({ body, onClose }: { body: Body | null; onClose: () => void }) {
  useEffect(() => {
    if (!body) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [body, onClose])

  const open = !!body

  return (
    <aside
      // Kept mounted so it can animate out; hidden from assistive tech and from
      // the tab order while it's off-screen. The closed position is a class, not
      // an inline transform — the breakpoint has to decide it (bottom sheet on a
      // phone, side panel on a desktop), and CSS is what knows the breakpoint.
      aria-hidden={!open}
      aria-label={body ? `${body.name} details` : undefined}
      data-no-pick
      // Above the navbar (z-50), not below it: the navbar is a full-width bar
      // 64px tall, so at z-40 it sat on top of this panel's close button and ate
      // the click — a transparent background still catches pointer events.
      className={`fixed z-[55] transition-transform duration-500 ease-out
                  inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 md:bottom-0
                  md:w-[380px] md:h-full
                  ${open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <div
        className="h-full flex flex-col gap-8 p-8 md:p-10 md:justify-center"
        style={{
          background: 'rgba(2,2,10,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 cursor-pointer bg-transparent"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {body && (
          <>
            <div>
              <span
                className="font-body text-xs tracking-[0.3em] uppercase block mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {body.tag}
              </span>
              <h2
                className="font-heading font-light text-4xl md:text-5xl tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {body.name}
              </h2>
            </div>

            <p
              className="font-body font-light text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {body.blurb}
            </p>

            <dl className="flex flex-col" style={{ borderTop: '1px solid var(--border)' }}>
              {body.facts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-baseline justify-between gap-4 py-4"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <dt
                    className="font-body text-xs tracking-[0.2em] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {f.label}
                  </dt>
                  <dd
                    className="font-heading font-light text-lg text-right"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </aside>
  )
}
