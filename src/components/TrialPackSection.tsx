import { flavours } from '@/config/catalog'
import { trialPack, preorderNote } from '@/config/site'
import { useCatalog } from '@/context/catalogContext'
import { defaultVariant } from '@/services/products'
import { formatAmount, formatMoney } from '@/lib/format'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import type { Product, ProductVariant } from '@/types/shopify'
import { AddToCartButton } from './AddToCartButton'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'
import { BellIcon } from './ui/icons'

interface Props {
  onRequestNotify: (product: Product | null, variant?: ProductVariant) => void
}

/**
 * SECTION 4 — Trial pack.
 *
 * The lowest-friction way in. When a Shopify trial-pack product is connected
 * (see `VITE_HANDLE_TRIAL_PACK`) everything here — price, availability, add to
 * cart — comes from Shopify. Until then it presents the offer and collects
 * interest rather than inventing a purchasable product.
 */
export function TrialPackSection({ onRequestNotify }: Props) {
  const { catalog } = useCatalog()
  const product = catalog?.trialPack ?? null
  const variant = product ? defaultVariant(product) : undefined

  // Shopify's own pack photograph, once one is uploaded to the product.
  const packImage = product?.images[0] ?? null

  const price = variant ? variant.price : { amount: trialPack.fallbackPrice, currencyCode: trialPack.currency }
  const perFlavour = price.amount / trialPack.pouches
  // Only shown when it divides cleanly — no rounded-off "from" pricing.
  const showPerFlavour = Number.isInteger(perFlavour)

  const isLive = Boolean(product && variant)

  return (
    <section
      id="trial-pack"
      aria-labelledby="trial-heading"
      className="surface-grain relative scroll-mt-24 overflow-hidden bg-espresso py-16 text-cream sm:py-20 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 20% 0%, color-mix(in srgb, var(--color-caramel) 26%, transparent) 0%, transparent 60%)',
        }}
      />

      <div className="container-page relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ---- Composition ---- */}
          <Reveal className="lg:col-span-6">
            {packImage ? (
              /* A real pack photograph always wins over the composed grid. */
              <figure className="overflow-hidden rounded-md border border-cream/10 sm:rounded-lg">
                <img
                  src={shopifyImage(packImage.url, 900)}
                  srcSet={shopifySrcSet(packImage.url, [500, 700, 900, 1200])}
                  alt={packImage.altText}
                  width={packImage.width ?? 1200}
                  height={packImage.height ?? 896}
                  sizes="(min-width: 1024px) 42rem, 92vw"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            ) : (
              /* No pack shot yet — compose one from the individual pouches
                 rather than mocking up packaging that does not exist. */
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {trialPack.flavourKeys.map((key) => {
                  const meta = flavours[key]
                  return (
                    <figure
                      key={key}
                      className="relative overflow-hidden rounded-md border border-cream/10 sm:rounded-lg"
                    >
                      <img
                        src={meta.image.src}
                        srcSet={meta.image.srcSet}
                        sizes="(min-width: 1024px) 20rem, 45vw"
                        alt={meta.image.alt}
                        width={1100}
                        height={821}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full object-cover"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/85 to-transparent px-3 pt-8 pb-2.5 text-[0.75rem] font-medium text-cream sm:text-[0.82rem]">
                        {meta.name}
                      </figcaption>
                    </figure>
                  )
                })}
              </div>
            )}
          </Reveal>

          {/* ---- Offer ---- */}
          <Reveal delay={0.08} className="lg:col-span-6">
            <div>
              <p className="flex items-center gap-2.5 text-eyebrow font-semibold text-caramel-soft uppercase">
                <span className="h-px w-6 bg-current opacity-50" aria-hidden="true" />
                {!isLive ? 'Launching soon' : variant?.isPreorder ? 'Preorder now' : 'Best place to start'}
              </p>

              <h2 id="trial-heading" className="mt-4 text-display-sm text-cream">
                Can&rsquo;t pick one? Don&rsquo;t.
              </h2>

              <p className="mt-4 max-w-[42ch] text-[1rem] leading-relaxed text-muted-dark sm:text-[1.06rem]">
                {trialPack.pouches} × {trialPack.volumeMl}ml pouches, one of each flavour. Enough of
                every one to work out which becomes your regular.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {trialPack.flavourKeys.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 rounded-pill border border-cream/15 px-3 py-1.5 text-[0.8rem] text-cream/85"
                  >
                    <span
                      className="size-1.5 rounded-pill"
                      style={{ background: flavours[key].accent }}
                      aria-hidden="true"
                    />
                    {flavours[key].name}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-end gap-4 border-t border-cream/12 pt-6">
                <p>
                  <span className="tnum block font-display text-[2.6rem] leading-none text-cream sm:text-[3rem]">
                    {formatMoney(price)}
                  </span>
                  {showPerFlavour && (
                    <span className="tnum mt-2 block text-[0.82rem] text-muted-dark">
                      {formatAmount(perFlavour, price.currencyCode)} per flavour
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-7 sm:max-w-sm">
                {isLive && product ? (
                  <AddToCartButton
                    product={product}
                    variant={variant}
                    size="lg"
                    variantStyle="onDark"
                    onRequestNotify={(p, v) => onRequestNotify(p, v)}
                  />
                ) : (
                  <Button
                    size="lg"
                    fullWidth
                    variant="onDark"
                    onClick={() => onRequestNotify(null)}
                  >
                    <BellIcon className="size-4" />
                    Tell me when it&rsquo;s ready
                  </Button>
                )}
              </div>

              <p className="mt-4 text-[0.78rem] text-muted-dark">
                {!isLive
                  ? 'The trial pack is being put together. Leave your email and you get first pour.'
                  : variant?.isPreorder
                    ? `${preorderNote()}. You're charged today and can cancel any time before dispatch.`
                    : 'Ships from our Shopify store. Secure checkout.'}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
