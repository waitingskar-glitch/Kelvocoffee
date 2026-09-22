/**
 * Brewing illustration for the How It Works section.
 *
 * Gold line-work on espresso, matching the engraved illustrations on the Kelvo
 * labels. It is built as three stacked SVG layers at different depths inside a
 * 3D scene, so when HowItWorks tilts the scene the layers shift against each
 * other and the drawing gains a little real depth:
 *
 *   back   (-30px)  steam
 *   middle (0)      floor shadow, cup, liquid, swirl
 *   front  (+30px)  pouch, jug and the streams they pour
 *
 * Streams live with their source in the front layer, so a tilt never detaches
 * a stream from its spout; the far end just lands a little further inside the
 * cup opening, which has room for it.
 *
 * This component is static artwork. Every moving part carries a `kv-*` class
 * and HowItWorks animates it with anime.js. Initial states are set in markup,
 * so the first paint is already correct before any JavaScript runs.
 */

const fillBox = { transformBox: 'fill-box', transformOrigin: 'center' } as const
const fromBottom = { transformBox: 'fill-box', transformOrigin: '50% 100%' } as const

const layerClass = 'absolute inset-0 h-full w-full overflow-visible'
const svgProps = {
  viewBox: '0 0 320 360',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function PourSequence() {
  return (
    <div
      className="kv-scene relative h-full w-full"
      role="img"
      aria-label="A Kelvo pouch pours concentrate into a cup, milk is added and stirred, and the finished coffee steams"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'rotateX(16deg) rotateY(-16deg) scale(0.92)',
        willChange: 'transform',
      }}
    >
      {/* ---- Back layer: steam ---- */}
      <svg {...svgProps} className={layerClass} style={{ transform: 'translateZ(-30px)' }}>
        <g stroke="var(--color-cream)" strokeWidth={1.6}>
          <path className="kv-steam" d="M140 176c-8-14 8-20 0-34s6-20 2-30" opacity={0.75} />
          <path className="kv-steam" d="M162 170c-8-16 8-22 0-36s6-18 2-28" opacity={0.75} />
          <path className="kv-steam" d="M184 176c-8-14 8-20 0-34s6-20 2-30" opacity={0.75} />
        </g>
      </svg>

      {/* ---- Middle layer: cup ---- */}
      <svg {...svgProps} className={layerClass} style={{ transform: 'translateZ(0px)' }}>
        <defs>
          <clipPath id="kv-cup-bowl">
            <path d="M104 196h112l-10 78a26 26 0 0 1-26 22h-40a26 26 0 0 1-26-22z" />
          </clipPath>
          <linearGradient id="kv-brew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-caramel-soft)" />
            <stop offset="100%" stopColor="var(--color-coffee)" />
          </linearGradient>
        </defs>

        {/* Grounds the cup; it tightens and darkens as the scene turns to face you. */}
        <ellipse
          className="kv-floor-shadow"
          cx="160"
          cy="324"
          rx="72"
          ry="7"
          fill="#000"
          opacity={0.12}
          style={{ ...fillBox, transform: 'scaleX(0.8)' }}
        />

        <g clipPath="url(#kv-cup-bowl)">
          <rect
            className="kv-liquid"
            x="100"
            y="196"
            width="120"
            height="104"
            fill="url(#kv-brew)"
            opacity={0.92}
            style={{ ...fromBottom, transform: 'scaleY(0)' }}
          />
          <rect className="kv-milk-tint" x="100" y="196" width="120" height="104" fill="var(--color-cream)" opacity={0} />
          <g className="kv-swirl" style={fillBox}>
            <path
              className="kv-swirl-line"
              d="M134 252c9-11 21-11 30 0s21 11 30 0"
              stroke="var(--color-cream)"
              strokeWidth={2}
              opacity={0.55}
            />
          </g>
        </g>

        <g stroke="var(--color-gold)" strokeWidth={1.8}>
          <path className="kv-cup-line" d="M104 196h112l-10 78a26 26 0 0 1-26 22h-40a26 26 0 0 1-26-22z" />
          <path className="kv-cup-line" d="M96 196h128" strokeWidth={2.2} />
          <path className="kv-cup-line" d="M216 214c16 0 26 10 26 22s-10 22-26 22" opacity={0.8} />
          <path className="kv-cup-line" d="M112 316h96" strokeWidth={2} opacity={0.6} />
        </g>
      </svg>

      {/* ---- Front layer: pouch, jug, streams ---- */}
      <svg {...svgProps} className={layerClass} style={{ transform: 'translateZ(30px)' }}>
        <g className="kv-pouch" stroke="var(--color-gold)" strokeWidth={1.6} opacity={0} style={fillBox}>
          <path className="kv-pouch-line" d="M96 26h64l-6 92h-52z" />
          <path className="kv-pouch-line" d="M98 18h60v8H98z" />
          <path className="kv-pouch-line" d="M108 44h40v48h-40z" opacity={0.55} />
          <path className="kv-pouch-line" d="M116 60h24M116 70h24M116 80h16" opacity={0.4} />
        </g>

        <g className="kv-jug" stroke="var(--color-gold)" strokeWidth={1.6} opacity={0}>
          <path className="kv-jug-line" d="M172 36h44l-5 62a16 16 0 0 1-16 14h-2a16 16 0 0 1-16-14z" />
          <path className="kv-jug-line" d="M216 52c12 2 16 10 16 18s-6 14-14 15" />
          <path className="kv-jug-line" d="M172 36l-6-8h26" />
        </g>

        <path className="kv-stream-brew" d="M128 120c1 26 2 48 2 74" stroke="var(--color-caramel)" strokeWidth={2.6} />
        <path className="kv-stream-milk" d="M190 116c-1 28-3 52-4 78" stroke="var(--color-cream)" strokeWidth={2.6} opacity={0.9} />
      </svg>
    </div>
  )
}
