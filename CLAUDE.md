# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js is **16.2.1** with React 19 and Tailwind v4. Consult `node_modules/next/dist/docs/` (per AGENTS.md above) rather than relying on memory of older Next.js conventions.

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # typecheck; there is no separate script for it
```

There is no test suite.

## Architecture

A single-page marketing site for a fictional studio ("SPIRAL"), built as a scroll-driven flight through the solar system. Everything renders from `src/app/page.tsx` — there is exactly one route.

### The scroll → 3D contract

The 3D layer and the DOM sections are separate trees that stay in sync through **scroll fractions**, not through React state:

- `useScrollProgress` (`src/components/three/`) writes whole-page scroll as a `0..1` value into a **ref** — deliberately not state, so the R3F render loop can read it every frame without re-rendering React.
- `useSectionAnchors` measures each `<section id>`'s center as the same `0..1` fraction and stores it in a ref, recomputing on resize, on a `ResizeObserver` over `document.body`, and on a few delayed timers (sections mount *after* the intro, so the document height changes late).
- `solar-system.tsx` defines a `CatmullRomCurve3` flight path. The camera rides that curve at the smoothed scroll fraction; every planet is *parked* on the same curve at the fraction of the section it's anchored to (`{ section: 'work' }`, `{ between: ['about','work'], t: 0.5 }`, or `{ fixed }`) plus a static XYZ offset. That's why a planet "arrives" exactly as its section scrolls into view.

Consequence: **adding, removing, or reordering a section changes where planets sit.** The section id must exist in `SECTION_IDS` in `scene.tsx`, and bodies in `BODIES`/`SUN` reference those ids by name.

Lenis (`smooth-scroll.tsx`) drives real `window.scrollY`, so the scroll hooks keep working; it exposes `window.__lenis` so `navbar.tsx` can `scrollTo` anchors through it.

### Intro / loading gate

`page.tsx` mounts `<Scene>` immediately behind a full-screen black overlay running the canvas/GSAP `SpiralAnimation`. The 3D scene *is* the loader: `scene.tsx` hooks `THREE.DefaultLoadingManager.onLoad` and calls `onReady`. The overlay fades once assets are ready **and** `MIN_MS` (3.5s) has elapsed, with a hard `MAX_MS` (7s) fallback. Only then are `SmoothScroll`, `CustomCursor`, `Navbar`, and the sections mounted — section reveal animations are timed against that mount.

The `Navbar` is intentionally rendered outside the `.animate-site-in` wrapper: that wrapper holds a `translateY` transform, which would make a `position: fixed` child scroll away with it.

### Styling

Tailwind v4 (`@import "tailwindcss"` in `src/app/globals.css`, PostCSS plugin only — no `tailwind.config`). Design tokens are CSS custom properties in `:root` (`--bg`, `--text-primary/secondary/muted`, `--border`, `--font-heading`, `--font-body`) and are applied via inline `style={{ color: 'var(--text-muted)' }}` throughout, not via Tailwind color utilities. Bespoke classes (`.cosmo-label`, `.nav-link`, `.service-item`, `.animate-site-in`, keyframes) live in `globals.css`.

Do **not** add a universal `* { margin:0; padding:0 }` reset — see the comment in `globals.css`: unlayered CSS outranks Tailwind's layered utilities and would collapse all spacing.

shadcn is configured (`components.json`, style `base-nova`, aliases `@/components`, `@/lib/utils`) but only `ui/button.tsx` came from it; `ui/section-heading.tsx`, `ui/section-reveal.tsx`, and `ui/spiral-animation.tsx` are hand-written.

### Conventions

- `@/*` → `src/*`. Every component is `'use client'`; `Scene` is additionally `dynamic(..., { ssr: false })` because WebGL cannot render on the server.
- Sections live in `src/components/sections/`, one file per `<section id>`, composed in `page.tsx` in scroll order. They wrap content in `<SectionReveal>` (IntersectionObserver fade-up) and `<SectionHeading>`.
- Planet textures are 2k JPEGs in `public/textures/`; they load through drei's `useTexture`, which is what feeds the loading manager gate above.
- `src/components/three/spiral-field.tsx` is currently unused.
