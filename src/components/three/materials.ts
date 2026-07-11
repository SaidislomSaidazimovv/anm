import * as THREE from 'three'

/**
 * Shader patches for the planets. Everything here hooks `onBeforeCompile` on a
 * standard material instead of replacing it, so the bodies keep three's real
 * lighting (and the bloom pass keeps working) — we only add the effects three
 * has no built-in for: a day/night terminator, and the two-way shadow between
 * a ringed planet and its ring.
 */

export type SunUniforms = {
  /** Direction from the surface toward the sun, in *view* space. */
  uSunViewDir: { value: THREE.Vector3 }
}

export type RingShadowUniforms = {
  /** Sun position in world space. */
  uSunPos: { value: THREE.Vector3 }
  /** Planet center in world space. */
  uPlanetCenter: { value: THREE.Vector3 }
  uPlanetRadius: { value: number }
  /** Normal of the ring plane in world space. */
  uRingNormal: { value: THREE.Vector3 }
  uRingInner: { value: number }
  uRingOuter: { value: number }
  uRingTex: { value: THREE.Texture | null }
}

/** Declares `vWorldPos` in both stages — the ring shadow math needs it. */
function injectWorldPos(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;')
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;'
    )
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <common>',
    '#include <common>\nvarying vec3 vWorldPos;'
  )
}

/**
 * City lights that only burn on the dark half of the globe. An emissive map on
 * its own glows through the daylit side too, so we fade it out by the surface's
 * angle to the sun.
 */
export function applyDayNight(mat: THREE.MeshStandardMaterial, u: SunUniforms) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSunViewDir = u.uSunViewDir
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uSunViewDir;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float sunNdl = dot(normalize(vNormal), normalize(uSunViewDir));
         totalEmissiveRadiance *= smoothstep(0.12, -0.22, sunNdl);`
      )
  }
  mat.needsUpdate = true
}

/**
 * The ring's shadow band across the planet: march from the surface toward the
 * sun, and if that ray crosses the ring plane between the inner and outer
 * radius, dim the surface by however opaque the ring is at that radius.
 */
export function applyRingShadowOnPlanet(
  mat: THREE.MeshStandardMaterial,
  u: RingShadowUniforms
) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    injectWorldPos(shader)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform vec3 uSunPos;
         uniform vec3 uPlanetCenter;
         uniform vec3 uRingNormal;
         uniform float uRingInner;
         uniform float uRingOuter;
         uniform sampler2D uRingTex;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
         {
           vec3 toSun = normalize(uSunPos - vWorldPos);
           float denom = dot(uRingNormal, toSun);
           float shade = 0.0;
           if (abs(denom) > 1e-4) {
             float t = dot(uRingNormal, uPlanetCenter - vWorldPos) / denom;
             if (t > 0.0) {
               vec3 hit = vWorldPos + toSun * t;
               float r = length(hit - uPlanetCenter);
               if (r > uRingInner && r < uRingOuter) {
                 float uCoord = (r - uRingInner) / (uRingOuter - uRingInner);
                 shade = texture2D(uRingTex, vec2(uCoord, 0.5)).a;
               }
             }
           }
           diffuseColor.rgb *= mix(1.0, 0.30, clamp(shade, 0.0, 1.0));
         }`
      )
  }
  mat.needsUpdate = true
}

/**
 * The planet's own shadow falling across the ring: a ray-sphere test from each
 * ring particle toward the sun. Soft-edged, so the umbra doesn't look stamped.
 */
export function applyPlanetShadowOnRing(
  mat: THREE.MeshStandardMaterial,
  u: RingShadowUniforms
) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    injectWorldPos(shader)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform vec3 uSunPos;
         uniform vec3 uPlanetCenter;
         uniform float uPlanetRadius;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
         {
           vec3 toSun = normalize(uSunPos - vWorldPos);
           vec3 oc = vWorldPos - uPlanetCenter;
           float b = dot(oc, toSun);
           // The planet can only occlude the sun when it sits between the two.
           float axial = length(oc - toSun * b);
           float shade = (b < 0.0)
             ? smoothstep(uPlanetRadius * 1.08, uPlanetRadius * 0.88, axial)
             : 0.0;
           diffuseColor.rgb *= mix(1.0, 0.16, shade);
         }`
      )
  }
  mat.needsUpdate = true
}
