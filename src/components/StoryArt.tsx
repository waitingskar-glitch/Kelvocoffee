import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { StoryGroup, StoryLayer } from './storyArtPaths'
import { shiftedColour, type ShiftPart } from '@/lib/colourShift'
import { cn } from '@/lib/cn'

type Art = typeof import('./storyArtPaths').storyArt

/** Traced drawing size (the viewBox); the art module is only fetched near the card. */
const VIEW = { width: 1002, height: 565 } as const
const INK = 'var(--color-ink)'

/** Where each part turns or grows from, in viewBox units. */
const PIVOT: Partial<Record<StoryGroup, [number, number]>> = {
  ground: [560, 480],
  pouch: [610, 470],
  burst: [363, 171],
  burst2: [741, 267],
  speed: [321, 363],
  speed2: [708, 405],
}

/** Glints on the ice in the glass and on the pouch cap: x, y, size. */
const SPARKLES: Array<[number, number, number]> = [
  [400, 150, 11],
  [497, 166, 8],
  [632, 92, 9],
]
const STAR = 'M0-1C.12-.12.12-.12 1 0C.12.12.12.12 0 1C-.12.12-.12.12-1 0C-.12-.12-.12-.12 0-1Z'

/** Drawing order, back to front: the pouch stands behind the glass, the loose ice in front of both. */
const ORDER: StoryGroup[] = ['ground', 'pouch', 'glass', 'speed', 'speed2', 'burst', 'burst2', 'ice1', 'ice2', 'ice3']

/** Which hue family a group's colours may shift within while idling (none for the rest). */
const TINT: Partial<Record<StoryGroup, ShiftPart>> = { glass: 'coffee', pouch: 'whiskey' }

const px = ([x, y]: [number, number]) => `${x}px ${y}px`

/**
 * The story card's Whiskey latte sketch as live SVG, in the same hand as the
 * Hot / Cold cups: traced into flat colour layers so its parts can move
 * without the drawing changing.
 *
 * The first time the card comes into view it assembles itself (about a second
 * and a half): the shadows and grounds spread out, the pouch pops up, the
 * glass's ink is drawn in and the coffee poured, the loose ice drops in one
 * cube at a time, the speed lines wipe in and the burst lines pop. Then it
 * idles, very quietly: the coffee and the coral shift a shade, the ice cubes rock, the burst lines pulse, the
 * speed lines drift and the ice glints. Off screen it pauses; with reduced
 * motion it is simply there. The motion is in index.css (STORY ART).
 */
export function StoryArt({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [art, setArt] = useState<Art | null>(null)
  const [live, setLive] = useState(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [painted, setPainted] = useState(reducedMotion)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const load = () => void import('./storyArtPaths').then((module) => setArt(module.storyArt))
    if (!('IntersectionObserver' in window)) {
      load()
      setLive(true)
      setPainted(true)
      return
    }
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        loader.disconnect()
        load()
      },
      { rootMargin: '900px 0px' },
    )
    const painter = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        painter.disconnect()
        setPainted(true)
      },
      { threshold: 0.35 },
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
    // The box holds the drawing's shape before it arrives, so nothing jumps.
    <div
      ref={ref}
      aria-hidden="true"
      data-live={live}
      data-painted={painted}
      className={cn('kv-story aspect-[1002/565]', className)}
    >
      {art && (
        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          fillRule="evenodd"
          className="kv-story-art block size-full"
          // Crisp edges: the drawing is flat colour, so never blur or resample it.
          shapeRendering="geometricPrecision"
        >
          {ORDER.map((group) => (
            <Group
              key={group}
              group={group}
              layers={art.groups[group]}
              pivot={PIVOT[group]}
            />
          ))}

          {SPARKLES.map(([x, y, size], index) => (
            <g key={index} transform={`translate(${x} ${y}) scale(${size})`}>
              <path
                d={STAR}
                fill="#fff"
                stroke={INK}
                strokeWidth={1.6 / size}
                strokeLinejoin="round"
                className="st-sparkle"
                style={{ '--d': `${index * 1.1}s` } as CSSProperties}
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

function Group({
  group,
  layers,
  pivot,
}: {
  group: StoryGroup
  layers: StoryLayer[]
  pivot?: [number, number]
}) {
  const tintPart = TINT[group]
  const colourCount = layers.filter((layer) => layer.fill !== INK).length
  return (
    <g className={`st-g st-${group}`} style={pivot ? ({ '--pivot': px(pivot) } as CSSProperties) : undefined}>
      {layers.map((layer, index) => {
        const ink = layer.fill === INK
        // The lightest layer (the part's whole silhouette) and the darkest never shift.
        const tint =
          tintPart && !ink && index >= 1 && index <= colourCount - 2 ? shiftedColour(layer.fill, index, tintPart) : null
        return (
          <path
            key={index}
            d={layer.d}
            fill={layer.fill}
            className={ink ? 'st-ink' : tint ? 'st-layer st-tint' : 'st-layer'}
            style={{ '--i': index, '--c': layer.fill, ...(tint ? { '--tint': tint } : {}) } as CSSProperties}
          />
        )
      })}
    </g>
  )
}
