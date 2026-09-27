import { useCallback, useEffect, useRef, useState } from 'react'
import { testimonials, type Testimonial } from '@/config/testimonials'
import { flavours } from '@/config/catalog'
import { shopOrder, type FlavourKey } from '@/config/shopify'
import { SectionHeading } from './ui/SectionHeading'
import { cn } from '@/lib/cn'

/**
 * Blank cards for the local dev server only, so the layout can be reviewed
 * before any real reviews exist. They are plainly placeholders (no invented
 * names or praise) and never reach the live site.
 */
function previewCards(flavour?: FlavourKey | null): Testimonial[] {
  if (!import.meta.env.DEV) return []
  return shopOrder.map((key) => ({
    quote: "A real customer's words go here. Add genuine reviews in src/config/testimonials.ts and they replace these cards.",
    name: 'Customer name',
    context: 'Their city',
    rating: 5,
    headline: 'Their headline.',
    flavour: flavour ?? key,
  }))
}

/**
 * SECTION 7 — What people say, after How to Kelvo.
 *
 * A row of cards you can swipe or step through, staggered up and down like
 * the reference. Each card wears the flavour it's about: that flavour's
 * ground and grid across the top, easing away into Paper (as on the product
 * cards), then the stars, their headline, their words and who said it.
 *
 * Only real reviews (src/config/testimonials.ts) ever appear. With none, the
 * section isn't rendered on the live site; the dev server shows placeholder
 * cards. Product pages pass in just their own flavour's reviews.
 */
export function Testimonials({
  items: given,
  flavour,
  id = 'reviews',
  title = 'Said over a cup.',
  intro = 'What people tell us after the first pour.',
}: {
  /** The reviews to show; all of them by default. */
  items?: Testimonial[]
  /** On a product page: the flavour its placeholder cards take, while there are no real reviews. */
  flavour?: FlavourKey | null
  id?: string
  title?: string
  intro?: string
}) {
  const real = given ?? testimonials
  const isPreview = real.length === 0 && import.meta.env.DEV
  const items = real.length > 0 ? real : isPreview ? previewCards(flavour) : []

  const trackRef = useRef<HTMLUListElement | null>(null)
  // The scroll positions the row can actually stop at: each card at the start
  // of the row, until the row can't scroll any further. On a wide screen that's
  // fewer stops than cards; each stop gets a dot.
  const [stops, setStops] = useState<number[]>([0])
  const [active, setActive] = useState(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return
    const max = track.scrollWidth - track.clientWidth
    const positions: number[] = []
    for (const child of Array.from(track.children)) {
      const left = Math.min((child as HTMLElement).offsetLeft - first.offsetLeft, max)
      if (!positions.some((p) => Math.abs(p - left) < 4)) positions.push(left)
    }
    setStops(positions)
    let best = 0
    positions.forEach((position, index) => {
      if (Math.abs(position - track.scrollLeft) < Math.abs(positions[best] - track.scrollLeft)) best = index
    })
    setActive(best)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), measure()))
    }
    measure()
    track.addEventListener('scroll', onChange, { passive: true })
    window.addEventListener('resize', onChange)
    return () => {
      track.removeEventListener('scroll', onChange)
      window.removeEventListener('resize', onChange)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [measure, items.length])

  // Mouse drag: the row follows the cursor (snapping paused), then on release
  // glides to the stop nearest where the flick would carry it. Touch and
  // trackpads already scroll it natively, so this only handles a mouse.
  const stopsRef = useRef(stops)
  stopsRef.current = stops
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let dragging = false
    let moved = false
    let startX = 0
    let startLeft = 0
    let lastX = 0
    let lastTime = 0
    let velocity = 0
    let settle = 0

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      dragging = true
      moved = false
      startX = lastX = event.clientX
      startLeft = track.scrollLeft
      lastTime = performance.now()
      velocity = 0
      window.clearTimeout(settle)
      track.setPointerCapture(event.pointerId)
      track.dataset.dragging = 'true'
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - startX
      if (Math.abs(dx) > 4) moved = true
      track.scrollLeft = startLeft - dx
      const now = performance.now()
      if (now > lastTime) velocity = (event.clientX - lastX) / (now - lastTime)
      lastX = event.clientX
      lastTime = now
    }
    const onUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)
      // Where a flick would carry it (px/ms x a short glide), then the nearest
      // stop to that, but never more than one stop past where it was let go.
      const stops = stopsRef.current
      const nearestTo = (x: number) =>
        stops.reduce((best, stop, index) => (Math.abs(stop - x) < Math.abs(stops[best] - x) ? index : best), 0)
      const here = nearestTo(track.scrollLeft)
      const flung = nearestTo(track.scrollLeft - velocity * 220)
      const target = stops[Math.max(here - 1, Math.min(here + 1, flung))]
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' })
      // Snapping comes back once the glide has landed.
      settle = window.setTimeout(() => delete track.dataset.dragging, reduce ? 0 : 450)
    }
    // A drag isn't a click on whatever was under the cursor when it started.
    const onClick = (event: MouseEvent) => {
      if (!moved) return
      event.preventDefault()
      event.stopPropagation()
      moved = false
    }

    track.addEventListener('pointerdown', onDown)
    track.addEventListener('pointermove', onMove)
    track.addEventListener('pointerup', onUp)
    track.addEventListener('pointercancel', onUp)
    track.addEventListener('click', onClick, true)
    return () => {
      window.clearTimeout(settle)
      track.removeEventListener('pointerdown', onDown)
      track.removeEventListener('pointermove', onMove)
      track.removeEventListener('pointerup', onUp)
      track.removeEventListener('pointercancel', onUp)
      track.removeEventListener('click', onClick, true)
    }
  }, [items.length])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const target = stops[Math.max(0, Math.min(index, stops.length - 1))]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <section aria-labelledby={`${id}-heading`} className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading id={`${id}-heading`} title={title} intro={intro} />
      </div>

      {/* The track runs edge to edge; its padding lines the first and last cards up with the page. */}
      <ul
        ref={trackRef}
        aria-label="Reviews"
        className="mt-12 flex snap-x snap-mandatory scroll-px-[max(1rem,calc((100vw-75rem)/2))] gap-4 overflow-x-auto [@media(pointer:fine)]:cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:snap-none data-[dragging=true]:select-none px-[max(1rem,calc((100vw-75rem)/2))] pt-2 pb-12 [scrollbar-width:none] sm:mt-16 sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          // Every other card sits lower, for the staggered row.
          <li
            key={`${item.name}-${index}`}
            className={cn('w-[min(21rem,82vw)] shrink-0 snap-start', index % 2 === 1 && 'pt-10')}
          >
            <ReviewCard item={item} />
          </li>
        ))}
      </ul>

      {/* Step through: previous, a dot per stop, next. Hidden when everything already fits. */}
      {stops.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-5">
          <StepButton direction="previous" disabled={active === 0} onClick={() => goTo(active - 1)} />
          <div className="flex items-center gap-2">
            {stops.map((stop, index) => (
              <button
                key={stop}
                type="button"
                aria-label={`Show reviews, step ${index + 1} of ${stops.length}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                className={cn(
                  'size-2.5 rounded-full transition-[background-color,transform] duration-300',
                  index === active ? 'scale-125 bg-ink' : 'bg-ink/20 hover:bg-ink/40',
                )}
              />
            ))}
          </div>
          <StepButton direction="next" disabled={active === stops.length - 1} onClick={() => goTo(active + 1)} />
        </div>
      )}
    </section>
  )
}

function StepButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'previous' ? 'Previous review' : 'Next review'}
      disabled={disabled}
      onClick={onClick}
      className="grid size-12 place-items-center shape-squircle bg-ink text-paper transition-[transform,opacity] duration-200 hover:-translate-y-0.5 disabled:opacity-25 disabled:hover:translate-y-0"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {direction === 'previous' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={cn('size-6', n <= rating ? 'text-ink' : 'text-ink/15')}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ item }: { item: Testimonial }) {
  const meta = item.flavour ? flavours[item.flavour] : null
  const initials = item.name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article className="kv-grain ground-paper relative flex h-full flex-col overflow-hidden rounded-xl border-2 border-ink text-center">
      {/* The flavour's ground and grid across the top, easing away into Paper. */}
      <span
        aria-hidden="true"
        className={cn('kv-surface kv-fade-down absolute inset-x-0 top-0 h-[12rem]', meta?.ground ?? 'ground-paper')}
      />

      <div className="relative flex flex-1 flex-col items-center gap-5 px-6 pt-10 pb-8">
        {item.rating && <Stars rating={Math.max(1, Math.min(5, Math.round(item.rating)))} />}
        {item.headline && <h3 className="max-w-[14ch] text-[1.9rem] leading-[0.95]">{item.headline}</h3>}
        <blockquote className="text-[1.02rem] leading-relaxed font-medium">
          <p>{item.quote}</p>
        </blockquote>

        <footer className="mt-auto flex flex-col items-center gap-2.5 pt-2">
          {item.photo ? (
            <img
              src={item.photo}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              className="size-14 shape-squircle border-2 border-ink object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                'kv-grain grid size-14 place-items-center shape-squircle border-2 border-ink font-display text-[1.4rem]',
                meta?.ground ?? 'ground-paper',
              )}
            >
              {initials}
            </span>
          )}
          <div>
            <p className="font-bold">{item.name}</p>
            {(item.context || meta) && (
              <p className="label mt-1 text-ink/70">
                {[item.context, meta ? `Drinks ${meta.name}` : null].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </footer>
      </div>
    </article>
  )
}
