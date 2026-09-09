import { testimonials, sampleTestimonials, type Testimonial } from '@/config/testimonials'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'
import { ArrowRightIcon, DripIcon } from './ui/icons'

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

function scrollToShop() {
  const target = document.querySelector('#shop')
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  ;(target as HTMLElement).setAttribute('tabindex', '-1')
  ;(target as HTMLElement).focus({ preventScroll: true })
}

/** SECTION 5 — Brand and trust. */
export function BrandSection() {
  // Real reviews when they exist; labelled samples in development only.
  const showSamples = testimonials.length === 0 && import.meta.env.DEV
  const visible: Testimonial[] = testimonials.length > 0 ? testimonials : showSamples ? sampleTestimonials : []

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="scroll-mt-24 border-t border-espresso/[0.07] bg-cream-deep py-16 sm:py-20 lg:py-28"
    >
      <div className="container-page">
        {/* Editorial statement */}
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <span
              className="mx-auto grid size-11 place-items-center rounded-pill border border-gold/40 text-caramel"
              aria-hidden="true"
            >
              <DripIcon className="size-5" />
            </span>
            <h2
              id="story-heading"
              className="mt-7 text-display-sm text-espresso text-balance sm:mt-8"
            >
              For people who take their coffee seriously,
              <span className="text-coffee italic"> and themselves a little less so.</span>
            </h2>
            {/* Draft brand narrative — confirm with the founders before launch. */}
            <p className="mx-auto mt-6 max-w-[56ch] text-[1rem] leading-relaxed text-muted sm:text-[1.06rem]">
              Kelvo started with a simple frustration: the coffee we grew up on is excellent, and
              making it properly on a Tuesday morning is a lot to ask. So we put the decoction in a
              pouch, then gave it somewhere to go — vanilla, hazelnut, caramel, and a cask-aged one
              for the evenings.
            </p>
          </div>
        </Reveal>

        {/* Pillars */}
        <ul className="mt-14 grid gap-8 sm:mt-16 sm:grid-cols-3 sm:gap-10">
          {pillars.map((pillar, index) => (
            <li key={pillar.title}>
              <Reveal delay={index * 0.08}>
                <div className="border-t border-gold/40 pt-5">
                  <h3 className="font-display text-[1.25rem] leading-snug text-espresso">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9rem] leading-relaxed text-muted">{pillar.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* Reviews — only rendered when there is something real (or a dev preview). */}
        {visible.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-16 sm:mt-20">
              {showSamples && (
                <p className="mb-4 inline-block rounded-pill border border-dashed border-caramel/60 px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.08em] text-caramel uppercase">
                  Sample layout · development only · replace in src/config/testimonials.ts
                </p>
              )}
              <ul className="grid gap-5 sm:grid-cols-3 sm:gap-6">
                {visible.map((testimonial, index) => (
                  <li
                    key={index}
                    className="flex flex-col justify-between gap-5 rounded-lg border border-sand-deep bg-cream p-6"
                  >
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

        {/* Closing CTA */}
        <Reveal delay={0.05}>
          <div className="mt-16 flex flex-col items-center gap-6 rounded-lg border border-gold/35 bg-cream px-6 py-10 text-center sm:mt-20 sm:px-10 sm:py-14">
            <h3 className="max-w-[20ch] font-display text-[1.9rem] leading-tight text-espresso sm:text-[2.4rem]">
              Ready to find your flavour?
            </h3>
            <Button size="lg" className="group" onClick={scrollToShop}>
              Shop Kelvo
              <ArrowRightIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
