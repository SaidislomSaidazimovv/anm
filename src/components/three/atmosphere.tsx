'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { SunUniforms } from './materials'

/**
 * The band of air on a planet's limb. A slightly larger backside sphere with a
 * fresnel falloff: transparent where we look straight through the middle,
 * bright where the sightline grazes the edge — and only on the half the sun
 * actually reaches, so the night limb stays dark.
 */
export function Atmosphere({
  radius,
  color,
  sun,
  power = 3.0,
  intensity = 1.0,
  thickness = 1.055,
}: {
  radius: number
  color: string
  sun: SunUniforms
  /** Higher = thinner, sharper rim. */
  power?: number
  intensity?: number
  /** Shell size relative to the planet. */
  thickness?: number
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uPower: { value: power },
          uIntensity: { value: intensity },
          uSunViewDir: sun.uSunViewDir,
        },
        vertexShader: `
          varying vec3 vNormalView;
          varying vec3 vViewDir;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormalView = normalize(normalMatrix * normal);
            vViewDir = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uPower;
          uniform float uIntensity;
          uniform vec3 uSunViewDir;
          varying vec3 vNormalView;
          varying vec3 vViewDir;
          void main() {
            vec3 n = normalize(vNormalView);
            // Backside shell: the normal points away from us, so take |dot|.
            float rim = pow(1.0 - abs(dot(n, normalize(vViewDir))), uPower);
            // Scatter only where sunlight lands, with a soft wrap past the
            // terminator — that wrap is what makes dusk read as dusk.
            float lit = smoothstep(-0.35, 0.35, dot(n, normalize(uSunViewDir)));
            float a = rim * lit * uIntensity;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [color, power, intensity, sun]
  )

  return (
    <mesh>
      {/* 32 segments: this is a soft glow with no silhouette of its own, so the
          extra tessellation bought nothing. */}
      <sphereGeometry args={[radius * thickness, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
