'use client'

import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ALL_BODIES } from './bodies'

/** Live world positions of every body, written each frame by the scene. */
export type PlanetPositions = Map<string, THREE.Vector3>

/**
 * Makes the planets clickable.
 *
 * The canvas sits *under* the page (z-0, pointer-events: none) so text stays
 * selectable and links stay clickable — which also means the canvas never
 * receives a click of its own. So instead of listening on the canvas, we listen
 * on the window and cast a ray ourselves: nine sphere tests, cheap enough to
 * run on every pointer move.
 *
 * Clicks that land on something the page actually owns — a link, a button, a
 * text selection the visitor just made — are left alone.
 */
export function PlanetPicker({
  positions,
  onSelect,
  onDismiss,
  onHover,
  enabled = true,
}: {
  positions: RefObject<PlanetPositions>
  onSelect: (key: string) => void
  /** Clicked empty space — no world under the pointer. */
  onDismiss?: () => void
  onHover?: (key: string | null) => void
  enabled?: boolean
}) {
  const { camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const sphere = useMemo(() => new THREE.Sphere(), [])
  const hovered = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    /** The body under the given screen point, nearest camera first. */
    const pick = (clientX: number, clientY: number): string | null => {
      ndc.set(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      )
      raycaster.setFromCamera(ndc, camera)

      let best: string | null = null
      let bestDist = Infinity

      for (const body of ALL_BODIES) {
        const center = positions.current.get(body.key)
        if (!center) continue
        // A little generous, so small worlds are still easy to hit.
        sphere.set(center, body.radius * 1.2)
        if (!raycaster.ray.intersectsSphere(sphere)) continue

        const dist = camera.position.distanceTo(center)
        if (dist < bestDist) {
          bestDist = dist
          best = body.key
        }
      }
      return best
    }

    let queued = false
    let lastX = 0
    let lastY = 0

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX
      lastY = e.clientY
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        const hit = pick(lastX, lastY)
        if (hit !== hovered.current) {
          hovered.current = hit
          onHover?.(hit)
          // The custom cursor listens for this and swells over a planet.
          window.dispatchEvent(new CustomEvent('planet-hover', { detail: !!hit }))
        }
      })
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      // Chrome above the scene — the panel, the navs — owns its own clicks;
      // without this, clicking inside the open panel would pick whatever planet
      // happens to be behind it.
      if (target?.closest('a, button, input, textarea, [role="button"], [data-no-pick]')) {
        return
      }
      // A click that ends a text selection is a selection, not a pick.
      if (window.getSelection()?.toString()) return

      const hit = pick(e.clientX, e.clientY)
      if (hit) onSelect(hit)
      else onDismiss?.()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('click', onClick)
      window.dispatchEvent(new CustomEvent('planet-hover', { detail: false }))
    }
  }, [camera, enabled, ndc, onDismiss, onHover, onSelect, positions, raycaster, sphere])

  return null
}
