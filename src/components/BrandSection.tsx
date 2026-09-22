import { testimonials, sampleTestimonials, type Testimonial } from '@/config/testimonials'
import { media } from '@/config/media'
import { EditorialImage } from './EditorialImage'
import { Reveal } from './ui/Reveal'
import { useSectionNav } from '@/hooks/useSectionNav'

const pillars = [
  {
    title: 'One brew, done properly',
    copy: 'Small-batch concentrate rather than a syrup poured over instant. The coffee comes first; the flavour sits on top of it.',
  },
  {
    title: 'Made for weekday mornings',
    copy: 'The filter-coffee ritual is lovely and it is also slow. This keeps the cup and skips the twenty minutes.',
  },
  {
    title: 'Room to experiment',
    copy: 'Five flavours, two sizes, no commitment. Change your mind as often as you change your order.',
  },
] as const

/** SECTION 5 — Brand and trust. A full-bleed statement, then the philosophy. */
export function BrandSection() {
  const scrollTo = useSectionNav()

  const showSamples = testimonials.length === 0 && import.meta.env.DEV
  const visible: Testimonial[] = testimonials.length > 0 ? testimonials : showSamples ? sampleTestimonials : []

  return (
    <section id="story" aria-labelledby="story-heading" className="scroll-mt-20 bg-cream">
      {/* --- Full-bleed statement --- */}
      <div className="relative h-[70svh] min-h-[26rem] w-full overflow-hidden bg-espresso">
        <EditorialImage
          src={media.statement.src}
          fallback={media.statement.fallback}
          alt={media.statement.alt}
          sizes="100vw"
          position={media.statement.position}
        />
        {/* Same two-scrim treatment as the hero, so the statement stays
            readable whatever photograph sits behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, color-mix(in srgb, var(--color-espresso) 82%, transparent) 0%, color-mix(in srgb, var(--color-espresso) 45%, transparent) 42%, transparent 72%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, color-mix(in srgb, var(--color-espresso) 85%, transparent) 0%, transparent 52%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-10 sm:pb-14">
            <Reveal>
              <h2
                id="story-heading"
                className="max-w-[24ch] text-display-sm text-cream text-balance"
              >
                For people who take their coffee seriously,
                <span className="italic opacity-85"> and themselves a little less so.</span>
              </h2>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="container-page py-16 sm:py-20 lg:py-24">
        <Reveal>
          {/* Draft brand narrative — confirm with the founders before launch. */}
          <p className="max-w-[62ch] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">
            Kelvo started with a simple frustration: the coffee we grew up on is excellent, and
            making it properly on a Tuesday morning is a lot to ask. So we put the decoction in a
            pouch, then gave it somewhere to go — vanilla, hazelnut, caramel, and a cask-aged one
            for the evenings.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-px bg-[var(--rule)] sm:mt-20 sm:grid-cols-3">
          {pillars.map((pillar, index) => (
            <li key={pillar.title} className="bg-cream">
              <Reveal delay={index * 0.08}>
                <div className="flex h-full flex-col gap-4 py-8 sm:px-6 lg:px-8">
                  <span className="index-mark label text-caramel" aria-hidden="true">
                    [{index + 1}]
                  </span>
                  <h3 className="font-display text-[1.2rem] leading-snug text-espresso">
                    {pillar.title}
                  </h3>
                  <p className="text-[0.9rem] leading-relaxed text-muted">{pillar.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {visible.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-20">
              {showSamples && (
                <p className="label mb-5 inline-block border border-dashed border-caramel/60 px-3 py-1.5 text-caramel">
                  Sample layout · development only · replace in src/config/testimonials.ts
                </p>
              )}
              <ul className="grid gap-px bg-[var(--rule)] sm:grid-cols-3">
                {visible.map((testimonial, index) => (
                  <li key={index} className="flex flex-col justify-between gap-6 bg-cream py-8 sm:px-6">
                    <blockquote className="font-display text-[1.05rem] leading-relaxed text-espresso">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <footer className="text-[0.8rem] text-muted">
                      <span className="block font-medium text-espresso">{testimonial.name}</span>
                      {testimonial.context}
                    </footer>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.05}>
          <div className="mt-20 flex flex-col gap-6 border-t border-[var(--rule)] pt-10 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="max-w-[18ch] font-display text-[2rem] leading-tight text-espresso sm:text-[2.6rem]">
              Ready to find your flavour?
            </h3>
            <button
              type="button"
              onClick={() => scrollTo('#shop')}
              className="link-underline label shrink-0 self-start text-espresso sm:self-auto"
            >
              Shop Kelvo
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
