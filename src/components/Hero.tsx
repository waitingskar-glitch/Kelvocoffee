import { flavours } from '@/config/catalog'
import { Button } from './ui/Button'
import { ArrowRightIcon } from './ui/icons'

function scrollTo(hash: string) {
  const target = document.querySelector(hash)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  ;(target as HTMLElement).setAttribute('tabindex', '-1')
  ;(target as HTMLElement).focus({ preventScroll: true })
}

/** Small pills that hint at the range without leaving the hero. */
const floatingFlavours = [
  { meta: flavours.vanilla, className: 'top-[14%] -left-2 sm:left-2 lg:-left-6', delay: '0.55s' },
  { meta: flavours.hazelnut, className: 'top-[46%] -right-1 sm:right-2 lg:-right-5', delay: '0.7s' },
  { meta: flavours.caramel, className: 'bottom-[13%] left-[6%] lg:left-[2%]', delay: '0.85s' },
]

const trustPoints = ['50ml & 100ml pouches', 'Just add milk or water', 'Five flavours'] as const

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="surface-grain relative overflow-hidden pt-[calc(var(--spacing-header)+2rem)] pb-14 sm:pt-[calc(var(--spacing-header)+3.5rem)] sm:pb-20 lg:pt-[calc(var(--spacing-header)+5rem)] lg:pb-28"
    >
      {/* Warm ambient wash — pure CSS, no image cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 8%, color-mix(in srgb, var(--color-caramel) 16%, transparent) 0%, transparent 58%),' +
            'radial-gradient(90% 70% at 8% 96%, color-mix(in srgb, var(--color-sand) 70%, transparent) 0%, transparent 62%)',
        }}
      />

      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* ---- Copy ---- */}
          <div className="lg:col-span-6 xl:col-span-5">
            <p
              className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-gold/45 bg-cream/70 px-3.5 py-1.5 text-eyebrow font-semibold text-coffee uppercase"
              style={{ animationDelay: '0.05s' }}
            >
              <span className="size-1.5 rounded-pill bg-caramel" aria-hidden="true" />
              Filter coffee, reimagined
            </p>

            <h1
              id="hero-heading"
              className="animate-fade-up mt-5 text-display text-espresso sm:mt-6"
              style={{ animationDelay: '0.12s' }}
            >
              The filter coffee you grew up on.
              <span className="block text-coffee italic">In flavours you didn&rsquo;t.</span>
            </h1>

            <p
              className="animate-fade-up mt-5 max-w-[34ch] text-[1.02rem] leading-relaxed text-muted sm:mt-6 sm:text-[1.1rem]"
              style={{ animationDelay: '0.2s' }}
            >
              Small-batch coffee concentrate in five flavours. Pour a little into your cup, add hot
              milk or water, and that&rsquo;s the whole routine.
            </p>

            {/* Product composition sits here on mobile — desire before the ask. */}
            <div className="mt-8 lg:hidden">
              <HeroComposition priority />
            </div>

            <div
              className="animate-fade-up mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center"
              style={{ animationDelay: '0.28s' }}
            >
              <Button size="lg" onClick={() => scrollTo('#shop')} className="group">
                Shop Kelvo
                <ArrowRightIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => scrollTo('#trial-pack')}>
                Try the trial pack
              </Button>
            </div>

            <ul
              className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-espresso/10 pt-5 text-[0.78rem] text-muted sm:mt-10 sm:gap-x-4"
              style={{ animationDelay: '0.36s' }}
            >
              {trustPoints.map((point, index) => (
                <li key={point} className="flex items-center gap-3">
                  {index > 0 && (
                    <span className="size-1 rounded-pill bg-gold" aria-hidden="true" />
                  )}
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Product composition (desktop) ---- */}
          <div className="hidden lg:col-span-6 lg:block xl:col-span-7">
            <HeroComposition priority />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroComposition({ priority }: { priority?: boolean }) {
  return (
    <div className="animate-scale-in relative" style={{ animationDelay: '0.18s' }}>
      {/* Soft glow behind the plate */}
      <div
        aria-hidden="true"
        className="absolute inset-x-4 top-6 bottom-6 -z-10 rounded-[3rem] blur-2xl"
        style={{ background: 'color-mix(in srgb, var(--color-caramel) 22%, transparent)' }}
      />

      <figure className="relative overflow-hidden rounded-lg border border-gold/25 shadow-lift sm:rounded-xl">
        <img
          src={flavours.classic.image.src}
          srcSet={flavours.classic.image.srcSet}
          sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 34rem, 92vw"
          alt="Kelvo Classic coffee concentrate pouch on a dark stone counter, with coffee beans and a brass spoon"
          width={1100}
          height={821}
          className="aspect-[4/3] w-full object-cover"
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
        {/* Deepens the lower edge so the caption sits on a stable ground. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, color-mix(in srgb, var(--color-espresso) 62%, transparent) 0%, transparent 42%)',
          }}
        />
        <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-5">
          <span className="font-display text-[1.05rem] text-cream sm:text-[1.2rem]">
            Classic
            <span className="ml-2 text-[0.75rem] tracking-[0.12em] text-cream/60 uppercase">
              Cold concentrate
            </span>
          </span>
        </figcaption>
      </figure>

      {/* Floating flavour labels */}
      {floatingFlavours.map(({ meta, className, delay }) => (
        <span
          key={meta.key}
          aria-hidden="true"
          className={`animate-fade-up absolute ${className} hidden sm:block`}
          style={{ animationDelay: delay }}
        >
          <span className="animate-drift flex items-center gap-2 rounded-pill border border-gold/35 bg-cream/95 px-3.5 py-2 text-[0.76rem] font-medium text-espresso shadow-card backdrop-blur-sm">
            <span className="size-2 rounded-pill" style={{ background: meta.accent }} />
            {meta.name}
          </span>
        </span>
      ))}
    </div>
  )
}
