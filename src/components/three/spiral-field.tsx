'use client'

import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 6000
const ARMS = 3
const TURNS = 4

/**
 * A 3D particle spiral galaxy stretched along -Z into a tunnel.
 * Scroll progress dollies the camera through it, spins the whole
 * field, and shifts the particle tint from white toward indigo.
 */
export function SpiralField({
  progress,
}: {
  progress: RefObject<number>
}) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.PointsMaterial>(null)
  const { camera } = useThree()
  const pointer = useRef({ x: 0, y: 0 })

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const inner = new THREE.Color('#ffffff')
    const outer = new THREE.Color('#6366f1')

    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT
      const arm = (i % ARMS) / ARMS
      const angle = t * Math.PI * 2 * TURNS + arm * Math.PI * 2
      const radius = 0.4 + t * 7

      // jitter so it reads as a galaxy, not a clean line
      const jx = (Math.random() - 0.5) * radius * 0.35
      const jy = (Math.random() - 0.5) * radius * 0.35
      const jz = (Math.random() - 0.5) * 4

      positions[i * 3] = Math.cos(angle) * radius + jx
      positions[i * 3 + 1] = Math.sin(angle) * radius + jy
      positions[i * 3 + 2] = -t * 60 + jz

      const c = inner.clone().lerp(outer, t)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    return { positions, colors }
  }, [])

  useFrame((state, delta) => {
    const p = progress.current ?? 0
    const time = state.clock.elapsedTime

    // Smooth pointer parallax
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05

    if (points.current) {
      // constant slow spin + scroll-driven extra rotation
      points.current.rotation.z = time * 0.04 + p * Math.PI * 1.5
      points.current.rotation.x = pointer.current.y * 0.25
      points.current.rotation.y = pointer.current.x * 0.25
    }

    // Camera dollies forward through the tunnel as you scroll
    const targetZ = 9 - p * 55
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 4)
    camera.position.x += (pointer.current.x * 2 - camera.position.x) * 0.05
    camera.position.y += (pointer.current.y * 2 - camera.position.y) * 0.05
    camera.lookAt(0, 0, camera.position.z - 12)

    if (material.current) {
      material.current.opacity = 0.55 + Math.sin(time * 0.8) * 0.08
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={0.06}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
