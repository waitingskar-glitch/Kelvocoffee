import { flavours } from '@/config/catalog'
import { useCatalog } from '@/context/catalogContext'
import type { Product, ProductVariant } from '@/types/shopify'
import { ProductCard } from './ProductCard'
import { SectionHeading } from './ui/SectionHeading'
import { Reveal } from './ui/Reveal'
import { Button } from './ui/Button'
import { useSectionNav } from '@/hooks/useSectionNav'
import type { FlavourKey } from '@/config/shopify'
import { cn } from '@/lib/cn'

interface Props {
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/** SECTION 3 — The range, after the claims strip. */
export function ProductGrid({ onRequestNotify }: Props) {
  const { catalog, status, error, retry } = useCatalog()
  const scrollTo = useSectionNav()

  return (
    <section id="shop" aria-labelledby="shop-heading" className="container-page scroll-mt-24 pt-16 pb-12 sm:py-20">
      <SectionHeading
        id="shop-heading"
        title={
          <>
            Five flavours.
            <br />
            One pour.
          </>
        }
        intro="Same coffee underneath. Pick the one you're in the mood for."
      />

      <div className="mt-12 sm:mt-16">
        {status === 'loading' && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="h-[36rem] animate-pulse rounded-xl bg-ink/[0.06]" />
            ))}
          </ul>
        )}

        {status === 'error' && (
          <div className="kv-surface ground-vanilla rounded-xl px-6 py-14">
            <h3 className="text-display-sm">Our coffee is hiding.</h3>
            <p className="mt-3 max-w-[40ch] text-[1.05rem]">{error}</p>
            <Button className="mt-7" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && catalog && (
          <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.order.map((key, index) => {
              const product = catalog.byFlavour[key]
              if (!product) return null
              return (
                <li key={key}>
                  <Reveal delay={Math.min(index % 3, 2) * 0.07} className="h-full [&>*]:h-full">
                    <ProductCard
                      product={product}
                      meta={flavours[key]}
                      eager={index < 3}
                      onRequestNotify={onRequestNotify}
                    />
                  </Reveal>
                </li>
              )
            })}

            {/* Five flavours leave one cell. It points at the hamper builder just below. */}
            <li>
              {/* Top padding matches the cards' pouch overhang so the boxes line up side by side (not needed when stacked on phones). */}
              <Reveal delay={0.14} className="h-full sm:pt-12 [&>*]:h-full">
                <HamperTeaser onBuild={() => scrollTo('#hampers')} />
              </Reveal>
            </li>
          </ul>
        )}
      </div>
    </section>
  )
}

/**
 * The sixth cell: a quiet pointer to the hamper builder right below. The line,
 * then four hamper slots, two filled in flavour colours and two still empty,
 * and one plain link down.
 */
function HamperTeaser({ onBuild }: { onBuild: () => void }) {
  const slots: Array<FlavourKey | null> = ['caramel', 'hazelnut', null, null]
  return (
    <div className="kv-surface ground-vanilla flex h-full w-full flex-col justify-between gap-8 rounded-xl border-2 border-ink p-6 text-left sm:min-h-[22rem] sm:p-8">
      <div>
        <p className="text-display-sm font-display">
          Can&rsquo;t pick?
          <br />
          Mix your own.
        </p>
        <p className="mt-4 max-w-[26ch] text-[1.02rem] leading-snug font-medium">
          Two packs or four, any flavours. One flat price.
        </p>
      </div>

      <div>
        {/* Four slots: two packed, two to fill. */}
        <div aria-hidden="true" className="flex gap-2">
          {slots.map((key, index) => (
            <span
              key={index}
              className={cn(
                'size-9 shape-squircle border-2',
                key ? cn('kv-grain border-ink', flavours[key].ground) : 'border-dashed border-ink/35',
              )}
            />
          ))}
        </div>

        <button type="button" onClick={onBuild} className="group mt-6 flex items-center gap-3 text-[1.05rem] font-bold">
          Build a hamper
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-1">
            &darr;
          </span>
        </button>
      </div>
    </div>
  )
}
