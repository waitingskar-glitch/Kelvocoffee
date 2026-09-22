import { flavours } from '@/config/catalog'
import { trialPack } from '@/config/site'
import { useCatalog } from '@/context/catalogContext'
import { defaultVariant } from '@/services/products'
import { formatAmount, formatMoney } from '@/lib/format'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import type { Product, ProductVariant } from '@/types/shopify'
import { AddToCartButton } from './AddToCartButton'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'

interface Props {
  onRequestNotify: (product: Product | null, variant?: ProductVariant) => void
}

/**
 * SECTION 4 — Trial pack.
 *
 * The commercial peak of the page: flooded espresso, full-bleed imagery, and
 * the one unmistakably solid button.
 */
export function TrialPackSection({ onRequestNotify }: Props) {
  const { catalog } = useCatalog()
  const product = catalog?.trialPack ?? null
  const variant = product ? defaultVariant(product) : undefined
  const packImage = product?.images[0] ?? null

  const price = variant ? variant.price : { amount: trialPack.fallbackPrice, currencyCode: trialPack.currency }
  const perFlavour = price.amount / trialPack.pouches
  const showPerFlavour = Number.isInteger(perFlavour)
  const isLive = Boolean(product && variant)

  return (
    <section
      id="trial-pack"
      aria-labelledby="trial-heading"
      className="scroll-mt-20 bg-espresso text-cream"
    >
      <div className="grid lg:grid-cols-2">
        {/* --- Composition --- */}
        <Reveal className="order-2 lg:order-1">
          {packImage ? (
            <figure className="h-full">
              <img
                src={shopifyImage(packImage.url, 1100)}
                srcSet={shopifySrcSet(packImage.url, [600, 900, 1100, 1500])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt={packImage.altText}
                loading="lazy"
                decoding="async"
                className="h-full min-h-[22rem] w-full object-cover lg:min-h-[38rem]"
              />
            </figure>
          ) : (
            /* No pack photograph yet — compose one from the four pouches
               rather than mocking up packaging that does not exist. */
            <div className="grid h-full grid-cols-2 gap-px bg-[var(--rule-dark)]">
              {trialPack.flavourKeys.map((key) => {
                const meta = flavours[key]
                return (
                  <figure key={key} className="relative bg-espresso">
                    <img
                      src={meta.image.src}
                      srcSet={meta.image.srcSet}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      alt={meta.image.alt}
                      width={1100}
                      height={821}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full object-cover"
                    />
                    <figcaption className="label absolute bottom-3 left-3 text-cream/70">
                      {meta.name}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          )}
        </Reveal>

        {/* --- Offer --- */}
        <Reveal delay={0.08} className="order-1 lg:order-2">
          <div className="flex h-full flex-col justify-center px-5 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="label border-t border-[var(--rule-dark)] pt-4 text-caramel-soft">
              {isLive ? 'Best place to start' : 'Launching soon'}
            </p>

            <h2 id="trial-heading" className="mt-6 text-display-sm text-cream">
              Can&rsquo;t pick one? Don&rsquo;t.
            </h2>

            <p className="mt-5 max-w-[40ch] text-[1rem] leading-relaxed text-muted-dark">
              {trialPack.pouches} × {trialPack.volumeMl}ml pouches, one of each flavour. Enough of
              every one to work out which becomes your regular.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {trialPack.flavourKeys.map((key, index) => (
                <li key={key} className="label flex items-baseline gap-2 text-cream/75">
                  <span className="index-mark text-caramel-soft" aria-hidden="true">
                    [{index + 1}]
                  </span>
                  {flavours[key].name}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-baseline gap-4 border-t border-[var(--rule-dark)] pt-6">
              <span className="index-mark font-display text-[2.75rem] leading-none text-cream sm:text-[3.25rem]">
                {formatMoney(price)}
              </span>
              {showPerFlavour && (
                <span className="index-mark text-[0.82rem] text-muted-dark">
                  {formatAmount(perFlavour, price.currencyCode)} per flavour
                </span>
              )}
            </div>

            <div className="mt-8 sm:max-w-sm">
              {isLive && product ? (
                <AddToCartButton
                  product={product}
                  variant={variant}
                  size="lg"
                  variantStyle="onDark"
                  onRequestNotify={(p, v) => onRequestNotify(p, v)}
                />
              ) : (
                <Button size="lg" fullWidth variant="onDark" onClick={() => onRequestNotify(null)}>
                  Tell me when it&rsquo;s ready
                </Button>
              )}
            </div>

            <p className="mt-4 text-[0.78rem] leading-relaxed text-muted-dark">
              {isLive
                ? 'Ships from our Shopify store. Secure checkout.'
                : 'The trial pack is being put together. Leave your email and you get first pour.'}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
