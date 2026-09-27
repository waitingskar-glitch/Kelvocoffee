/**
 * "How to Kelvo" illustration, in the poster-vector style of the Hot / Cold
 * cups: heavy Ink outlines over flat colour layers stacked into tones (the
 * coffee's swirls, the cream, the deep browns), a painterly Caramel splash
 * behind the glass, speckles, glass shine and "look here" ticks.
 *
 * Three stacked SVG layers at different depths inside a 3D scene, so when
 * HowItWorks tilts the scene the layers shift against each other:
 *
 *   back   (-30px)  the splash, floor shadow and ground strokes
 *   middle (0)      the glass, its contents, the stir
 *   front  (+30px)  the pack, the milk jug, streams, sugar, measure labels
 *
 * The details follow the Hot / Cold cups too: a thick glass foot and inner
 * walls, a rim band and glint, a printed pouch with creases, drops kicked up
 * where each pour lands, misregistered colour on the splash, grounds at the
 * foot, and a spoon that dips in to stir at the end.
 *
 * Every moving part carries a `kv-*` class that HowItWorks animates with
 * anime.js; initial states are set in markup so the first paint is already
 * right before any script runs. The coffee is two stacked layers inside one
 * rising group: the dark concentrate, and over it the milky swirl, which
 * fades in when the milk goes in.
 */

const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' } as const
const fromBottom = { transformBox: 'fill-box', transformOrigin: '50% 100%' } as const

const layer = 'absolute inset-0 h-full w-full overflow-visible'
const svg = {
  viewBox: '0 0 320 360',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const INK = 'var(--color-ink)'
const PAPER = 'var(--color-paper)'
const LINE = 5

/** Splash tones: the warm oranges of the Hot cup. */
const SPLASH = { light: '#f8cb8e', mid: '#f09a3e', deep: '#d4691c' } as const
/** Coffee tones, lightest to darkest. */
const COFFEE = {
  cream: '#f6dfb6',
  latte: '#e9b36f',
  caramel: '#d9853a',
  brown: '#9c4a17',
  deep: '#4a220d',
  concentrate: '#2e1d14',
} as const

/** The glass: a tumbler, wide at the rim, tapering to a rounded foot. */
const GLASS = 'M98 176L118 296Q120 306 132 306H188Q200 306 202 296L222 176Z'
const INSIDE = 'M102 180L121 294Q123 302 133 302H187Q197 302 199 294L218 180Z'
const JUG = 'M172 36h44l-5 62a16 16 0 0 1-16 14h-2a16 16 0 0 1-16-14z'

/** A tapered brush stroke: centre, length, width, angle (degrees). */
function streak(cx: number, cy: number, length: number, width: number, degrees: number): string {
  const a = (degrees * Math.PI) / 180
  const dx = (Math.cos(a) * length) / 2
  const dy = (Math.sin(a) * length) / 2
  const nx = -Math.sin(a) * width
  const ny = Math.cos(a) * width
  const r = (n: number) => Math.round(n * 10) / 10
  return `M${r(cx - dx)} ${r(cy - dy)}Q${r(cx + nx)} ${r(cy + ny)} ${r(cx + dx)} ${r(cy + dy)}Q${r(cx - nx)} ${r(cy - ny)} ${r(cx - dx)} ${r(cy - dy)}Z`
}

/** The splash: broad light strokes, then mid, then deep, all flung the same way. */
const SPLASH_STROKES: Array<{ tone: keyof typeof SPLASH; d: string }> = [
  ...[
    [156, 232, 300, 110, -38],
    [206, 170, 200, 64, -32],
    [100, 292, 170, 54, -40],
    [236, 256, 160, 48, -30],
    [120, 176, 130, 40, -44],
  ].map(([cx, cy, l, w, a]) => ({ tone: 'light' as const, d: streak(cx, cy, l, w, a) })),
  ...[
    [124, 214, 220, 52, -40],
    [218, 212, 180, 42, -34],
    [90, 266, 140, 30, -42],
    [242, 160, 120, 28, -30],
    [178, 304, 150, 28, -36],
  ].map(([cx, cy, l, w, a]) => ({ tone: 'mid' as const, d: streak(cx, cy, l, w, a) })),
  ...[
    [112, 236, 130, 20, -40],
    [232, 196, 110, 16, -32],
    [78, 286, 84, 14, -44],
    [256, 236, 86, 14, -30],
    [196, 126, 70, 10, -34],
  ].map(([cx, cy, l, w, a]) => ({ tone: 'deep' as const, d: streak(cx, cy, l, w, a) })),
]

/** Coffee grounds scattered at the foot of the glass: x, y, radius (fixed, so it never reshuffles). */
const GROUNDS: Array<[number, number, number]> = [
  [84, 318, 1.6], [92, 312, 1.1], [100, 320, 2], [108, 314, 1.2], [76, 312, 1],
  [226, 318, 1.8], [236, 312, 1.2], [244, 320, 1.5], [218, 314, 1], [252, 314, 1.1],
  [70, 322, 1.3], [260, 322, 1.4],
]

/** Flung droplets: x, y, radius, tone. */
const DROPLETS: Array<[number, number, number, keyof typeof SPLASH]> = [
  [56, 300, 6, 'mid'],
  [70, 236, 4, 'deep'],
  [262, 132, 5, 'mid'],
  [286, 198, 7, 'light'],
  [278, 278, 4, 'deep'],
  [44, 262, 3, 'mid'],
  [246, 306, 5, 'light'],
  [232, 116, 3, 'deep'],
  [290, 160, 2.5, 'deep'],
]

export function PourSequence() {
  return (
    <div
      className="kv-scene relative h-full w-full"
      role="img"
      aria-label="A Kelvo pack pours 10 ml of concentrate into a glass, 150 ml of milk and two sugar cubes go in, and the glass is stirred"
      style={{ transformStyle: 'preserve-3d', transform: 'rotateX(16deg) rotateY(-16deg) scale(0.92)', willChange: 'transform' }}
    >
      {/* ---- Back: the splash, floor shadow, ground strokes ---- */}
      <svg {...svg} className={layer} style={{ transform: 'translateZ(-30px)' }}>
        <g className="kv-splash" opacity={0} style={fillBox}>
          <g filter="url(#kv-pour-rough)">
            {/* A broad wash under the strokes, and a few blotches, so it reads as paint, not feathers. */}
            <ellipse cx="158" cy="236" rx="118" ry="66" fill={SPLASH.light} transform="rotate(-36 158 236)" />
            {SPLASH_STROKES.map((stroke, index) => (
              <path key={index} d={stroke.d} fill={SPLASH[stroke.tone]} />
            ))}
            <ellipse cx="94" cy="250" rx="34" ry="16" fill={SPLASH.mid} transform="rotate(-40 94 250)" />
            <ellipse cx="240" cy="186" rx="30" ry="14" fill={SPLASH.mid} transform="rotate(-32 240 186)" />
            <ellipse cx="212" cy="278" rx="22" ry="10" fill={SPLASH.deep} transform="rotate(-30 212 278)" />
          </g>
          {/* Screen-print misregistration: a few strokes outlined again in the deep tone, knocked off register. */}
          <g filter="url(#kv-pour-rough)" stroke={SPLASH.deep} strokeWidth={2.5} transform="translate(4 3)" opacity={0.8}>
            {SPLASH_STROKES.filter((stroke) => stroke.tone === 'mid')
              .slice(0, 3)
              .map((stroke, index) => (
                <path key={index} d={stroke.d} />
              ))}
          </g>
          {/* A sprinkle of grounds at the foot, like the cocoa on the Hot cup. */}
          <g fill={COFFEE.brown}>
            {GROUNDS.map(([x, y, r], index) => (
              <circle key={index} cx={x} cy={y} r={r} />
            ))}
          </g>
          {DROPLETS.map(([x, y, r, tone], index) => (
            <circle key={index} cx={x} cy={y} r={r} fill={SPLASH[tone]} />
          ))}
          {/* A few ink specks among the drops. */}
          <g fill={INK}>
            <circle cx="64" cy="252" r="1.8" />
            <circle cx="272" cy="146" r="1.6" />
            <circle cx="262" cy="292" r="2" />
          </g>
        </g>

        <ellipse
          className="kv-floor-shadow"
          cx="160"
          cy="324"
          rx="74"
          ry="7"
          fill={INK}
          opacity={0.12}
          style={{ ...fillBox, transform: 'scaleX(0.8)' }}
        />
        <g stroke={INK} strokeWidth={3.5} filter="url(#kv-pour-sketch)">
          <path d="M72 326h24" />
          <path d="M228 326h28" />
        </g>
      </svg>

      {/* ---- Middle: the glass ---- */}
      <svg {...svg} className={`kv-cup-layer ${layer}`} style={{ transform: 'translateZ(0px)', ...fromBottom }}>
        <defs>
          {/* Hand-drawn waver on the ink. */}
          <filter id="kv-pour-sketch" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="1" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Painterly edges on the splash. */}
          <filter id="kv-pour-rough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="15" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <clipPath id="kv-cup-bowl">
            <path d={INSIDE} />
          </clipPath>
        </defs>

        {/* Glass: Paper, with a cool shade down its right side and a rim band. */}
        <path d={GLASS} fill={PAPER} />
        <path d="M186 180L218 180L198 296Q196 302 188 302H176Z" fill="#dcecf1" />
        <path d="M98 176a62 9 0 0 1 124 0a62 9 0 0 1-124 0z" fill="#eaf6fa" />

        {/* The spoon, dipped in at the end: behind the coffee, so it disappears into it. */}
        <g className="kv-spoon" opacity={0} style={{ transformBox: 'view-box', transformOrigin: '170px 236px' }}>
          <path d="M170 236L228 124" stroke={INK} strokeWidth={9} />
          <path d="M170 236L228 124" stroke="#c9d8de" strokeWidth={3.5} />
          <circle cx="230" cy="120" r="7" fill="#c9d8de" stroke={INK} strokeWidth={3.5} />
        </g>

        <g clipPath="url(#kv-cup-bowl)">
          <g className="kv-liquid" style={{ ...fromBottom, transform: 'scaleY(0)' }}>
            {/* The concentrate: near-black coffee with a little warmth moving in it. */}
            <rect x="100" y="180" width="120" height="124" fill={COFFEE.concentrate} />
            <path d="M104 214C124 204 144 224 166 216S204 206 218 214V236C196 244 172 230 150 240S116 242 104 234Z" fill="#40291b" />

            {/* The milky coffee, marbled in flat tones: caramel and brown swirls with
                deep eddies up top, cream settling at the foot with drips running into it. */}
            <g className="kv-milk-tint" opacity={0}>
              <rect x="100" y="180" width="120" height="124" fill={COFFEE.latte} />
              <path d="M104 250C116 244 122 262 132 256S146 236 156 250S172 270 184 254S204 244 214 252L200 304H120Z" fill={COFFEE.cream} />
              <path d="M100 196C122 190 136 210 158 204S196 188 220 198L216 232C204 240 196 226 186 236S170 262 158 248S136 232 124 246S108 250 104 244Z" fill={COFFEE.caramel} />
              <path d="M110 208C124 202 134 220 150 214S178 200 198 210C206 214 208 226 200 228C188 222 180 236 168 234S150 224 140 232S116 226 110 208Z" fill={COFFEE.brown} />
              <path d="M128 214c8-6 18-2 20 6c-6 6-16 6-20-6z" fill={COFFEE.deep} />
              <path d="M170 210c6-4 14-2 16 4c-5 5-12 4-16-4z" fill={COFFEE.deep} />
              <path d="M152 234c6 8 4 18-4 24c2-8 0-16 4-24z" fill={COFFEE.deep} />
              <path d="M138 252c4 10 2 22-2 30c8-6 10-18 6-30z" fill={COFFEE.caramel} />
              <path d="M178 256c-2 12 0 20 6 26c-2-10 0-18-6-26z" fill={COFFEE.latte} />
              <path d="M116 270c4 8 4 16 0 24" stroke={COFFEE.latte} strokeWidth={3} />
              {/* Foam at the top, with the surface as a flat ellipse. */}
              <path d="M100 180H220V196C192 204 164 192 134 200S106 200 100 196Z" fill="#f0c486" />
              <ellipse cx="160" cy="182" rx="58" ry="6" fill="#f7d9a8" />
              <path d="M112 186c6 0 10 3 16 2M150 188c8 1 14-1 22 0M190 186c6 1 12 0 18-1" stroke="#fbe6c4" strokeWidth={2.5} />
            </g>

            <g className="kv-swirl" style={fillBox}>
              <path className="kv-swirl-line" d="M134 246c8-11 20-11 28 0s20 11 28 0" stroke={INK} strokeWidth={LINE - 1} />
            </g>
          </g>
        </g>

        {/* The thick glass foot, in a cool shade. */}
        <path d="M121 290Q160 298 199 290L197 300Q196 304 188 304H132Q124 304 123 300Z" fill="#cfe3ea" />

        {/* Shine on the glass, over whatever is in it. */}
        <g stroke={PAPER} strokeLinecap="round" opacity={0.85}>
          <path d="M112 194L126 284" strokeWidth={6} />
          <path d="M126 196L130 216" strokeWidth={3} />
          <path d="M204 204L198 238" strokeWidth={2.5} />
          <path d="M136 298h22" strokeWidth={3} />
        </g>
        {/* A glint on the rim. */}
        <path
          d="M206 170C207 175 208 176 213 177C208 178 207 179 206 184C205 179 204 178 199 177C204 176 205 175 206 170Z"
          fill="#fff"
          stroke={INK}
          strokeWidth={1.5}
        />

        <g stroke={INK} strokeWidth={LINE} filter="url(#kv-pour-sketch)">
          <path className="kv-cup-line" d={GLASS} />
          {/* The rim, front and back. */}
          <path className="kv-cup-line" d="M98 176a62 9 0 0 0 124 0" strokeWidth={LINE + 0.5} />
          <path className="kv-cup-line" d="M98 176a62 9 0 0 1 124 0" strokeWidth={3} />
          {/* The thick foot, and the glass's inner walls. */}
          <path className="kv-cup-line" d="M121 290Q160 298 199 290" strokeWidth={3.5} />
          <path className="kv-cup-line" d="M106 200L119 280" strokeWidth={2} />
          <path className="kv-cup-line" d="M214 200L203 272" strokeWidth={2} />
          {/* Side marks down the right, and the "look here" ticks off the rim. */}
          <path className="kv-cup-line" d="M226 214L220 250" strokeWidth={3} />
          <path className="kv-cup-line" d="M84 160L74 150" strokeWidth={3.5} />
          <path className="kv-cup-line" d="M94 150L90 136" strokeWidth={3.5} />
        </g>
      </svg>

      {/* ---- Front: pack, jug, streams, sugar ---- */}
      <svg {...svg} className={layer} style={{ transform: 'translateZ(30px)' }}>
        {/* The pack, upside down to pour: a black Kelvo pouch, Caramel label, cap at the bottom. */}
        <g className="kv-pouch" opacity={0} style={fillBox}>
          <rect x="98" y="24" width="58" height="86" rx="10" fill={INK} />
          <rect x="105" y="32" width="44" height="66" rx="4" fill="var(--color-caramel)" />
          <path d="M108 36h10l-6 58h-4z" fill="#f6d28e" />
          <path d="M140 34h7v62h-12z" fill="#d99a3a" />
          {/* The print: wordmark up top, the flavour name running diagonally, a line of small type. */}
          <g fill={INK} style={{ fontFamily: 'var(--font-display)' }}>
            <text x="109" y="45" fontSize="10.5">
              Kelvo
            </text>
            <text x="112" y="94" fontSize="12.5" transform="rotate(-52 112 94)" letterSpacing="0.5">
              CARAMEL
            </text>
          </g>
          <path d="M109 50h18M109 54h14" stroke={INK} strokeWidth={1.4} opacity={0.7} />
          {/* Creases in the foil. */}
          <path d="M101 60c3 8 3 18 0 26M153 44c-3 8-3 16 0 22" stroke="#4a4644" strokeWidth={1.6} />
          <rect x="120" y="108" width="14" height="5" fill={INK} />
          <rect x="117" y="112" width="20" height="10" rx="2" fill={INK} />
          <g stroke={INK} strokeWidth={LINE} filter="url(#kv-pour-sketch)">
            <rect className="kv-pouch-line" x="98" y="24" width="58" height="86" rx="10" />
            <path className="kv-pouch-line" d="M86 22l-8-8" strokeWidth={3.5} />
            <path className="kv-pouch-line" d="M82 36l-10-2" strokeWidth={3.5} />
          </g>
        </g>

        <g className="kv-jug" opacity={0}>
          <path d={JUG} fill={PAPER} />
          {/* The milk inside, with a cool shade. */}
          <path d="M175 62C186 66 200 66 211 62L209 98A14 14 0 0 1 195 110H193A14 14 0 0 1 179 98Z" fill="#fff" />
          <path d="M200 64C204 64 208 63 211 62L209 98A14 14 0 0 1 197 110Z" fill="#dcecf1" />
          <g stroke={INK} strokeWidth={LINE} filter="url(#kv-pour-sketch)">
            <path className="kv-jug-line" d={JUG} />
            <path className="kv-jug-line" d="M216 52c12 2 16 10 16 18s-6 14-14 15" />
            <path className="kv-jug-line" d="M172 36l-6-8h26" />
            <path className="kv-jug-line" d="M177 62c10 3 22 3 33 0" strokeWidth={3} />
          </g>
          <path d="M180 44l2 18" stroke="#fff" strokeWidth={4} />
        </g>

        <g filter="url(#kv-pour-sketch)">
          <path className="kv-stream-brew" d="M128 120c1 26 2 48 2 74" stroke={COFFEE.concentrate} strokeWidth={LINE + 1} />
          <path className="kv-stream-brew" d="M127 122c1 26 2 48 2 70" stroke="#6b4630" strokeWidth={1.6} />
          {/* Milk: Paper, ruled in Ink so it reads on a pale ground. */}
          <path className="kv-stream-milk kv-stream-milk-edge" d="M190 116c-1 28-3 52-4 78" stroke={INK} strokeWidth={11} />
          <path className="kv-stream-milk" d="M190 116c-1 28-3 52-4 78" stroke="#fff" strokeWidth={5.5} />
        </g>

        {/* Little drops kicked up where each pour lands. */}
        <g fill={COFFEE.concentrate}>
          {[-9, 0, 9].map((dx, index) => (
            <circle key={index} className="kv-plip-brew" cx={130 + dx} cy={200} r={index === 1 ? 3 : 2.2} opacity={0} />
          ))}
        </g>
        <g fill="#fff" stroke={INK} strokeWidth={1.4}>
          {[-10, 0, 10].map((dx, index) => (
            <circle key={index} className="kv-plip-milk" cx={186 + dx} cy={200} r={index === 1 ? 3.4 : 2.6} opacity={0} />
          ))}
        </g>

        <g className="kv-sugar" opacity={0} stroke={INK} strokeWidth={3} fill="#fff" filter="url(#kv-pour-sketch)">
          <rect x="144" y="112" width="14" height="14" rx="2" style={{ ...fillBox, transform: 'rotate(12deg)' }} />
          <rect x="160" y="100" width="14" height="14" rx="2" style={{ ...fillBox, transform: 'rotate(-16deg)' }} />
        </g>

        <g fill={INK} style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.02em' }}>
          <text className="kv-label-10" x="30" y="116" opacity={0}>
            10 ml
          </text>
          <text className="kv-label-150" x="222" y="150" opacity={0}>
            150 ml
          </text>
        </g>
      </svg>
    </div>
  )
}
