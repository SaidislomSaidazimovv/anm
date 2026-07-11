'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, GodRays } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SolarSystem } from './solar-system'
import { useScrollProgress } from './use-scroll-progress'
import { useSectionAnchors } from './use-section-anchors'
import { detectQuality } from './quality'
import { ALL_BODIES } from './bodies'
import { PlanetPanel } from '@/components/planet-panel'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

const SECTION_IDS = ['hero', 'about', 'work', 'services', 'process', 'stats', 'contact']

export function Scene({ onReady }: { onReady?: () => void }) {
  const progress = useScrollProgress()
  const ids = useMemo(() => SECTION_IDS, [])
  const anchors = useSectionAnchors(ids)
  const reducedMotion = usePrefersReducedMotion()

  const quality = useMemo(() => detectQuality(), [])
  const [dpr, setDpr] = useState(quality.dprMax)

  // The god-rays pass needs the star it should shoot rays out of, so the sun
  // mesh is handed up here once the scene has built it.
  const [sun, setSun] = useState<THREE.Mesh | null>(null)

  const [selected, setSelected] = useState<string | null>(null)
  const selectedBody = useMemo(
    () => ALL_BODIES.find((b) => b.key === selected) ?? null,
    [selected]
  )
  const onSelectPlanet = useCallback((key: string) => setSelected(key), [])
  const closePanel = useCallback(() => setSelected(null), [])

  // Report readiness via the shared loading manager (no setState
  // during render — avoids the React "update while rendering" error).
  useEffect(() => {
    const mgr = THREE.DefaultLoadingManager
    const prev = mgr.onLoad
    let done = false
    mgr.onLoad = () => {
      if (!done) {
        done = true
        onReady?.()
      }
      prev?.()
    }
    return () => {
      mgr.onLoad = prev
    }
  }, [onReady])

  const godRays = quality.godRays && sun

  return (
    <>
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      <Canvas
        camera={{ position: [0, 6, 46], fov: 68, near: 0.1, far: 1200 }}
        dpr={dpr}
        // `antialias` is off on purpose: the composer renders the scene into its
        // own offscreen buffer, so MSAA on the default framebuffer is paid for
        // and never used. `high-performance` asks a dual-GPU laptop for the
        // discrete card instead of the integrated one.
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* The tier above is a guess from the hardware; this is the correction
            once we can see the real frame rate. */}
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(quality.dprMin, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(quality.dprMax, d + 0.25))}
        />

        <color attach="background" args={['#02020a']} />
        <fog attach="fog" args={['#02020a', 140, 460]} />

        <Suspense fallback={null}>
          <SolarSystem
            progress={progress}
            anchors={anchors}
            onSunMesh={setSun}
            onSelectPlanet={onSelectPlanet}
            onDismissPlanet={closePanel}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </Suspense>

        {/* Composer waits for the sun: GodRays has no light source without it,
            and would otherwise build a pass around `null`. The two variants are
            spelled out because EffectComposer takes effects as children — a
            conditional that renders nothing is not a valid one. */}
        {sun &&
          (godRays ? (
            <EffectComposer>
              {/* Every one of these samples is a texture fetch per pixel. 50 of
                  them, blurred, at full resolution was the most expensive thing
                  on screen — and the sun is only visible in the first section.
                  Half the samples at half resolution looks near-identical. */}
              <GodRays
                sun={sun}
                samples={26}
                resolutionScale={0.5}
                density={0.94}
                decay={0.92}
                weight={0.35}
                exposure={0.32}
                clampMax={1}
              />
              <Bloom
                intensity={1.1}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.4}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.25} darkness={0.82} />
            </EffectComposer>
          ) : (
            <EffectComposer>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.4}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.25} darkness={0.82} />
            </EffectComposer>
          ))}
      </Canvas>
    </div>

    {/* Outside the canvas wrapper on purpose: that wrapper is z-0 and
        pointer-events-none, so a panel nested inside it could neither rise
        above the page content nor be clicked. */}
    <PlanetPanel body={selectedBody} onClose={closePanel} />
    </>
  )
}
