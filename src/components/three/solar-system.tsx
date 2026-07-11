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
import { Sun } from './sun'
import { Atmosphere } from './atmosphere'
import {
  applyDayNight,
  applyPlanetShadowOnRing,
  applyRingShadowOnPlanet,
  type RingShadowUniforms,
  type SunUniforms,
} from './materials'
import type { Quality } from './quality'
import { ALL_BODIES, BODIES, SUN, type Anchor, type Body } from './bodies'
import { PlanetPicker, type PlanetPositions } from './planet-picker'

/* ── The journey ──────────────────────────────────────────────
   Every body is parked on the flight curve at the scroll fraction
   of the section it belongs to (or between two of them), so each
   planet "arrives" exactly as its section scrolls into view.
   The cast itself lives in ./bodies. */

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
    // A three.js texture is a mutable GPU resource, not React state — the
    // immutability lint doesn't know the difference.
    /* eslint-disable react-hooks/immutability */
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    /* eslint-enable react-hooks/immutability */
  }, [tex])
  return tex
}

/** Non-colour maps (normal, roughness) must stay linear, not sRGB. */
function useDataTexture(url: string) {
  const tex = useTexture(url) as THREE.Texture
  useLayoutEffect(() => {
    /* eslint-disable react-hooks/immutability */
    tex.colorSpace = THREE.NoColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    /* eslint-enable react-hooks/immutability */
  }, [tex])
  return tex
}

/**
 * Ocean gloss. The source is a specular map — white where light bounces — but
 * `roughnessMap` wants the opposite, so we flip it once at load time.
 */
function useOceanRoughness(url: string) {
  const src = useDataTexture(url)
  return useMemo(() => {
    const img = src.image as HTMLImageElement | undefined
    if (!img?.width) return null
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.filter = 'invert(1)'
    ctx.drawImage(img, 0, 0)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.NoColorSpace
    t.anisotropy = 8
    return t
  }, [src])
}

/** Deterministic PRNG so the belt is identical on every render and on the
 *  server — `Math.random()` during render is both impure and unstable. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Surfaces ────────────────────────────────────────────────── */

/** Rock and gas: colour map, plus bump relief where the world is airless. */
function BasicSurface({
  data,
  ringU,
  segments,
}: {
  data: Body
  ringU: RingShadowUniforms
  segments: number
}) {
  const map = useColorTexture(data.tex)

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 })
    if (data.bump) {
      m.bumpMap = map
      m.bumpScale = data.bump
    }
    if (data.ring === 'saturn') applyRingShadowOnPlanet(m, ringU)
    return m
  }, [map, data.bump, data.ring, ringU])

  return (
    <mesh material={material}>
      <sphereGeometry args={[data.radius, segments, segments]} />
    </mesh>
  )
}

/**
 * Earth, with the four maps that separate a globe from a marble: elevation
 * (normal), ocean gloss (inverted specular), city lights on the night side,
 * and a cloud shell turning slightly faster than the ground.
 */
function EarthSurface({ data, cloudsRef, sunU, segments }: {
  data: Body
  cloudsRef: RefObject<THREE.Mesh | null>
  sunU: SunUniforms
  segments: number
}) {
  const map = useColorTexture(data.tex)
  const normal = useDataTexture('/textures/earth_normal_2048.webp')
  const lights = useColorTexture('/textures/earth_lights_2048.webp')
  const cloudMap = useColorTexture('/textures/2k_earth_clouds.webp')
  const oceanRough = useOceanRoughness('/textures/earth_specular_1024.webp')

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 1,
      metalness: 0.06,
      emissiveMap: lights,
      emissive: new THREE.Color('#ffcf87'),
      emissiveIntensity: 1.5,
    })
    if (oceanRough) m.roughnessMap = oceanRough
    applyDayNight(m, sunU)
    return m
  }, [map, normal, lights, oceanRough, sunU])

  return (
    <>
      <mesh material={material}>
        <sphereGeometry args={[data.radius, segments, segments]} />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[data.radius * 1.012, segments, segments]} />
        <meshStandardMaterial
          alphaMap={cloudMap}
          color="#ffffff"
          transparent
          opacity={0.9}
          depthWrite={false}
          roughness={1}
        />
      </mesh>
    </>
  )
}

function Moon({
  radius,
  moonRef,
  segments,
}: {
  radius: number
  moonRef: RefObject<THREE.Group | null>
  segments: number
}) {
  const map = useColorTexture('/textures/1k_moon.webp')
  return (
    <group ref={moonRef}>
      <mesh>
        <sphereGeometry args={[radius * 0.27, segments, segments]} />
        {/* The colour map doubles as relief: on an airless world the craters
            you see are the craters you'd feel. */}
        <meshStandardMaterial map={map} bumpMap={map} bumpScale={0.02} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

/* ── Rings ───────────────────────────────────────────────────── */

/** Radial-strip UVs: the ring texture is a 1px-tall cross-section. */
function useRingGeometry(inner: number, outer: number) {
  return useMemo(() => {
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
}

/**
 * Saturn's rings, shadowed by the planet — and shadowing it back. The ring
 * texture is shared with the planet's material through `ringU` so the band it
 * casts across the clouds has the ring's own gaps in it.
 */
function SaturnRing({ radius, ringU }: { radius: number; ringU: RingShadowUniforms }) {
  const inner = radius * 1.35
  const outer = radius * 2.3
  const tex = useColorTexture('/textures/2k_saturn_ring_alpha.webp')
  const geom = useRingGeometry(inner, outer)
  const mesh = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      roughness: 0.9,
    })
    applyPlanetShadowOnRing(m, ringU)
    return m
  }, [tex, ringU])

  useLayoutEffect(() => {
    /* eslint-disable react-hooks/immutability */
    ringU.uRingTex.value = tex
    ringU.uRingInner.value = inner
    ringU.uRingOuter.value = outer
    /* eslint-enable react-hooks/immutability */
  }, [ringU, tex, inner, outer])

  const normal = useMemo(() => new THREE.Vector3(), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    if (!mesh.current) return
    // The ring plane tilts with the planet; read its live world orientation
    // rather than re-deriving it from the tilt angle.
    mesh.current.getWorldQuaternion(quat)
    ringU.uRingNormal.value.copy(normal.set(0, 0, 1).applyQuaternion(quat)).normalize()
  })

  return <mesh ref={mesh} geometry={geom} material={material} rotation={[-Math.PI / 2, 0, 0]} />
}

/** Uranus: faint, procedurally banded, nearly edge-on. */
function ThinRing({ radius }: { radius: number }) {
  const inner = radius * 1.5
  const outer = radius * 2.05
  const geom = useRingGeometry(inner, outer)

  const tex = useMemo(() => {
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

  return (
    <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        roughness={0.9}
      />
    </mesh>
  )
}

/* ── A single body, parked on the curve at its section fraction ── */

function CelestialBody({
  data,
  curve,
  anchors,
  sunPos,
  positions,
  quality,
  reducedMotion,
}: {
  data: Body
  curve: THREE.CatmullRomCurve3
  anchors: RefObject<Anchors>
  sunPos: RefObject<THREE.Vector3>
  positions: RefObject<PlanetPositions>
  quality: Quality
  reducedMotion: boolean
}) {
  const { camera } = useThree()
  const root = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const moon = useRef<THREE.Group>(null)

  // Where the sun sits from *this* body's point of view. Each planet is parked
  // somewhere else along a 300-unit flight path, so there is no single global
  // light direction to share.
  const sunU: SunUniforms = useMemo(
    () => ({ uSunViewDir: { value: new THREE.Vector3(0, 0, 1) } }),
    []
  )

  const ringU: RingShadowUniforms = useMemo(
    () => ({
      uSunPos: { value: new THREE.Vector3() },
      uPlanetCenter: { value: new THREE.Vector3() },
      uPlanetRadius: { value: data.radius },
      uRingNormal: { value: new THREE.Vector3(0, 1, 0) },
      uRingInner: { value: 1 },
      uRingOuter: { value: 2 },
      uRingTex: { value: null },
    }),
    [data.radius]
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const toSun = useMemo(() => new THREE.Vector3(), [])
  // Published so the picker can hit-test against this body without walking the
  // scene graph.
  const worldPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const f = THREE.MathUtils.clamp(fracOf(data.anchor, anchors.current), 0, 1)
    curve.getPointAt(f, tmp)
    tmp.set(tmp.x + data.offset[0], tmp.y + data.offset[1], tmp.z + data.offset[2])
    if (root.current) root.current.position.copy(tmp)
    positions.current.set(data.key, worldPos.copy(tmp))

    // View-space sun direction for the terminator and the atmosphere rim.
    toSun.copy(sunPos.current).sub(tmp).normalize()
    sunU.uSunViewDir.value.copy(toSun).transformDirection(camera.matrixWorldInverse)

    ringU.uSunPos.value.copy(sunPos.current)
    ringU.uPlanetCenter.value.copy(tmp)

    // Spin and the moon's orbit are the only motion here nobody asked for —
    // they're what "reduce motion" is actually about. Freeze them, but still
    // park the moon in its orbit rather than leaving it inside the planet.
    const step = reducedMotion ? 0 : delta
    if (spin.current) spin.current.rotation.y += step * data.spin
    if (clouds.current) clouds.current.rotation.y += step * data.spin * 1.4
    if (moon.current) {
      const a = reducedMotion ? 0.9 : state.clock.elapsedTime * 0.35
      const r = data.radius * 2.7
      moon.current.position.set(Math.cos(a) * r, Math.sin(a) * 0.35 * r, Math.sin(a) * r)
      moon.current.rotation.y = -a // tidally locked
    }
  })

  return (
    <group ref={root}>
      <group rotation={[0, 0, data.tilt]}>
        <group ref={spin}>
          {data.earth ? (
            <EarthSurface
              data={data}
              cloudsRef={clouds}
              sunU={sunU}
              segments={quality.segments}
            />
          ) : (
            <BasicSurface data={data} ringU={ringU} segments={quality.segments} />
          )}
        </group>
        {data.ring === 'saturn' && <SaturnRing radius={data.radius} ringU={ringU} />}
        {data.ring === 'thin' && <ThinRing radius={data.radius} />}
      </group>

      {data.atmosphere && (
        <Atmosphere
          radius={data.radius}
          color={data.atmosphere.color}
          intensity={data.atmosphere.intensity}
          power={data.atmosphere.power}
          thickness={data.atmosphere.thickness}
          sun={sunU}
        />
      )}

      {data.moon && (
        <Moon radius={data.radius} moonRef={moon} segments={Math.round(quality.segments * 0.75)} />
      )}
    </group>
  )
}

/** The star itself — parked like any other body, but lit from within. */
function SunBody({
  sunPos,
  positions,
  onSunMesh,
  segments,
  reducedMotion,
}: {
  sunPos: RefObject<THREE.Vector3>
  positions: RefObject<PlanetPositions>
  onSunMesh?: (mesh: THREE.Mesh | null) => void
  segments: number
  reducedMotion: boolean
}) {
  const root = useRef<THREE.Group>(null)
  const map = useColorTexture(SUN.tex)
  const worldPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (root.current) root.current.position.copy(sunPos.current)
    positions.current.set(SUN.key, worldPos.copy(sunPos.current))
  })

  return (
    <group ref={root}>
      <Sun
        radius={SUN.radius}
        map={map}
        onMesh={onSunMesh}
        segments={segments}
        animate={!reducedMotion}
      />
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
  const all = ALL_BODIES
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
              {/* The planet is clickable, but nothing about a planet says so. */}
              <span className="cosmo-label__hint">Click to inspect</span>
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
  quality,
  reducedMotion,
}: {
  curve: THREE.CatmullRomCurve3
  anchors: RefObject<Anchors>
  quality: Quality
  reducedMotion: boolean
}) {
  const count = quality.asteroids
  const ref = useRef<THREE.InstancedMesh>(null)
  const rockMap = useColorTexture('/textures/1k_moon.webp')

  const seeds = useMemo(() => {
    const rand = mulberry32(0x5eed)
    return Array.from({ length: count }, () => ({
      t: rand(),
      ang: rand() * Math.PI * 2,
      rad: 6 + rand() * 13,
      y: (rand() - 0.5) * 9,
      s: 0.06 + rand() * 0.42,
      rot: rand() * Math.PI,
    }))
  }, [count])

  // Where each rock sits along the flight path. `getPointAt` walks the curve's
  // arc-length table on every call, so doing it per rock per frame was ~31k
  // lookups a second for positions that only move when the page is resized.
  const bases = useMemo(
    () => Array.from({ length: count }, () => new THREE.Vector3()),
    [count]
  )
  const cached = useRef({ f0: NaN, f1: NaN })
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!ref.current) return
    const a = anchors.current
    const f0 = fracOf({ between: ['work', 'services'], t: BELT_RANGE[0] }, a)
    const f1 = fracOf({ between: ['work', 'services'], t: BELT_RANGE[1] }, a)

    if (f0 !== cached.current.f0 || f1 !== cached.current.f1) {
      cached.current = { f0, f1 }
      for (let i = 0; i < count; i++) {
        const f = THREE.MathUtils.clamp(THREE.MathUtils.lerp(f0, f1, seeds[i].t), 0, 1)
        curve.getPointAt(f, bases[i])
      }
    }

    const spin = reducedMotion ? 0 : state.clock.elapsedTime * 0.025
    for (let i = 0; i < count; i++) {
      const s = seeds[i]
      const base = bases[i]
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
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 1]} />
      {/* No bump map here: it costs a derivative (dFdx) per pixel across 520
          instances, and flat shading already does the faceting these rocks need
          at the size they appear on screen. */}
      <meshStandardMaterial
        map={rockMap}
        color="#9a8e7e"
        roughness={1}
        metalness={0.05}
        flatShading
      />
    </instancedMesh>
  )
}

function MilkyWay() {
  const tex = useColorTexture('/textures/1k_stars_milky_way.webp')
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
  onSunMesh,
  onSelectPlanet,
  onDismissPlanet,
  quality,
  reducedMotion,
}: {
  progress: RefObject<number>
  anchors: RefObject<Anchors>
  onSunMesh?: (mesh: THREE.Mesh | null) => void
  onSelectPlanet: (key: string) => void
  onDismissPlanet: () => void
  quality: Quality
  reducedMotion: boolean
}) {
  const { camera } = useThree()
  const smooth = useRef(0)
  const bank = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const sunPos = useRef(new THREE.Vector3())
  const positions = useRef<PlanetPositions>(new Map())

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

  // Negative priority: the camera and the sun's position must be settled before
  // the bodies read them to build their view-space light directions.
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

    // Bank into the turns, like a craft rolling into a course change.
    if (!reducedMotion) {
      const targetBank = THREE.MathUtils.clamp((look.x - pos.x) * -0.02, -0.22, 0.22)
      bank.current += (targetBank - bank.current) * Math.min(1, delta * 1.5)
      camera.rotateZ(bank.current)
    }
    camera.updateMatrixWorld()

    // Every body's lighting is measured from here.
    const f = THREE.MathUtils.clamp(fracOf(SUN.anchor, anchors.current), 0, 1)
    curve.getPointAt(f, sunPos.current)
    sunPos.current.set(
      sunPos.current.x + SUN.offset[0],
      sunPos.current.y + SUN.offset[1],
      sunPos.current.z + SUN.offset[2]
    )
  }, -1)

  return (
    <>
      <ambientLight intensity={0.06} />
      <MilkyWay />
      <Stars
        radius={320}
        depth={150}
        count={quality.stars}
        factor={4}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.3}
      />
      <SunBody
        sunPos={sunPos}
        positions={positions}
        onSunMesh={onSunMesh}
        segments={quality.sunSegments}
        reducedMotion={reducedMotion}
      />
      {BODIES.map((b) => (
        <CelestialBody
          key={b.key}
          data={b}
          curve={curve}
          anchors={anchors}
          sunPos={sunPos}
          positions={positions}
          quality={quality}
          reducedMotion={reducedMotion}
        />
      ))}
      <AsteroidBelt
        curve={curve}
        anchors={anchors}
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <BodyLabel curve={curve} anchors={anchors} progress={progress} />
      <PlanetPicker
        positions={positions}
        onSelect={onSelectPlanet}
        onDismiss={onDismissPlanet}
      />
    </>
  )
}
