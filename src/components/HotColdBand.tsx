import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import type { HotColdArt } from './hotColdArt'
import { shiftedColour } from '@/lib/colourShift'

type Art = { hot: HotColdArt; cold: HotColdArt }
type Kind = keyof Art

/** Traced drawing size (the viewBox); the art module is only fetched near the section. */
const VIEW = { width: 972, height: 793 } as const

const INK = 'var(--color-ink)'

/**
 * Where things turn and burst from, in viewBox units: the glass rocks on its
 * base, the splash swells and the droplets fly out from the middle of the
 * glass, the iced cup's shine lines flick out from the rim.
 */
const PIVOT: Record<Kind, { centre: [number, number]; base: [number, number]; ticks?: [number, number] }> = {
  hot: { centre: [490, 448], base: [378, 662] },
  cold: { centre: [497, 420], base: [590, 644], ticks: [371, 186] },
}

/** The colours the droplets are flicked in, taken from each drawing's splash. */
const DROP_COLOURS: Record<Kind, string[]> = {
  hot: ['#f38028', '#fcb668', '#c04c07', '#f79c47'],
  cold: ['#3ca2e7', '#87d1f7', '#b1e4fa', '#5bb5ee'],
}

/** Five small droplets per cup, fanned round; each drifts out from behind the glass. */
const DROPS = Array.from({ length: 5 }, (_, k) => {
  const angle = ((k * 72 + 17) * Math.PI) / 180
  const distance = 290 + ((k * 37) % 70)
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance * 0.8),
    r: 5 + ((k * 3) % 4),
    delay: k * 1.3,
  }
})

/** Three wisps rising off the hot cup (drawn at the source's full size, then scaled to the trace). */
const STEAM = [
  'M745 285C715 245 775 215 745 170S715 115 740 75',
  'M845 315C815 270 880 240 848 195S815 140 842 100',
  'M945 365C915 325 980 295 948 250S915 200 940 160',
]

/** Glints around the ice: [x, y, size] in viewBox units. */
const SPARKLES: Array<[number, number, number]> = [
  [455, 168, 20],
  [575, 212, 14],
  [338, 262, 16],
]
const STAR = 'M0-1C.12-.12.12-.12 1 0C.12.12.12.12 0 1C-.12.12-.12.12-1 0C-.12-.12-.12-.12 0-1Z'

const px = ([x, y]: [number, number]) => `${x}px ${y}px`

/**
 * SECTION 5 — Hot. Cold. Your call.
 *
 * The line sits in the middle, with the two drawings either side of it: the
 * hot cup up on the left, the iced one down in the bottom-right, each keeping
 * its own tilt. Both are traced into flat colour layers, so they can be
 * painted in and brought to life without changing the drawing itself.
 *
 * The first time the section comes into view each cup paints itself, over
 * about two and a half seconds: the splash bursts out, the ink lines are drawn in top to
 * bottom and the coffee is poured in, layer by layer. After that it idles,
 * barely: the ink wavers like a hand-drawn cartoon, the colours shift a shade,
 * the splash breathes, the odd droplet drifts out, steam rises off the hot cup
 * and the ice glints. The words themselves never move. Off screen everything
 * pauses; with reduced motion the drawings are simply there. All the motion
 * lives in index.css.
 */
export function HotColdBand() {
  const ref = useRef<HTMLElement | null>(null)
  const [art, setArt] = useState<Art | null>(null)
  const [live, setLive] = useState(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [painted, setPainted] = useState(reducedMotion)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const load = () => void import('./hotColdArt').then((module) => setArt(module.hotColdArt))
    if (!('IntersectionObserver' in window)) {
      load()
      setLive(true)
      setPainted(true)
      return
    }
    // Fetch the drawings a little before they scroll into view.
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        loader.disconnect()
        load()
      },
      { rootMargin: '900px 0px' },
    )
    // Paint them in once, when a good part of the section is on screen.
    const painter = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        painter.disconnect()
        setPainted(true)
      },
      { threshold: 0.3 },
    )
    const watcher = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { rootMargin: '120px 0px' })
    loader.observe(element)
    painter.observe(element)
    watcher.observe(element)
    return () => {
      loader.disconnect()
      painter.disconnect()
      watcher.disconnect()
    }
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Hot. Cold. Your call."
      data-live={live}
      data-painted={painted}
      className="kv-hc px-3 sm:px-4"
    >
      {/* Stacked below lg (hot cup, line, iced cup, each overlapping the next);
          from lg the cups sit in opposite corners and the line in the middle. */}
      <div className="kv-surface ground-paper relative mx-auto flex max-w-[75rem] flex-col overflow-hidden rounded-xl border border-[color:var(--grid-rule)] [--grid-rule:rgb(27_25_24_/_0.055)] [background-clip:padding-box] [background-position:-1px_-1px] lg:block lg:min-h-[46rem]">
        <div className="kv-hc-drift-a relative -mt-[2%] -ml-[12%] w-[88%] self-start sm:-ml-[6%] sm:w-[64%] lg:absolute lg:top-[4%] lg:left-[-6%] lg:m-0 lg:w-[47%]">
          <CupArt kind="hot" art={art?.hot} live={live} boil={!reducedMotion} />
        </div>

        <div className="relative z-10 -my-[7%] px-6 text-center sm:-my-[6%] lg:absolute lg:inset-0 lg:m-0 lg:flex lg:items-center lg:justify-center">
          <p className="font-display text-[min(6.4rem,calc((100vw-4.5rem)/6.25))] leading-[0.86] whitespace-nowrap lg:text-[clamp(4.8rem,6.72vw,7rem)]">
            Hot.
            <br />
            Cold.
            <br />
            Your call.
          </p>
        </div>

        <div className="kv-hc-drift-b relative -mr-[12%] w-[88%] self-end sm:-mr-[6%] sm:w-[64%] lg:absolute lg:right-[-6%] lg:bottom-[1%] lg:m-0 lg:w-[47%]">
          <CupArt kind="cold" art={art?.cold} live={live} boil={!reducedMotion} />
        </div>
      </div>
    </section>
  )
}

/** Stagger index, the colour to shift towards and (for the splash) a small drift of its own, per layer. */
function layerStyle(index: number, tint: string | null, drift = false): CSSProperties {
  const style: Record<string, string | number> = { '--i': index }
  if (tint) style['--tint'] = tint
  if (drift) {
    style['--fx'] = `${(Math.cos(index * 2.1) * 4.7).toFixed(1)}px`
    style['--fy'] = `${(Math.sin(index * 2.1) * 3.5).toFixed(1)}px`
  }
  return style as CSSProperties
}

function CupArt({ kind, art, live, boil }: { kind: Kind; art?: HotColdArt; live: boolean; boil: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const boilId = `${useId().replace(/:/g, '')}-boil`
  const pivot = PIVOT[kind]

  // The line boil is SMIL, which CSS can't pause, so it is stopped off screen here.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (live) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }, [live, art])

  const glassLayers = art?.groups.glass ?? []
  const colourCount = glassLayers.filter((layer) => layer.fill !== INK).length

  return (
    // The box holds its shape before the drawing arrives, so nothing jumps.
    <div className="aspect-[972/793] w-full">
      {art && (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          fillRule="evenodd"
          aria-hidden="true"
          className={`kv-hc-art kv-hc-${kind} block size-full`}
          style={{ '--pivot': px(pivot.centre) } as CSSProperties}
        >
          <defs>
            {/* Hand-drawn "line boil": the ink wavers by a unit or two, redrawn about four times a second. */}
            <filter id={boilId} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="1" seed="1">
                <animate
                  attributeName="seed"
                  values="1;4;7;2;9"
                  dur="1.2s"
                  calcMode="discrete"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          <g className="hc-splash">
            {art.groups.splash.map((layer, index) => (
              <path
                key={index}
                d={layer.d}
                fill={layer.fill}
                className="hc-sp"
                style={{ ...layerStyle(index, shiftedColour(layer.fill, index, kind), true), '--c': layer.fill } as CSSProperties}
              />
            ))}
          </g>

          {/* Droplets fly out from behind the glass. */}
          <g>
            {DROPS.map((drop, index) => (
              <circle
                key={index}
                cx={pivot.centre[0]}
                cy={pivot.centre[1]}
                r={drop.r}
                fill={DROP_COLOURS[kind][index % DROP_COLOURS[kind].length]}
                className="hc-drop"
                style={{ '--dx': `${drop.dx}px`, '--dy': `${drop.dy}px`, '--d': `${drop.delay}s` } as CSSProperties}
              />
            ))}
          </g>

          <g className="hc-glass" style={{ transformOrigin: px(pivot.base) }}>
            {glassLayers.map((layer, index) => {
              const ink = layer.fill === INK
              // Only the coffee's own tones shift; the lightest layer (the
              // glass's whole silhouette) and the darkest (along the outline) stay put.
              const tint =
                !ink && index >= 1 && index <= colourCount - 2 ? shiftedColour(layer.fill, index, 'coffee') : null
              return (
                <path
                  key={index}
                  d={layer.d}
                  fill={layer.fill}
                  filter={ink && boil ? `url(#${boilId})` : undefined}
                  className={ink ? 'hc-ink' : tint ? 'hc-gl hc-tint' : 'hc-gl'}
                  style={{ ...layerStyle(index, tint), '--c': layer.fill } as CSSProperties}
                />
              )
            })}
          </g>

          {art.groups.ticks && pivot.ticks && (
            <g className="hc-ticks" style={{ transformOrigin: px(pivot.ticks) }}>
              {art.groups.ticks.map((layer, index) => (
                <path key={index} d={layer.d} fill={layer.fill} filter={boil ? `url(#${boilId})` : undefined} />
              ))}
            </g>
          )}

          {kind === 'hot' && (
            <g transform="scale(0.7)" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round">
              {STEAM.map((d, index) => (
                <path key={index} d={d} pathLength={1} className={`hc-steam hc-steam-${index + 1}`} />
              ))}
            </g>
          )}

          {kind === 'cold' &&
            SPARKLES.map(([x, y, size], index) => (
              <g key={index} transform={`translate(${x} ${y}) scale(${size})`}>
                <path
                  d={STAR}
                  fill="#fff"
                  stroke={INK}
                  strokeWidth={2.4 / size}
                  strokeLinejoin="round"
                  className="hc-sparkle"
                  style={{ '--d': `${index * 0.8}s` } as CSSProperties}
                />
              </g>
            ))}
        </svg>
      )}
    </div>
  )
}
