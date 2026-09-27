import { useEffect } from 'react'
import { site } from '@/config/site'
import { brand } from '@/config/brand'
import { flavours } from '@/config/catalog'
import { productHandles, shopOrder } from '@/config/shopify'
import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Wordmark'
import { Reveal } from '@/components/ui/Reveal'
import { useSectionNav } from '@/hooks/useSectionNav'
import { cn } from '@/lib/cn'
import { Link } from '@/router'

/**
 * About at /about.
 *
 * The story is the back-of-pack copy, verbatim. Every other line here is a
 * fact from the brand book. Nothing about origins, roasts or people is
 * invented; flavour leads, heritage doesn't.
 */

const FACTS = [
  { title: '80 / 20.', copy: 'Coffee and chicory. The filter-coffee kind. Nothing fancy.' },
  { title: '10 ml. One cup.', copy: 'A 50 ml pack makes 5 cups. A 100 ml pack makes 10.' },
  { title: 'Hot or cold.', copy: 'Add milk and sugar. Stir. That’s it. No machine, no filter.' },
  { title: 'Five flavours.', copy: 'Classic has no flavour added. The other four use nature-identical flavourings.' },
] as const

export function AboutPage() {
  const scrollTo = useSectionNav()

  useEffect(() => {
    document.title = `About | ${site.legalName}`
    const tag = document.querySelector('meta[name="description"]')
    const previousDescription = tag?.getAttribute('content') ?? ''
    tag?.setAttribute(
      'content',
      'Kelvo is flavoured coffee concentrate from Bengaluru. Our take on filter coffee, familiar but way more fun.',
    )
    return () => {
      document.title = site.defaultTitle
      tag?.setAttribute('content', previousDescription)
    }
  }, [])

  return (
    <main id="main" className="pt-[calc(var(--spacing-header)+1rem)]">
      {/* --- Opening --- */}
      <section aria-labelledby="about-title" className="px-3 pt-4 sm:px-4">
        <div className="kv-surface ground-hazelnut mx-auto grid max-w-[75rem] gap-10 overflow-hidden rounded-xl px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:px-14 lg:py-24">
          <div>
            <p className="label">About Kelvo</p>
            <h1 id="about-title" className="mt-5 max-w-[10ch] text-mega">
              Filter coffee. Way more fun.
            </h1>
          </div>
          <div className="flex items-end">
            <div className="kv-grain ground-paper w-full max-w-[26rem] rotate-[1.5deg] rounded-lg border-2 border-ink p-7 sm:p-9">
              <Wordmark className="w-40 sm:w-48" />
              <p className="descriptor mt-3 text-[1.1rem]">
                {brand.descriptor[0]}
                <br />
                {brand.descriptor[1]}
              </p>
              <p className="mt-6 text-[1.05rem] leading-snug font-medium">Made in {site.city}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- The story, verbatim --- */}
      <section aria-labelledby="about-story" className="container-page py-20 text-center sm:py-28">
        <Reveal>
          <h2 id="about-story" className="text-h2 mx-auto max-w-[12ch]">
            We&rsquo;re not coffee nerds.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-10 max-w-[40ch] text-[1.3rem] leading-snug font-medium sm:text-[1.5rem]">
            {brand.story}
          </p>
        </Reveal>
      </section>

      {/* --- What's in the pack --- */}
      <section aria-labelledby="about-facts" className="px-3 sm:px-4">
        <div className="kv-surface ground-vanilla mx-auto max-w-[75rem] rounded-xl px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
          <h2 id="about-facts" className="text-h2 mx-auto max-w-[14ch] text-center">
            What&rsquo;s in the pack.
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((fact, index) => (
              <li
                key={fact.title}
                className={cn(
                  'kv-grain ground-paper rounded-lg border-2 border-ink p-6 text-center',
                  index % 2 === 0 ? 'lg:-rotate-1' : 'lg:rotate-1',
                )}
              >
                <h3 className="font-display text-[1.7rem] leading-none">{fact.title}</h3>
                <p className="mt-3 text-[1rem] leading-snug font-medium">{fact.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- The range --- */}
      <section aria-labelledby="about-range" className="container-page py-20 sm:py-28">
        <h2 id="about-range" className="text-h2 text-center">
          The range.
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {shopOrder.map((key) => {
            const meta = flavours[key]
            return (
              <li key={key}>
                <Link
                  href={`/products/${productHandles[key]}`}
                  className="group kv-grain ground-paper flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink"
                >
                  <div className="aspect-square overflow-hidden bg-ink/10">
                    <img
                      src={meta.image.src}
                      srcSet={meta.image.srcSet}
                      sizes="(min-width: 1024px) 16rem, 45vw"
                      alt=""
                      width={meta.image.width}
                      height={meta.image.height}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col items-center border-t-2 border-ink p-4 text-center">
                    <span className="font-display text-[1.4rem] leading-none">{meta.name}</span>
                    <span className="mt-2 text-[0.92rem] leading-snug font-medium">{meta.note}.</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      {/* --- Close --- */}
      <section aria-labelledby="about-close" className="px-3 pb-6 sm:px-4">
        <div className="kv-surface ground-caramel mx-auto flex max-w-[75rem] flex-col items-center gap-8 rounded-xl px-6 py-14 text-center sm:px-10 lg:px-14 lg:py-16">
          <div>
            <h2 id="about-close" className="text-h2 mx-auto max-w-[10ch]">
              Pick one. Or four.
            </h2>
            <p className="mt-6 text-[1.05rem] leading-snug font-medium">
              Say hi at{' '}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
              <br />
              Customer care{' '}
              <a href={`tel:${brand.customerCare.replace(/\s+/g, '')}`} className="link-underline tnum">
                {brand.customerCare}
              </a>
            </p>
          </div>
          <Button size="lg" onClick={() => scrollTo('#shop')}>
            Shop the flavours
          </Button>
        </div>
      </section>
    </main>
  )
}
