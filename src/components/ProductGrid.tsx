import { flavours } from '@/config/catalog'
import { useCatalog } from '@/context/catalogContext'
import type { Product, ProductVariant } from '@/types/shopify'
import { ProductCard } from './ProductCard'
import { SectionHeading } from './ui/SectionHeading'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { useSectionNav } from '@/hooks/useSectionNav'

interface Props {
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/**
 * SECTION 2 — Shop.
 *
 * Products sit in a hairline-ruled grid rather than floating cards: one rule
 * between each, edges flush. This is where the page turns commercial.
 */
export function ProductGrid({ onRequestNotify }: Props) {
  const { catalog, status, error, retry } = useCatalog()
  const scrollTo = useSectionNav()

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="scroll-mt-20 bg-cream py-16 sm:py-20 lg:py-24"
    >
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="shop-heading"
            eyebrow="The range"
            title="Pick your kind of coffee."
            description="One base brew, five directions. Every pouch is the same easy pour — the difference is what you're in the mood for."
            className="lg:max-w-xl"
          />
          <Reveal delay={0.08}>
            <button
              type="button"
              onClick={() => scrollTo('#trial-pack')}
              className="link-underline label text-espresso"
            >
              Not sure? Start with all four
            </button>
          </Reveal>
        </div>
      </div>

      <div className="container-page mt-12 sm:mt-16">
        {status === 'loading' && <GridSkeleton />}

        {status === 'error' && (
          <div className="border-t border-[var(--rule)] py-16 text-center">
            <h3 className="font-display text-[1.4rem] text-espresso">Our coffee is hiding</h3>
            <p className="mx-auto mt-2 max-w-[38ch] text-[0.92rem] text-muted">{error}</p>
            <Button className="mt-6" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && catalog && (
          /* The gap is the rule: a hairline background shows through it. */
          <ul className="grid grid-cols-1 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3">
            {catalog.order.map((key, index) => {
              const product = catalog.byFlavour[key]
              if (!product) return null
              return (
                <li key={key} className="bg-cream">
                  <Reveal delay={Math.min(index, 2) * 0.06} className="h-full [&>*]:h-full">
                    <ProductCard
                      product={product}
                      meta={flavours[key]}
                      index={index + 1}
                      eager={index < 2}
                      onRequestNotify={onRequestNotify}
                    />
                  </Reveal>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function GridSkeleton() {
  return (
    <ul
      className="grid grid-cols-1 gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="bg-cream">
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="h-5 w-1/3 animate-pulse bg-sand" />
            <div className="h-3 w-full animate-pulse bg-sand" />
          </div>
          <div className="aspect-[4/3] w-full animate-pulse bg-sand" />
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="h-9 w-2/3 animate-pulse bg-sand" />
            <div className="h-12 w-full animate-pulse bg-sand" />
          </div>
        </li>
      ))}
    </ul>
  )
}
