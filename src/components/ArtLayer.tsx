import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Box = { x: number; y: number; width: number; height: number }
type Origin = [number, number] | 'center' | 'bottom' | 'css'

/**
 * One layer of a drawing that has been split into a stack of layers, so its
 * moving parts can be animated as whole elements. Browsers move and fade an
 * element on the GPU without redrawing it, but a part moved *inside* an SVG
 * makes the whole SVG redraw, every frame, traced curves and all.
 *
 * The layer shares the drawing's coordinates (so its paths are unchanged) but
 * is cropped to its own content once it has rendered: its box is then the
 * part's own box, so percentages (a transform origin, a clip wipe) mean what
 * they meant on the part inside the SVG, and the GPU holds a smaller picture.
 * `origin` is where the layer turns and scales from: a point in the drawing's
 * units, its centre, the middle of its foot, or 'css' to leave it to the stylesheet.
 */
export function ArtLayer({
  view,
  origin = 'center',
  crop = true,
  className,
  style,
  children,
}: {
  view: { width: number; height: number }
  origin?: Origin
  /** Off for a layer whose paths turn about points in the drawing's units, which must keep the full box. */
  crop?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [box, setBox] = useState<Box>({ x: 0, y: 0, width: view.width, height: view.height })

  useLayoutEffect(() => {
    const svg = ref.current
    if (!svg || !crop) return
    try {
      const { x, y, width, height } = svg.getBBox()
      if (width > 0 && height > 0) setBox({ x, y, width, height })
    } catch {
      /* Not measurable (e.g. not rendered): the layer simply stays full size. */
    }
  }, [view.width, view.height, crop])

  const transformOrigin =
    origin === 'css'
      ? undefined
      : origin === 'center'
      ? '50% 50%'
      : origin === 'bottom'
        ? '50% 100%'
        : `${(((origin[0] - box.x) / box.width) * 100).toFixed(2)}% ${(((origin[1] - box.y) / box.height) * 100).toFixed(2)}%`

  return (
    <svg
      ref={ref}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      fillRule="evenodd"
      aria-hidden="true"
      // The caller's classes come first, so [class^="part-"] style selectors still match.
      className={`${className ?? ''} absolute block overflow-visible`}
      style={{
        left: `${(box.x / view.width) * 100}%`,
        top: `${(box.y / view.height) * 100}%`,
        width: `${(box.width / view.width) * 100}%`,
        height: `${(box.height / view.height) * 100}%`,
        transformOrigin,
        ...style,
      }}
    >
      {children}
    </svg>
  )
}
