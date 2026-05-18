'use client'

import { Canvas } from '@react-three/fiber'
import { SpiralField } from './spiral-field'
import { useScrollProgress } from './use-scroll-progress'

/**
 * Fixed, full-viewport WebGL layer that sits behind all page content.
 * The whole-page scroll drives a 3D spiral the user travels through.
 */
export function Scene() {
  const progress = useScrollProgress()

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'var(--bg)' }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 70, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={['#000000', 18, 70]} />
        <SpiralField progress={progress} />
      </Canvas>
    </div>
  )
}
