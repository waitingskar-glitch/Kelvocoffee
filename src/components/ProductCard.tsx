import { useState } from 'react'
import type { FlavourMeta } from '@/config/catalog'
import type { Product, ProductVariant } from '@/types/shopify'
import { defaultVariant } from '@/services/products'
import { formatMoney } from '@/lib/format'
import { AddToCartButton } from './AddToCartButton'
import { ProductVariantSelector, shortVariantLabel, variantDetail } from './ProductVariantSelector'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import { cn } from '@/lib/cn'
import { Link } from '@/router'

interface Props {
  product: Product
  meta: FlavourMeta
  /** One-based position, shown as the [n] index mark. */
  index: number
  eager?: boolean
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/**
 * Index-style product entry: number and name on top, the photograph in the
 * middle, price and action underneath. Square, hairline-ruled, no shadow —
 * except the buy button, which stays deliberately solid.
 */
export function ProductCard({ product, meta, index, eager, onRequestNotify }: Props) {
  const [selectedId, setSelectedId] = useState(() => defaultVariant(product)?.id ?? '')
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0]

  const image = product.images[0]
  const isSoldOut = !product.availableForSale
  const detail = selected ? variantDetail(selected.title) : null

  return (
    <article className="group flex h-full flex-col bg-cream">
      {/* --- Index and name --- */}
      <div className="flex items-baseline gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <span className="index-mark label shrink-0 text-caramel" aria-hidden="true">
          [{index}]
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[1.3rem] leading-tight text-espresso sm:text-[1.45rem]">
            <Link href={`/products/${product.handle}`} className="transition-opacity hover:opacity-60">
              {meta.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">{meta.blurb}</p>
        </div>
      </div>

      {/* --- Photograph --- */}
      <Link href={`/products/${product.handle}`} className="relative mt-6 block overflow-hidden bg-espresso">
        <img
          src={image ? shopifyImage(image.url, 800) : meta.image.src}
          srcSet={image ? shopifySrcSet(image.url, [400, 640, 800, 1100]) : meta.image.srcSet}
          sizes="(min-width: 1024px) 28rem, (min-width: 640px) 45vw, 88vw"
          alt={image?.altText ?? meta.image.alt}
          width={1100}
          height={821}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)]',
            'group-hover:scale-[1.03]',
            isSoldOut && 'opacity-70',
          )}
        />
        <span className="label absolute top-4 left-4 text-cream/80" aria-hidden="true">
          {meta.note}
        </span>
        {isSoldOut && (
          <span className="label absolute top-4 right-4 text-cream/80">
            Coming soon
          </span>
        )}
      </Link>

      {/* --- Price and action --- */}
      <div className="mt-auto flex flex-col gap-5 px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
        <ProductVariantSelector
          variants={product.variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
          legend={`Size for ${meta.name}`}
        />

        <div className="flex items-end justify-between gap-4 border-t border-[var(--rule)] pt-4">
          {selected ? (
            <>
              <p className="min-w-0">
                <span className="block text-[0.76rem] text-muted">
                  {shortVariantLabel(selected.title)}
                  {detail ? ` · ${detail}` : ''}
                </span>
              </p>
              <span className="index-mark shrink-0 font-display text-[1.5rem] leading-none text-espresso">
                {formatMoney(selected.price)}
              </span>
            </>
          ) : (
            <p className="text-[0.84rem] leading-relaxed text-muted">
              Not on sale yet. Join the list and you&rsquo;ll hear first.
            </p>
          )}
        </div>

        <AddToCartButton product={product} variant={selected} onRequestNotify={onRequestNotify} />
      </div>
    </article>
  )
}
