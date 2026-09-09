import { SectionHeading } from './ui/SectionHeading'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { ArrowRightIcon } from './ui/icons'

const steps = [
  {
    number: '01',
    title: 'Pour',
    copy: 'A little concentrate into your cup. No filter, no waiting for the decoction to drip.',
  },
  {
    number: '02',
    title: 'Mix',
    copy: 'Top up with hot milk, hot water, or cold milk over ice. You decide how strong it goes.',
  },
  {
    number: '03',
    title: 'Drink',
    copy: 'That is the whole thing. Same cup you know, in whichever flavour you reached for.',
  },
] as const

const servingSuggestions = [
  { label: 'Hot filter coffee', detail: 'Concentrate + hot milk' },
  { label: 'Iced coffee', detail: 'Concentrate + cold milk + ice' },
  { label: 'Black', detail: 'Concentrate + hot water' },
] as const

function scrollToShop() {
  const target = document.querySelector('#shop')
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  ;(target as HTMLElement).setAttribute('tabindex', '-1')
  ;(target as HTMLElement).focus({ preventScroll: true })
}

/** SECTION 3 — The Kelvo experience. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="surface-grain relative scroll-mt-24 overflow-hidden border-t border-espresso/[0.07] py-16 sm:py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="Coffee, without the coffee routine."
          description="Filter coffee usually asks for a bit of planning. This asks for a cup."
        />

        {/* Steps */}
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-sand-deep bg-sand-deep sm:mt-16 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.number} className="bg-cream">
              <Reveal delay={index * 0.08}>
                <div className="flex h-full flex-col gap-4 p-6 sm:p-7 lg:p-9">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="font-display text-[2.6rem] leading-none text-caramel/35 lg:text-[3.2rem]"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                    <span className="h-px flex-1 bg-gold/35" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-[1.6rem] leading-none text-espresso lg:text-[1.8rem]">
                    {step.title}
                  </h3>
                  <p className="text-[0.92rem] leading-relaxed text-muted">{step.copy}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* Serving suggestions + CTA */}
        <div className="mt-10 flex flex-col gap-8 rounded-lg bg-espresso p-6 text-cream sm:mt-12 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="min-w-0">
            <h3 className="font-display text-[1.5rem] leading-tight text-cream sm:text-[1.75rem]">
              Three ways people drink it
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {servingSuggestions.map((suggestion) => (
                <li
                  key={suggestion.label}
                  className="rounded-md border border-cream/15 bg-cream/[0.06] px-3.5 py-2.5"
                >
                  <span className="block text-[0.88rem] font-medium text-cream">
                    {suggestion.label}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] text-muted-dark">
                    {suggestion.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            size="lg"
            variant="onDark"
            className="group shrink-0"
            onClick={scrollToShop}
          >
            Find your flavour
            <ArrowRightIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
