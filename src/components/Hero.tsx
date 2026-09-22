import { media } from '@/config/media'
import { EditorialImage } from './EditorialImage'
import { useSectionNav } from '@/hooks/useSectionNav'

const trustPoints = ['50ml & 100ml pouches', 'Just add milk or water', 'Five flavours'] as const

/**
 * SECTION 1 — Hero.
 *
 * Full-bleed image running under the header, headline sitting low-left over
 * it, quiet text links instead of buttons. The selling happens further down.
 */
export function Hero() {
  const scrollTo = useSectionNav()

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative">
      <div className="relative h-[88svh] min-h-[34rem] w-full overflow-hidden bg-espresso sm:h-[94svh]">
        <EditorialImage
          src={media.hero.src}
          fallback={media.hero.fallback}
          alt={media.hero.alt}
          priority
          sizes="100vw"
          position={media.hero.position}
          className="animate-fade-in"
        />

        {/* Two scrims: one down the left where the headline sits, one along
            the bottom. Together they keep type legible over any photograph. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, color-mix(in srgb, var(--color-espresso) 88%, transparent) 0%, color-mix(in srgb, var(--color-espresso) 55%, transparent) 38%, transparent 68%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, color-mix(in srgb, var(--color-espresso) 40%, transparent) 0%, transparent 30%, transparent 50%, color-mix(in srgb, var(--color-espresso) 72%, transparent) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-10 sm:pb-14 lg:pb-16">
            <p
              className="animate-fade-up label text-cream/70"
              style={{ animationDelay: '0.15s' }}
            >
              Filter coffee, reimagined
            </p>

            <h1
              id="hero-heading"
              className="animate-fade-up mt-5 max-w-[16ch] text-display-lg text-cream"
              style={{ animationDelay: '0.25s' }}
            >
              The filter coffee you grew up on.
              <span className="block italic opacity-90">In flavours you didn&rsquo;t.</span>
            </h1>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-10"
              style={{ animationDelay: '0.35s' }}
            >
              <button
                type="button"
                onClick={() => scrollTo('#shop')}
                className="link-underline label flex items-center gap-2 text-cream"
              >
                <span aria-hidden="true">&bull;</span>
                Shop the flavours
              </button>
              <button
                type="button"
                onClick={() => scrollTo('#trial-pack')}
                className="link-underline label flex items-center gap-2 text-cream/75"
              >
                <span aria-hidden="true">&bull;</span>
                Try all four
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip: a hairline band under the image, not floating chips. */}
      <div className="border-b border-[var(--rule)] bg-cream">
        <ul className="container-page flex flex-wrap items-center gap-x-8 gap-y-2 py-4 sm:py-5">
          {trustPoints.map((point) => (
            <li key={point} className="label flex items-center gap-2.5 text-muted">
              <span className="size-1 bg-caramel" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
