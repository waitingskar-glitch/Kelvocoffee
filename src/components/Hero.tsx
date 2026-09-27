import { useEffect, useRef } from 'react'
import { heroMedia } from '@/config/site'
import { useSectionNav } from '@/hooks/useSectionNav'
import { Button } from './ui/Button'
import { cn } from '@/lib/cn'

/**
 * The three pouches standing across the seam, laid out like the reference:
 * upright, the front one larger, the other two tucked behind either side.
 * Translate % is of the pouch's own (unscaled) box.
 */
const POUCH = { width: 490, height: 926 } as const
const CLUSTER: Array<{
  key: 'classic' | 'caramel' | 'whiskey'
  name: string
  x: number
  y: number
  scale: number
  z: number
}> = [
  { key: 'classic', name: 'Classic', x: -46, y: 1, scale: 0.8, z: 1 },
  { key: 'whiskey', name: 'Whiskey', x: 43, y: 0, scale: 0.78, z: 2 },
  { key: 'caramel', name: 'Caramel', x: 0, y: 0, scale: 1, z: 3 },
]

/**
 * SECTION 1 — Hero.
 *
 * The reference's layout: a narrow media panel on the left, a wide Paper
 * panel on the right, and three packs standing across the seam between them.
 * The media panel plays `heroMedia.videoSrc` once it is set; until then it is
 * a plain Caramel ground.
 *
 * The book overrides the reference where they disagree: type is flush left,
 * never centred, and there is no rating line because there are no reviews yet.
 */
export function Hero() {
  const scrollTo = useSectionNav()

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="flex min-h-svh flex-col px-3 pt-[calc(var(--spacing-header)+0.75rem)] pb-3 sm:px-4 sm:pt-[calc(var(--spacing-header)+1rem)] sm:pb-4 lg:pb-0"
    >
      {/* One screen tall. Below lg the screen height is budgeted: the caramel
          box takes 35% (the pouches stand in it and hang 15% of their height
          below its edge), the headline and subtitle 25%, and the button
          and a clear margin under it share the rest. */}
      <div className="mx-auto flex w-full max-w-[75rem] flex-1 flex-col gap-3 sm:gap-4 lg:grid lg:min-h-[max(36rem,calc(100svh-var(--spacing-header)-2rem))] lg:grid-cols-[3fr_5fr]">
        {/* --- Media panel, with the packs across the seam --- */}
        <div className="kv-surface ground-caramel relative z-10 h-[35svh] shrink-0 rounded-xl lg:h-auto">
          {heroMedia.videoSrc && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <HeroVideo src={heroMedia.videoSrc} poster={heroMedia.poster} />
            </div>
          )}

          {/* Standing on the bottom edge on small screens; straddling the side seam from lg. */}
          <div className="absolute top-full left-1/2 aspect-square w-[min(72%,26rem,40svh)] -translate-x-1/2 -translate-y-[83%] lg:top-[52%] lg:left-full lg:w-[104%] lg:-translate-y-1/2">
            {CLUSTER.map(({ key, name, x, y, scale, z }) => {
              const front = z === 3
              return (
                <img
                  key={key}
                  src={`/assets/pouches/${key}-full.webp`}
                  srcSet={`/assets/pouches/${key}-320.webp 320w, /assets/pouches/${key}-full.webp ${POUCH.width}w`}
                  sizes="(min-width: 1024px) 16vw, 42vw"
                  alt={front ? `Kelvo ${name} flavoured coffee concentrate pouch` : ''}
                  aria-hidden={front ? undefined : true}
                  width={POUCH.width}
                  height={POUCH.height}
                  fetchPriority={front ? 'high' : undefined}
                  // Entrance: the front pouch rises and settles, then the two behind it
                  // slide out to either side, like a hand being fanned (index.css).
                  className={cn(
                    'absolute top-1/2 left-1/2 w-[50%] drop-shadow-[0_6px_10px_rgb(150_100_30_/_0.14)]',
                    front ? 'kv-pouch-rise' : 'kv-pouch-fan',
                  )}
                  style={{
                    ['--tx' as string]: `${x}%`,
                    ['--ty' as string]: `${y}%`,
                    ['--s' as string]: scale,
                    transform: 'translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(var(--s))',
                    zIndex: z,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* --- The line. Centred on phones and tablets, where it spans the full width below the pouches. --- */}
        <div className="relative isolate flex flex-1 flex-col items-center justify-center px-6 text-center lg:items-stretch lg:text-left pt-[calc(min(10.2%,3.7rem,5.7svh)+1.5svh)] pb-[2.5svh] max-lg:[@media(max-height:700px)]:pb-[0.5svh] sm:px-10 lg:py-16 lg:pr-10 lg:pl-[calc(31%+2rem)] xl:pr-14">
          {/* The grid fades out as it comes down, into the page below. Its outer
              lines are drawn as a rounded border (in the grid's own colour) so
              the corners curve cleanly instead of the lines stopping short. */}
          <div
            aria-hidden="true"
            className="kv-surface ground-paper pointer-events-none absolute inset-0 -z-10 rounded-xl border border-[color:var(--grid-rule)] [background-clip:padding-box] [background-position:-1px_-1px] [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
          />

          {/* Below lg the headline and its subtitle share a slot 25% of the
              screen tall (15% more on tablets, where the type is 15% larger). The headline is sized to fill what the subtitle
              leaves (three lines at 0.88 leading) while still fitting
              "your flavour." across the panel (about 5.9em, so width / 6.2). */}
          <div className="flex w-full flex-col items-center justify-center [--hero-inset:4.5rem] [--hero-scale:1] [--hero-sub:3.3rem] sm:[--hero-inset:7rem] sm:[--hero-scale:1.15] sm:[--hero-sub:4.37rem] max-lg:h-[calc(25svh*var(--hero-scale))] lg:block">
            <h1
              id="hero-heading"
              className="animate-fade-up text-h1 font-display max-lg:[font-size:min(calc((25svh*var(--hero-scale)-var(--hero-sub)-1svh)/2.7),calc((100vw-var(--hero-inset))/6.2))]"
              style={{ animationDelay: '0.05s' }}
            >
              {/* Three lines below lg (Coffee, / but make it / your flavour.),
                  four beside the pouches on desktop. */}
              Coffee,
              <br />
              but make
              <br className="hidden lg:block" /> it
              <br className="lg:hidden" /> your
              <br className="hidden lg:block" /> flavour.
            </h1>

            <p
              className="animate-fade-up mt-[1svh] max-w-[26ch] text-[1.05rem] leading-snug font-medium sm:text-[1.38rem] lg:mt-7 lg:text-[1.35rem]"
              style={{ animationDelay: '0.15s' }}
            >
              Flavoured coffee concentrate. Ten millilitres. One cup. Done.
            </p>
          </div>

          <div className="animate-fade-up mt-[2svh] lg:mt-10" style={{ animationDelay: '0.25s' }}>
            <Button
              size="lg"
              shape="squircle"
              className="max-lg:min-h-12 sm:max-lg:min-h-14 sm:max-lg:px-9 sm:max-lg:text-[1.17rem]"
              onClick={() => scrollTo('#shop')}
            >
              Make your coffee today
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Muted, looping background video. Decorative, so hidden from assistive tech.
 * Anyone who asked for reduced motion gets the poster frame instead.
 */
function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.play().catch(() => {
      /* Autoplay refused (e.g. low-power mode): the poster stays up. */
    })
  }, [src])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster || undefined}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="size-full object-cover"
    />
  )
}
