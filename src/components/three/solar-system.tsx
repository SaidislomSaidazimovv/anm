'use client'

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars, useTexture, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import type { Anchors } from './use-section-anchors'

/* ── The journey ──────────────────────────────────────────────
   Every body is parked on the flight curve at the scroll fraction
   of the section it belongs to (or between two of them), so each
   planet "arrives" exactly as its section scrolls into view. */

type Anchor =
  | { section: string }
  | { between: [string, string]; t: number }
  | { fixed: number }

type Body = {
  key: string
  tex: string
  radius: number
  tilt: number
  spin: number
  clouds?: boolean
  ring?: 'saturn' | 'thin'
  moon?: boolean
  anchor: Anchor
  offset: [number, number, number]
  name: string
  tag: string
}

const SUN: Body = {
  key: 'sun', tex: '/textures/2k_sun.jpg', radius: 6, tilt: 0, spin: 0.02,
  anchor: { section: 'hero' }, offset: [-13, 2, -20], name: 'Sol', tag: 'Departure',
}

const BODIES: Body[] = [
  { key: 'mercury', tex: '/textures/2k_mercury.jpg', radius: 1.3, tilt: 0.01, spin: 0.05,
    anchor: { section: 'about' }, offset: [11, 2, -7], name: 'Mercury', tag: 'Origin' },
  { key: 'venus', tex: '/textures/2k_venus_atmosphere.jpg', radius: 2.4, tilt: 0.05, spin: -0.03,
    anchor: { between: ['about', 'work'], t: 0.5 }, offset: [-12, 3, -6], name: 'Venus', tag: 'Transit' },
  { key: 'earth', tex: '/textures/2k_earth_daymap.jpg', radius: 2.6, tilt: 0.41, spin: 0.12,
    clouds: true, moon: true, anchor: { section: 'work' }, offset: [12, -2, -7], name: 'Earth', tag: 'Home base' },
  { key: 'mars', tex: '/textures/2k_mars.jpg', radius: 1.9, tilt: 0.44, spin: 0.11,
    anchor: { between: ['work', 'services'], t: 0.4 }, offset: [-11, -3, -6], name: 'Mars', tag: 'Transit' },
  { key: 'jupiter', tex: '/textures/2k_jupiter.jpg', radius: 5.4, tilt: 0.05, spin: 0.24,
    anchor: { section: 'services' }, offset: [14, 4, -9], name: 'Jupiter', tag: 'Scale' },
  { key: 'saturn', tex: '/textures/2k_saturn.jpg', radius: 4.4, tilt: 0.47, spin: 0.2, ring: 'saturn',
    anchor: { section: 'process' }, offset: [-14, -3, -8], name: 'Saturn', tag: 'Process' },
  { key: 'uranus', tex: '/textures/2k_uranus.jpg', radius: 3.2, tilt: 1.71, spin: 0.16, ring: 'thin',
    anchor: { section: 'stats' }, offset: [13, 3, -7], name: 'Uranus', tag: 'Trajectory' },
  { key: 'neptune', tex: '/textures/2k_neptune.jpg', radius: 3.0, tilt: 0.49, spin: 0.16,
    anchor: { section: 'contact' }, offset: [12, -2, -7], name: 'Neptune', tag: 'Transmit' },
]

// Belt lives in the clear gap between Mars (t≈0.4) and Jupiter
// (t=1.0), so it never intersects a planet.
const BELT_RANGE: [number, number] = [0.52, 0.86]

function fracOf(a: Anchor, anchors: Anchors): number {
  if ('fixed' in a) return a.fixed
  if ('section' in a) return anchors[a.section] ?? 0.5
  const x = anchors[a.between[0]] ?? 0.33
  const y = anchors[a.between[1]] ?? 0.66
  return THREE.MathUtils.lerp(x, y, a.t)
}

function useColorTexture(url: string) {
  const tex = useTexture(url) as THREE.Texture
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
  }, [tex])
  return tex
}

/* ── Soft camera-facing star glow (stable, no backside flicker) ── */
function useGlowTexture() {
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

function SunGlow({ radius }: { radius: number }) {
  const tex = useGlowTexture()
  const s = radius * 4.2
  return (
    <sprite scale={[s, s, 1]} frustumCulled={false}>
      <spriteMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.85}
      />
    </sprite>
  )
}

/* ── Generic ring with radial-strip UVs ── */
function Ring({
  inner,
  outer,
  texture,
  opacity = 0.95,
}: {
  inner: number
  outer: number
  texture: THREE.Texture
  opacity?: number
}) {
  const geom = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 128)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5)
    }
    uv.needsUpdate = true
    return g
  }, [inner, outer])
  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        roughness={0.9}
        opacity={opacity}
      />
    </mesh>
  )
}

/** Procedural faint banded ring (Uranus) — soft transparent edges. */
function useUranusRingTexture() {
  return useMemo(() => {
    const w = 256
    const c = document.createElement('canvas')
    c.width = w
    c.height = 4
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0.0, 'rgba(160,200,210,0)')
    g.addColorStop(0.12, 'rgba(170,205,215,0.18)')
    g.addColorStop(0.35, 'rgba(150,190,205,0.07)')
    g.addColorStop(0.55, 'rgba(180,215,225,0.22)')
    g.addColorStop(0.78, 'rgba(150,185,200,0.06)')
    g.addColorStop(0.92, 'rgba(170,205,215,0.14)')
    g.addColorStop(1.0, 'rgba(160,200,210,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, 4)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

/* ── A single body, parked on the curve at its section fraction ── */
function CelestialBody({
  data,
  curve,
  anchors,
}: {
  data: Body
  curve: THREE.CatmullRomCurve3
  anchors: RefObject<Anchors>
}) {
  const root = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const moon = useRef<THREE.Group>(null)
  const map = useColorTexture(data.tex)
  const cloudMap = useColorTexture('/textures/2k_earth_clouds.jpg')
  const moonMap = useColorTexture('/textures/2k_moon.jpg')
  const saturnRingTex = useColorTexture('/textures/2k_saturn_ring_alpha.png')
  const uranusRingTex = useUranusRingTexture()
  const isSun = data.key === 'sun'

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const f = THREE.MathUtils.clamp(fracOf(data.anchor, anchors.current), 0, 1)
    curve.getPointAt(f, tmp)
    if (root.current) {
      root.current.position.set(
        tmp.x + data.offset[0],
        tmp.y + data.offset[1],
        tmp.z + data.offset[2]
      )
    }
    if (spin.current) spin.current.rotation.y += delta * data.spin
    if (clouds.current) clouds.current.rotation.y += delta * data.spin * 1.4
    if (moon.current) {
      const a = state.clock.elapsedTime * 0.35
      const r = data.radius * 2.7
      moon.current.position.set(Math.cos(a) * r, Math.sin(a) * 0.35 * r, Math.sin(a) * r)
      moon.current.rotation.y = -a // tidally locked
    }
  })

  return (
    <group ref={root}>
      <group rotation={[0, 0, data.tilt]}>
        <group ref={spin}>
          <mesh frustumCulled={!isSun}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            {isSun ? (
              <meshStandardMaterial
                map={map}
                emissiveMap={map}
                emissive="#ffffff"
                emissiveIntensity={2.6}
                toneMapped={false}
              />
            ) : (
              <meshStandardMaterial map={map} roughness={1} metalness={0} />
            )}
          </mesh>
          {data.clouds && (
            <mesh ref={clouds}>
              <sphereGeometry args={[data.radius * 1.012, 64, 64]} />
              <meshStandardMaterial
                alphaMap={cloudMap}
                color="#ffffff"
                transparent
                opacity={0.9}
                depthWrite={false}
                roughness={1}
              />
            </mesh>
          )}
        </group>
        {data.ring === 'saturn' && (
          <Ring
            inner={data.radius * 1.35}
            outer={data.radius * 2.3}
            texture={saturnRingTex}
          />
        )}
        {data.ring === 'thin' && (
          <Ring
            inner={data.radius * 1.5}
            outer={data.radius * 2.05}
            texture={uranusRingTex}
            opacity={1}
          />
        )}
      </group>

      {isSun && (
        <>
          <pointLight intensity={1.05} distance={0} decay={0} color="#fff2dd" />
          <SunGlow radius={data.radius} />
        </>
      )}

      {data.moon && (
        <group ref={moon}>
          <mesh>
            <sphereGeometry args={[data.radius * 0.27, 48, 48]} />
            <meshStandardMaterial map={moonMap} roughness={1} metalness={0} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/* ── Single shared HUD label that snaps to whichever body the
   current section belongs to (one DOM node, no flicker) ── */
function BodyLabel({
  curve,
  anchors,
  progress,
}: {
  curve: THREE.CatmullRomCurve3
  anchors: RefObject<Anchors>
  progress: RefObject<number>
}) {
  const grp = useRef<THREE.Group>(null)
  const all = useMemo(() => [SUN, ...BODIES], [])
  const [active, setActive] = useState<Body | null>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const p = progress.current ?? 0
    let best: Body | null = null
    let bestD = 0.05
    for (const b of all) {
      const f = THREE.MathUtils.clamp(fracOf(b.anchor, anchors.current), 0, 1)
      const d = Math.abs(p - f)
      if (d < bestD) {
        bestD = d
        best = b
      }
    }
    if (best?.key !== active?.key) setActive(best)
    if (best && grp.current) {
      const f = THREE.MathUtils.clamp(fracOf(best.anchor, anchors.current), 0, 1)
      curve.getPointAt(f, tmp)
      grp.current.position.set(
        tmp.x + best.offset[0],
        tmp.y + best.offset[1] + best.radius + 1.8,
        tmp.z + best.offset[2]
      )
    }
  })

  return (
    <group ref={grp} visible={!!active}>
      {active && (
        <Billboard>
          <Html center distanceFactor={24} pointerEvents="none" zIndexRange={[20, 0]}>
            <div className="cosmo-label">
              <span className="cosmo-label__name">{active.name}</span>
              <span className="cosmo-label__tag">{active.tag}</span>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  )
}

/* ── Asteroid belt the camera flies through (Mars → Jupiter) ── */
function AsteroidBelt({
  curve,
  anchors,
}: {
  curve: THREE.CatmullRomCurve3
  anchors: RefObject<Anchors>
}) {
  const COUNT = 520
  const ref = useRef<THREE.InstancedMesh>(null)
  const rockMap = useColorTexture('/textures/2k_moon.jpg')
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        t: Math.random(),
        ang: Math.random() * Math.PI * 2,
        rad: 6 + Math.random() * 13,
        y: (Math.random() - 0.5) * 9,
        s: 0.06 + Math.random() * 0.42,
        rot: Math.random() * Math.PI,
      })),
    []
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const base = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!ref.current) return
    const a = anchors.current
    const f0 = fracOf({ between: ['work', 'services'], t: BELT_RANGE[0] }, a)
    const f1 = fracOf({ between: ['work', 'services'], t: BELT_RANGE[1] }, a)
    const spin = state.clock.elapsedTime * 0.025
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i]
      const f = THREE.MathUtils.clamp(THREE.MathUtils.lerp(f0, f1, s.t), 0, 1)
      curve.getPointAt(f, base)
      const ang = s.ang + spin
      dummy.position.set(
        base.x + Math.cos(ang) * s.rad,
        base.y + s.y,
        base.z + Math.sin(ang) * s.rad
      )
      dummy.rotation.set(s.rot, s.rot + spin, s.rot * 0.5)
      dummy.scale.setScalar(s.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial map={rockMap} color="#9a8e7e" roughness={1} metalness={0.05} flatShading />
    </instancedMesh>
  )
}

function MilkyWay() {
  const tex = useColorTexture('/textures/2k_stars_milky_way.jpg')
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[480, 48, 48]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

/**
 * Scroll-driven flight through the full solar system. The camera
 * rides a piloted curve; each body sits on that same curve at its
 * section's scroll fraction, so the journey stays in sync.
 */
export function SolarSystem({
  progress,
  anchors,
}: {
  progress: RefObject<number>
  anchors: RefObject<Anchors>
}) {
  const { camera } = useThree()
  const smooth = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 6, 46),
        new THREE.Vector3(6, 2, 8),
        new THREE.Vector3(-8, 4, -34),
        new THREE.Vector3(9, -2, -78),
        new THREE.Vector3(-10, 5, -120),
        new THREE.Vector3(8, -4, -166),
        new THREE.Vector3(-9, 3, -214),
        new THREE.Vector3(7, 1, -262),
        new THREE.Vector3(-3, 2, -312),
      ]),
    []
  )

  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const target = progress.current ?? 0
    smooth.current += (target - smooth.current) * Math.min(1, delta * 3)
    const p = THREE.MathUtils.clamp(smooth.current, 0, 1)

    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.04
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.04

    curve.getPointAt(p, pos)
    curve.getPointAt(Math.min(p + 0.035, 1), look)

    camera.position.set(
      pos.x + pointer.current.x * 3,
      pos.y + pointer.current.y * 3,
      pos.z
    )
    camera.lookAt(look.x, look.y, look.z)
  })

  return (
    <>
      <ambientLight intensity={0.06} />
      <MilkyWay />
      <Stars radius={320} depth={150} count={3500} factor={4} saturation={0} fade speed={0.3} />
      <CelestialBody data={SUN} curve={curve} anchors={anchors} />
      {BODIES.map((b) => (
        <CelestialBody key={b.key} data={b} curve={curve} anchors={anchors} />
      ))}
      <AsteroidBelt curve={curve} anchors={anchors} />
      <BodyLabel curve={curve} anchors={anchors} progress={progress} />
    </>
  )
}
