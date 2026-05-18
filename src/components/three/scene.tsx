'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { SolarSystem } from './solar-system'
import { useScrollProgress } from './use-scroll-progress'
import { useSectionAnchors } from './use-section-anchors'

const SECTION_IDS = ['hero', 'about', 'work', 'services', 'process', 'stats', 'contact']

export function Scene({ onReady }: { onReady?: () => void }) {
  const progress = useScrollProgress()
  const ids = useMemo(() => SECTION_IDS, [])
  const anchors = useSectionAnchors(ids)

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

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      <Canvas
        camera={{ position: [0, 6, 46], fov: 68, near: 0.1, far: 1200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#02020a']} />
        <fog attach="fog" args={['#02020a', 140, 460]} />
        <Suspense fallback={null}>
          <SolarSystem progress={progress} anchors={anchors} />
        </Suspense>
        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.82} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
