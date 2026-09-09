import { useState } from 'react'
import type { FlavourMeta } from '@/config/catalog'
import type { Product, ProductVariant } from '@/types/shopify'
import { defaultVariant } from '@/services/products'
import { formatMoney } from '@/lib/format'
import { preorderNote } from '@/config/site'
import { AddToCartButton } from './AddToCartButton'
import { ProductVariantSelector, shortVariantLabel, variantDetail } from './ProductVariantSelector'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import { cn } from '@/lib/cn'

interface Props {
  product: Product
  meta: FlavourMeta
  /** Above-the-fold cards skip lazy loading so the grid paints immediately. */
  eager?: boolean
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

export function ProductCard({ product, meta, eager, onRequestNotify }: Props) {
  const [selectedId, setSelectedId] = useState(() => defaultVariant(product)?.id ?? '')
  const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0]

  const image = product.images[0]
  const isSoldOut = !product.availableForSale
  const isPreorder = Boolean(selected?.isPreorder)
  const detail = selected ? variantDetail(selected.title) : null

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-sand-deep/70 bg-white/55 transition-[box-shadow,border-color,transform] duration-400 ease-[var(--ease-out-soft)]',
        'hover:-translate-y-1 hover:border-gold/50 hover:shadow-lift',
      )}
    >
      {/* --- Image plate --- */}
      <div className="relative overflow-hidden bg-espresso">
        <img
          src={image ? shopifyImage(image.url, 800) : meta.image.src}
          srcSet={image ? shopifySrcSet(image.url, [400, 640, 800, 1100]) : meta.image.srcSet}
          sizes="(min-width: 1280px) 24rem, (min-width: 640px) 45vw, 92vw"
          alt={image?.altText ?? meta.image.alt}
          width={1100}
          height={821}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'aspect-[3/2] w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] sm:aspect-[4/3]',
            'group-hover:scale-[1.045]',
            isSoldOut && 'opacity-70',
          )}
        />

        <span
          className="absolute top-3 left-3 flex items-center gap-1.5 rounded-pill bg-cream/92 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.06em] text-espresso uppercase backdrop-blur-sm"
          aria-hidden="true"
        >
          <span className="size-1.5 rounded-pill" style={{ background: meta.accent }} />
          {meta.note}
        </span>

        {(isSoldOut || isPreorder) && (
          <span className="absolute top-3 right-3 rounded-pill bg-espresso/85 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.06em] text-cream uppercase backdrop-blur-sm">
            {isSoldOut ? 'Coming soon' : 'Preorder'}
          </span>
        )}
      </div>

      {/* --- Details --- */}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <h3 className="font-display text-[1.45rem] leading-tight text-espresso sm:text-[1.55rem]">
            {meta.name}
          </h3>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{meta.blurb}</p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <ProductVariantSelector
            variants={product.variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
            legend={`Size for ${meta.name}`}
          />

          <div className="flex items-end justify-between gap-3 border-t border-espresso/[0.08] pt-4">
            {selected ? (
              <p className="min-w-0">
                <span className="tnum block font-display text-[1.5rem] leading-none text-espresso">
                  {formatMoney(selected.price)}
                </span>
                <span className="mt-1.5 block truncate text-[0.75rem] text-muted">
                  {shortVariantLabel(selected.title)}
                  {detail ? ` · ${detail}` : ''}
                </span>
                {isPreorder && (
                  <span className="mt-1.5 block text-[0.75rem] font-medium text-caramel">
                    {preorderNote()}
                  </span>
                )}
              </p>
            ) : (
              /* No purchasable variant yet — never show an invented price. */
              <p className="text-[0.85rem] leading-relaxed text-muted">
                Not on sale yet. Join the list and you&rsquo;ll hear first.
              </p>
            )}
          </div>

          <AddToCartButton
            product={product}
            variant={selected}
            onRequestNotify={onRequestNotify}
          />
        </div>
      </div>
    </article>
  )
}
