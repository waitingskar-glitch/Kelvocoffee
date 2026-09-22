import { useEffect, useState } from 'react'
import type { Product } from '@/types/shopify'
import type { FlavourMeta } from '@/config/catalog'
import { site } from '@/config/site'
import { testimonialsForProduct } from '@/config/testimonials'
import { defaultVariant, listProducts } from '@/services/products'
import { useCatalog } from '@/context/catalogContext'
import { formatMoney } from '@/lib/format'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import { useSectionNav } from '@/hooks/useSectionNav'
import { Link } from '@/router'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductVariantSelector, shortVariantLabel, variantDetail } from '@/components/ProductVariantSelector'
import { NotifyMeModal, type NotifyTarget } from '@/components/NotifyMeModal'
import { ArrowRightIcon } from '@/components/ui/icons'

const STEPS = [
  { title: 'Pour', copy: 'A little concentrate into your cup.' },
  { title: 'Mix', copy: 'Hot milk, hot water, or cold milk over ice.' },
  { title: 'Drink', copy: 'That is the whole thing.' },
] as const

/**
 * Product detail page at /products/:handle.
 *
 * Everything commercial — title, description, price, variants, availability —
 * comes from Shopify. The flavour metadata only supplies presentation: the
 * tasting note and the accent colour. The trial pack has no flavour meta, so
 * every use of it is optional.
 */
export function ProductPage({ product, meta }: { product: Product; meta: FlavourMeta | null }) {
  const { catalog } = useCatalog()
  const [selectedId, setSelectedId] = useState(() => defaultVariant(product)?.id ?? '')
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null)
  const scrollTo = useSectionNav()

  const selected = product.variants.find((v) => v.id === selectedId) ?? product.variants[0]
  const image = product.images[0]
  const detail = selected ? variantDetail(selected.title) : null
  const displayName = meta?.name ?? product.title

  // Reset the size choice when routing straight from one product to another.
  useEffect(() => {
    setSelectedId(defaultVariant(product)?.id ?? '')
  }, [product])

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${product.title} — ${site.legalName}`

    const tag = document.querySelector('meta[name="description"]')
    const previousDescription = tag?.getAttribute('content') ?? ''
    tag?.setAttribute('content', product.description.slice(0, 155))

    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: image ? [image.url] : [],
      brand: { '@type': 'Brand', name: site.legalName },
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        name: variant.title,
        price: variant.price.amount,
        priceCurrency: variant.price.currencyCode,
        availability: variant.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `${site.url}/products/${product.handle}`,
      })),
    })
    document.head.appendChild(schema)

    return () => {
      document.title = previousTitle
      tag?.setAttribute('content', previousDescription)
      schema.remove()
    }
  }, [product, image])

  const others = catalog ? listProducts(catalog).filter((item) => item.product.handle !== product.handle) : []
  const reviews = testimonialsForProduct(product.handle)

  return (
    <main id="main" className="pt-[var(--spacing-header)]">
      <div className="container-page py-8 sm:py-10">
        <button
          type="button"
          onClick={() => scrollTo('#shop')}
          className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-espresso"
        >
          <ArrowRightIcon className="size-3.5 rotate-180" />
          All coffee
        </button>
      </div>

      <div className="grid border-t border-[var(--rule)] lg:grid-cols-2">
        {/* --- Photograph --- */}
        <div className="bg-espresso">
          {image ? (
            <img
              src={shopifyImage(image.url, 1100)}
              srcSet={shopifySrcSet(image.url, [600, 900, 1100, 1500])}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt={image.altText}
              width={image.width ?? 1100}
              height={image.height ?? 821}
              className="h-full min-h-[20rem] w-full object-cover lg:min-h-[34rem]"
            />
          ) : (
            <div className="grid min-h-[20rem] place-items-center lg:min-h-[34rem]">
              <span className="label text-cream/50">Photograph coming</span>
            </div>
          )}
        </div>

        {/* --- Buy --- */}
        <div className="flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
          {meta && <p className="label text-caramel">{meta.note}</p>}

          <h1 className="mt-5 text-display-sm text-espresso">{displayName}</h1>

          {meta && (
            <p className="mt-4 max-w-[42ch] text-[1rem] leading-relaxed text-muted">{meta.blurb}</p>
          )}

          <div className="mt-8 flex flex-col gap-5 border-t border-[var(--rule)] pt-6">
            <ProductVariantSelector
              variants={product.variants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              legend={`Size for ${displayName}`}
            />

            {selected ? (
              <p className="flex items-baseline gap-3">
                <span className="index-mark font-display text-[2.25rem] leading-none text-espresso">
                  {formatMoney(selected.price)}
                </span>
                <span className="text-[0.8rem] text-muted">
                  {shortVariantLabel(selected.title)}
                  {detail ? ` · ${detail}` : ''}
                </span>
              </p>
            ) : (
              <p className="text-[0.9rem] text-muted">
                Not on sale yet. Join the list and you&rsquo;ll hear first.
              </p>
            )}

            <div className="sm:max-w-xs">
              <AddToCartButton
                product={product}
                variant={selected}
                size="lg"
                onRequestNotify={(p, v) =>
                  setNotifyTarget({
                    product: p,
                    variant: v,
                    title: p.title,
                    handle: p.handle,
                    intent: 'restock',
                  })
                }
              />
            </div>
          </div>

          {/* Shopify's own copy. Merchant-authored, so trusted as HTML. */}
          {product.descriptionHtml && (
            <div
              className="prose-kelvo mt-10 max-w-[46ch] border-t border-[var(--rule)] pt-8 text-[0.95rem] text-muted"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>

      {/* --- What people say --- */}
      {reviews.length > 0 && (
        <section aria-labelledby="pdp-reviews" className="border-t border-[var(--rule)]">
          <div className="container-page py-14 sm:py-16">
            <h2 id="pdp-reviews" className="label text-caramel">
              In their words
            </h2>
            <ul className="mt-8 grid gap-px bg-[var(--rule)] sm:grid-cols-2">
              {reviews.map((review, index) => (
                <li key={index} className="flex flex-col gap-5 bg-cream py-8 sm:px-6">
                  <blockquote className="max-w-[34ch] font-display text-[1.15rem] leading-relaxed text-espresso">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <footer className="text-[0.78rem] text-muted">
                    <span className="font-medium text-espresso">{review.name}</span>
                    {review.context ? ` · ${review.context}` : ''}
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --- How to drink it --- */}
      <section aria-labelledby="pdp-how" className="border-t border-[var(--rule)] bg-cream-deep">
        <div className="container-page py-14 sm:py-16">
          <h2 id="pdp-how" className="label text-caramel">
            How to drink it
          </h2>
          <ol className="mt-8 grid gap-px bg-[var(--rule)] sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="bg-cream-deep py-6 sm:px-6">
                <span className="index-mark label text-caramel" aria-hidden="true">
                  [{index + 1}]
                </span>
                <h3 className="mt-3 font-display text-[1.4rem] leading-none text-espresso">
                  {step.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- The rest of the range --- */}
      {others.length > 0 && (
        <section aria-labelledby="pdp-others" className="border-t border-[var(--rule)]">
          <div className="container-page py-14 sm:py-16">
            <h2 id="pdp-others" className="label text-caramel">
              The rest of the range
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-3 lg:grid-cols-5">
              {others.map(({ product: other, meta: otherMeta }) => {
                const otherImage = other.images[0]
                const price = defaultVariant(other)?.price
                return (
                  <li key={other.handle} className="bg-cream">
                    <Link href={`/products/${other.handle}`} className="group block">
                      <div className="overflow-hidden bg-espresso">
                        {otherImage && (
                          <img
                            src={shopifyImage(otherImage.url, 500)}
                            srcSet={shopifySrcSet(otherImage.url, [300, 500, 700])}
                            sizes="(min-width: 1024px) 18vw, 45vw"
                            alt={otherImage.altText}
                            width={500}
                            height={375}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                          />
                        )}
                      </div>
                      <div className="px-4 py-4">
                        <span className="block font-display text-[1.05rem] text-espresso">
                          {otherMeta?.name ?? other.title}
                        </span>
                        {price && (
                          <span className="index-mark mt-1 block text-[0.8rem] text-muted">
                            {formatMoney(price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      <NotifyMeModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
    </main>
  )
}
