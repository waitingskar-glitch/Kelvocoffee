import { useEffect, useId, useRef, useState } from 'react'
import { claimArt, type ClaimArtName } from './claimArtPaths'
import { claimArtWashes } from './claimArtWashes'
import { ArtLayer } from './ArtLayer'
import { FREE_DELIVERY_FROM } from '@/config/delivery'

/** Five plain facts, each true to the pack, each with its own hand-drawn art. */
const claims: Array<{ label: string; key: string; art: ClaimArtName }> = [
  { key: 'cup', label: '10 ml. One cup.', art: 'one-cup' },
  { key: 'temp', label: 'Hot or cold.', art: 'hot-cold' },
  { key: 'machine', label: 'No machine.', art: 'no-machine' },
  { key: 'flavours', label: 'Five flavours.', art: 'five-flavours' },
  { key: 'delivery', label: `Free delivery from ₹${FREE_DELIVERY_FROM}.`, art: 'delivery' },
]

/**
 * Optical size corrections, judged by eye against the one-cup glass and the
 * machine: the hot/cold glass shares its box with steam and a snowflake, the
 * five flavours are small circles with gaps, the truck trails speed lines.
 */
const OPTICAL_SCALE: Record<ClaimArtName, number> = {
  'one-cup': 1,
  'no-machine': 1,
  'hot-cold': 1.2,
  'five-flavours': 1.12,
  delivery: 1.22,
}

/**
 * Where the main object's centre sits, as a fraction of the drawing's width
 * from its middle. The truck's speed lines trail off to the left, so the
 * truck itself is right of centre, so the drawing shifts left to put the
 * truck, and its label, on the column's centre line.
 */
const OPTICAL_CENTRE_X: Record<ClaimArtName, number> = {
  'one-cup': 0,
  'hot-cold': 0,
  'no-machine': 0,
  'five-flavours': 0,
  delivery: 0.111,
}

/** The drawing's rendered width, as a CSS length (see ClaimArtSvg). */
function artWidth(name: ClaimArtName): string {
  const art = claimArt[name]
  return `var(--art) * ${(Math.sqrt(art.width / art.height) * OPTICAL_SCALE[name]).toFixed(3)}`
}

/**
 * The drawing, in Ink, as a stack of layers: one per part, so each part's
 * idle loop (steam rises, the truck rolls, the flavours bob) moves a whole
 * layer on the GPU. Moved inside a single SVG, a part would make the whole
 * drawing redraw every frame, rough-edged washes and all. It is on screen
 * from the start (no entrance). The motion is in index.css.
 */
function ClaimArtSvg({ name, index }: { name: ClaimArtName; index: number }) {
  const art = claimArt[name]
  const uid = useId().replace(/:/g, '')
  // Equal area, not equal box: a wide drawing gets shorter, a tall one
  // narrower. --art is the side of the square each one's area matches.
  // Then an optical nudge for drawings whose ink is spread thin across
  // their box, so the main object reads the same size as the others.
  const ratio = Math.sqrt(art.width / art.height)
  const scale = OPTICAL_SCALE[name]
  return (
    <div
      style={{
        width: `calc(${artWidth(name)})`,
        height: `calc(var(--art) * ${(scale / ratio).toFixed(3)})`,
      }}
      aria-hidden="true"
      className={`kv-claim-art kv-art-${name} relative max-w-full`}
    >
      <svg className="absolute size-0" aria-hidden="true">
        <defs>
          {/* Rough, hand-painted edges on the washes. */}
          <filter id={`${uid}-rough`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={index + 3} />
            <feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {art.parts.map((part) => {
        const washes = claimArtWashes[name].filter((wash) => wash.role === part.role)
        return (
          // Cropped to the part, so the stylesheet's origins and moves (in % of the part) still hold.
          <ArtLayer key={part.role} view={art} origin="css" className={`part-${part.role}`}>
            {washes.length > 0 && (
              <g filter={`url(#${uid}-rough)`} opacity="0.5">
                {washes.map((wash, i) => (
                  <path key={i} d={wash.d} style={{ fill: `var(--color-${wash.colour})` }} />
                ))}
              </g>
            )}
            <path d={part.d} fill="currentColor" />
          </ArtLayer>
        )
      })}
    </div>
  )
}

export function ClaimsStrip() {
  // The idle loops only run while the strip is on screen.
  const ref = useRef<HTMLElement | null>(null)
  const [live, setLive] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { rootMargin: '120px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} aria-label="What you get" data-live={live} className="container-page py-14 sm:py-16">
      {/* Rows that don't fill sit centred under the row above: on phones the
          fifth spans both columns; at three-up the grid is six half-columns,
          so the last two start half a column in, under the gaps above. */}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 [--art:3.92rem] sm:grid-cols-6 sm:[--art:4.54rem] lg:grid-cols-5">
        {claims.map((claim, index) => (
          <li
            key={claim.key}
            className="kv-claim flex justify-center last:col-span-2 sm:col-span-2 sm:[&:nth-child(4)]:col-start-2 lg:col-span-1 lg:last:col-span-1 lg:[&:nth-child(4)]:col-start-auto"
          >
            {/* Art and label share one centre line, centred in the column. */}
            <div className="flex w-fit max-w-full flex-col items-center gap-3.5">
              {/* A common baseline, tall enough for the tallest drawing. */}
              {/* The drawing shifts so its main object (not its whole box) sits on the centre line. */}
              <div
                className="relative flex h-[calc(var(--art)*1.12)] items-end"
                style={{ left: `calc(${artWidth(claim.art)} * ${-OPTICAL_CENTRE_X[claim.art]})` }}
              >
                <ClaimArtSvg name={claim.art} index={index} />
              </div>
              <span className="text-center font-display text-[1.24rem] leading-[1.05] text-balance">
                {claim.label}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
