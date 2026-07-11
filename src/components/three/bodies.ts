/**
 * The cast of the journey — shared by the 3D scene, the info panel and the
 * journey nav, so a planet's name, its section and its numbers can never drift
 * apart.
 *
 * Figures are the real ones (NASA); the radii and offsets below are staging,
 * not scale — at true scale Jupiter would be a pixel and the sun a mile wide.
 */

export type Anchor =
  | { section: string }
  | { between: [string, string]; t: number }
  | { fixed: number }

export type Fact = { label: string; value: string }

export type Body = {
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
  /** Relief faked from the colour map — airless, cratered worlds only. */
  bump?: number
  /** Earth gets the full stack: normal map, ocean gloss, city lights. */
  earth?: boolean
  atmosphere?: {
    color: string
    intensity?: number
    power?: number
    thickness?: number
  }
  /** Shown in the panel when the body is clicked. */
  blurb: string
  facts: Fact[]
}

export const SUN: Body = {
  key: 'sun',
  tex: '/textures/2k_sun.webp',
  radius: 6,
  tilt: 0,
  spin: 0.02,
  anchor: { section: 'hero' },
  offset: [-13, 2, -20],
  name: 'Sol',
  tag: 'Departure',
  blurb:
    'A middling yellow dwarf holding everything else in this system on a string. Every gram of light you have ever seen left here about eight minutes ago.',
  facts: [
    { label: 'Diameter', value: '1,392,700 km' },
    { label: 'Surface', value: '5,500 °C' },
    { label: 'Class', value: 'G2V main sequence' },
  ],
}

export const BODIES: Body[] = [
  {
    key: 'mercury',
    tex: '/textures/1k_mercury.webp',
    radius: 1.3,
    tilt: 0.01,
    spin: 0.05,
    anchor: { section: 'about' },
    offset: [11, 2, -7],
    name: 'Mercury',
    tag: 'Origin',
    bump: 0.035,
    blurb:
      'No atmosphere to hold the heat, so noon and midnight are 600 degrees apart. The smallest planet, and the fastest — one lap of the sun in 88 days.',
    facts: [
      { label: 'Diameter', value: '4,879 km' },
      { label: 'From the sun', value: '57.9M km' },
      { label: 'Temperature', value: '−180 to 430 °C' },
    ],
  },
  {
    key: 'venus',
    tex: '/textures/1k_venus_atmosphere.webp',
    radius: 2.4,
    tilt: 0.05,
    spin: -0.03,
    anchor: { between: ['about', 'work'], t: 0.5 },
    offset: [-12, 3, -6],
    name: 'Venus',
    tag: 'Transit',
    atmosphere: { color: '#ffcf8a', intensity: 1.15, power: 2.4, thickness: 1.075 },
    blurb:
      'Earth-sized and hot enough to melt lead, under clouds of sulphuric acid. It also turns backwards — the only planet where the sun rises in the west.',
    facts: [
      { label: 'Diameter', value: '12,104 km' },
      { label: 'From the sun', value: '108.2M km' },
      { label: 'Surface', value: '465 °C' },
    ],
  },
  {
    key: 'earth',
    tex: '/textures/2k_earth_daymap.webp',
    radius: 2.6,
    tilt: 0.41,
    spin: 0.12,
    clouds: true,
    moon: true,
    anchor: { section: 'work' },
    offset: [12, -2, -7],
    name: 'Earth',
    tag: 'Home base',
    earth: true,
    atmosphere: { color: '#5fa8ff', intensity: 1.25, power: 3.0, thickness: 1.06 },
    blurb:
      'The only place known to run its own weather, oceans and opinions. The lights on the night side are ours.',
    facts: [
      { label: 'Diameter', value: '12,742 km' },
      { label: 'From the sun', value: '149.6M km' },
      { label: 'Moons', value: '1' },
    ],
  },
  {
    key: 'mars',
    tex: '/textures/1k_mars.webp',
    radius: 1.9,
    tilt: 0.44,
    spin: 0.11,
    anchor: { between: ['work', 'services'], t: 0.4 },
    offset: [-11, -3, -6],
    name: 'Mars',
    tag: 'Transit',
    bump: 0.03,
    atmosphere: { color: '#ff9c6b', intensity: 0.5, power: 3.6, thickness: 1.035 },
    blurb:
      'Rusted iron dust, a thin cold sky, and Olympus Mons — a volcano two and a half times the height of Everest.',
    facts: [
      { label: 'Diameter', value: '6,779 km' },
      { label: 'From the sun', value: '227.9M km' },
      { label: 'Tallest peak', value: '21.9 km' },
    ],
  },
  {
    key: 'jupiter',
    tex: '/textures/2k_jupiter.webp',
    radius: 5.4,
    tilt: 0.05,
    spin: 0.24,
    anchor: { section: 'services' },
    offset: [14, 4, -9],
    name: 'Jupiter',
    tag: 'Scale',
    atmosphere: { color: '#ffd8ad', intensity: 0.55, power: 3.4, thickness: 1.03 },
    blurb:
      'Twice the mass of everything else orbiting the sun, combined. The Great Red Spot is a storm wider than Earth that has been turning for centuries.',
    facts: [
      { label: 'Diameter', value: '139,820 km' },
      { label: 'From the sun', value: '778.5M km' },
      { label: 'Day length', value: '9h 56m' },
    ],
  },
  {
    key: 'saturn',
    tex: '/textures/2k_saturn.webp',
    radius: 4.4,
    tilt: 0.47,
    spin: 0.2,
    ring: 'saturn',
    anchor: { section: 'process' },
    offset: [-14, -3, -8],
    name: 'Saturn',
    tag: 'Process',
    atmosphere: { color: '#ffe6bd', intensity: 0.5, power: 3.4, thickness: 1.03 },
    blurb:
      'The rings span 280,000 km and are, in places, ten metres thick — a structure the width of a planet and the depth of a room. Mostly water ice.',
    facts: [
      { label: 'Diameter', value: '116,460 km' },
      { label: 'From the sun', value: '1.43B km' },
      { label: 'Ring span', value: '280,000 km' },
    ],
  },
  {
    key: 'uranus',
    tex: '/textures/1k_uranus.webp',
    radius: 3.2,
    tilt: 1.71,
    spin: 0.16,
    ring: 'thin',
    anchor: { section: 'stats' },
    offset: [13, 3, -7],
    name: 'Uranus',
    tag: 'Trajectory',
    atmosphere: { color: '#9ff0ef', intensity: 0.9, power: 3.0, thickness: 1.05 },
    blurb:
      'Knocked onto its side at some point in its history, it rolls around its orbit rather than spinning upright. Each pole gets 42 years of daylight.',
    facts: [
      { label: 'Diameter', value: '50,724 km' },
      { label: 'From the sun', value: '2.87B km' },
      { label: 'Axial tilt', value: '98°' },
    ],
  },
  {
    key: 'neptune',
    tex: '/textures/1k_neptune.webp',
    radius: 3.0,
    tilt: 0.49,
    spin: 0.16,
    anchor: { section: 'contact' },
    offset: [12, -2, -7],
    name: 'Neptune',
    tag: 'Transmit',
    atmosphere: { color: '#4f7dff', intensity: 1.1, power: 3.0, thickness: 1.055 },
    blurb:
      'The last stop, and the windiest place in the system — supersonic storms at 2,100 km/h. Found on paper first: predicted by mathematics, then looked for.',
    facts: [
      { label: 'Diameter', value: '49,244 km' },
      { label: 'From the sun', value: '4.5B km' },
      { label: 'Wind speed', value: '2,100 km/h' },
    ],
  },
]

export const ALL_BODIES: Body[] = [SUN, ...BODIES]

/** Only the bodies that own a section get a stop on the journey nav — Venus and
 *  Mars are passed in transit, between two stops. */
export const JOURNEY_STOPS = ALL_BODIES.filter(
  (b): b is Body & { anchor: { section: string } } => 'section' in b.anchor
).map((b) => ({ key: b.key, name: b.name, tag: b.tag, section: b.anchor.section }))
