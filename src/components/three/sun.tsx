'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * The sun as a star rather than a lit ball: the photo texture is churned by
 * animated noise (granulation), darkened toward the limb the way a real
 * photosphere is, and wrapped in a camera-facing corona. It writes way above
 * 1.0 so the bloom pass has something to bleed.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  varying vec3 vPos;

  // Cheap 3D value noise — enough for convection cells, no gradient noise cost.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  // Two octaves, not four. Each octave is eight hash calls, and this shader runs
  // on every pixel of a sun that fills a third of the hero — octaves three and
  // four were detail nobody could see at that cost.
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 2; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    // Normalised by the amplitude sum (0.5 + 0.25), so dropping octaves doesn't
    // dim the output and shift every threshold below.
    return v / 0.75;
  }

  void main() {
    vec3 p = normalize(vPos);

    // Two noise fields drifting at different speeds: the slow one warps the
    // fast one, which is what gives the surface its churning look.
    float slow = fbm(p * 2.6 + vec3(0.0, uTime * 0.045, 0.0));
    float fast = fbm(p * 7.0 + slow * 1.4 + vec3(uTime * 0.09, 0.0, uTime * 0.06));

    vec3 base = texture2D(uMap, vUv).rgb;

    // Granulation: bright cell centers, darker lanes between them.
    float cells = smoothstep(0.35, 0.85, fast);
    vec3 hot = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.93, 0.72), cells);
    vec3 color = mix(base, hot, 0.55) * (0.75 + 0.55 * cells);

    // Limb darkening — the edge of a real photosphere is cooler and dimmer.
    float mu = abs(dot(normalize(vNormalView), normalize(vViewDir)));
    color *= 0.45 + 0.55 * pow(mu, 0.55);

    gl_FragColor = vec4(color * uIntensity, 1.0);
  }
`

/** Camera-facing corona so the star keeps a halo from every angle. */
function useCoronaTexture() {
  return useMemo(() => {
    const s = 256
    const c = document.createElement('canvas')
    c.width = c.height = s
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0.0, 'rgba(255,247,225,0.95)')
    g.addColorStop(0.18, 'rgba(255,180,90,0.55)')
    g.addColorStop(0.45, 'rgba(255,130,45,0.22)')
    g.addColorStop(0.75, 'rgba(255,110,40,0.06)')
    g.addColorStop(1.0, 'rgba(255,110,40,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

export function Sun({
  radius,
  map,
  onMesh,
  segments = 96,
  animate = true,
}: {
  radius: number
  map: THREE.Texture
  /** Handed up so the god-rays pass knows what the light source is. */
  onMesh?: (mesh: THREE.Mesh | null) => void
  segments?: number
  /** False under `prefers-reduced-motion`: the surface freezes mid-churn. */
  animate?: boolean
}) {
  const corona = useCoronaTexture()
  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uTime: { value: 0 },
      uIntensity: { value: 2.1 },
    }),
    [map]
  )
  const mat = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (animate && mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  const coronaScale = radius * 4.2

  return (
    <group>
      <mesh ref={onMesh} frustumCulled={false}>
        <sphereGeometry args={[radius, segments, segments]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          toneMapped={false}
        />
      </mesh>

      <sprite scale={[coronaScale, coronaScale, 1]} frustumCulled={false}>
        <spriteMaterial
          map={corona}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.85}
          toneMapped={false}
        />
      </sprite>

      {/* Decay is off on purpose: the planets are parked hundreds of units down
          the flight path, and inverse-square falloff would leave them black. */}
      <pointLight intensity={1.05} distance={0} decay={0} color="#fff2dd" />
    </group>
  )
}
