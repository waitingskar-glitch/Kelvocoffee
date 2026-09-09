import { flavours } from '@/config/catalog'
import { useCatalog } from '@/context/catalogContext'
import type { Product, ProductVariant } from '@/types/shopify'
import { ProductCard } from './ProductCard'
import { SectionHeading } from './ui/SectionHeading'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { ArrowRightIcon } from './ui/icons'

interface Props {
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/** SECTION 2 — Shop / flavour discovery. */
export function ProductGrid({ onRequestNotify }: Props) {
  const { catalog, status, error, retry } = useCatalog()

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="scroll-mt-24 border-t border-espresso/[0.07] bg-cream-deep py-16 sm:py-20 lg:py-28"
    >
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <SectionHeading
            id="shop-heading"
            eyebrow="The range"
            title="Pick your kind of coffee."
            description="One base brew, five directions. Every pouch is the same easy pour — the difference is what you're in the mood for."
          />
          <Reveal delay={0.08} className="shrink-0 sm:pb-2">
            <a
              href="#trial-pack"
              onClick={(event) => {
                event.preventDefault()
                const target = document.querySelector('#trial-pack')
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                ;(target as HTMLElement | null)?.focus({ preventScroll: true })
              }}
              className="group inline-flex items-center gap-2 rounded-pill border border-gold/45 bg-cream px-4 py-2.5 text-[0.83rem] font-medium text-espresso transition-colors duration-200 hover:border-gold hover:bg-cream/70"
            >
              Not sure? Start with all four
              <ArrowRightIcon className="size-3.5 text-caramel transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <div className="mt-10 sm:mt-14">
          {status === 'loading' && <GridSkeleton />}

          {status === 'error' && (
            <div className="rounded-lg border border-sand-deep bg-cream p-8 text-center sm:p-12">
              <h3 className="font-display text-[1.4rem] text-espresso">Our coffee is hiding</h3>
              <p className="mx-auto mt-2 max-w-[38ch] text-[0.92rem] text-muted">{error}</p>
              <Button className="mt-6" onClick={retry}>
                Try again
              </Button>
            </div>
          )}

          {status === 'ready' && catalog && (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {catalog.order.map((key, index) => {
                const product = catalog.byFlavour[key]
                if (!product) return null
                return (
                  <li key={key}>
                    <Reveal delay={Math.min(index, 2) * 0.07} className="h-full [&>*]:h-full">
                      <ProductCard
                        product={product}
                        meta={flavours[key]}
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
      </div>
    </section>
  )
}

/** Fixed-ratio skeletons — the grid reserves its space, so nothing shifts. */
function GridSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-lg border border-sand-deep/70 bg-white/40"
        >
          <div className="aspect-[3/2] w-full animate-pulse bg-sand sm:aspect-[4/3]" />
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="h-6 w-1/3 animate-pulse rounded-xs bg-sand" />
            <div className="h-4 w-full animate-pulse rounded-xs bg-sand" />
            <div className="h-4 w-4/5 animate-pulse rounded-xs bg-sand" />
            <div className="mt-2 h-12 w-full animate-pulse rounded-pill bg-sand" />
          </div>
        </li>
      ))}
    </ul>
  )
}
