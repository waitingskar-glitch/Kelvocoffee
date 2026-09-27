import { useState } from 'react'
import type { FlavourMeta } from '@/config/catalog'
import type { Product, ProductVariant } from '@/types/shopify'
import { defaultVariant } from '@/services/products'
import { formatMoney } from '@/lib/format'
import { Link } from '@/router'
import { AddToCartButton } from './AddToCartButton'
import { ProductVariantSelector, variantDetail } from './ProductVariantSelector'
import { cn } from '@/lib/cn'

interface Props {
  product: Product
  meta: FlavourMeta
  eager?: boolean
  onRequestNotify: (product: Product, variant?: ProductVariant) => void
}

/**
 * The reference's product card, in Kelvo's terms: a band of the flavour's
 * ground (grid and all) across the top, the cut-out pouch standing up out of
 * it past the card's edge, and a Paper body below.
 */
export function ProductCard({ product, meta, eager, onRequestNotify }: Props) {
  const [selectedId, setSelectedId] = useState(() => defaultVariant(product)?.id ?? '')
  const selected = product.variants.find((v) => v.id === selectedId) ?? product.variants[0]
  const href = `/products/${product.handle}`
  const detail = selected ? variantDetail(selected.title) : null

  return (
    // The pouch stands above the card's top edge, so the article reserves that overhang.
    <article className="group relative flex h-full flex-col pt-12">
      <img
        src={meta.pouch.src}
        srcSet={meta.pouch.srcSet}
        sizes="10rem"
        alt=""
        aria-hidden="true"
        width={meta.pouch.width}
        height={meta.pouch.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="pointer-events-none absolute -top-5 left-1/2 z-10 h-[17rem] w-auto -translate-x-1/2 drop-shadow-[0_6px_10px_rgb(27_25_24_/_0.12)] transition-transform duration-500 ease-[var(--ease-bounce)] group-hover:-translate-y-2"
      />

      <div className="kv-grain ground-paper flex flex-1 flex-col overflow-hidden rounded-xl border-2 border-ink">
        {/* The flavour's ground, with its grid, across the top. */}
        <Link href={href} className="relative block h-[15rem] shrink-0" tabIndex={-1} aria-hidden="true">
          {/* Solid at the top, then colour and grid ease away into the Paper body. */}
          <span
            className={cn(
              'kv-surface kv-fade-down absolute inset-x-0 top-0 h-[15rem]',
              meta.ground,
            )}
          />
        </Link>

        <div className="flex flex-1 flex-col gap-5 px-5 pb-5 text-center sm:px-6 sm:pb-6">
          <div>
            <h3 className="text-[2rem] leading-none">
              <Link href={href} className="hover:underline hover:decoration-2 hover:underline-offset-4">
                {meta.name}
              </Link>
            </h3>
            <p className="mt-3 text-[1rem] leading-snug">{meta.blurb}</p>
          </div>

          <div className="mt-auto flex flex-col gap-4 [&_fieldset>div]:justify-center">
            <ProductVariantSelector
              variants={product.variants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              legend={`Size for ${meta.name}`}
            />

            {selected ? (
              <p className="flex items-baseline justify-center gap-3">
                <span className="tnum font-display text-[2rem] leading-none">{formatMoney(selected.price)}</span>
                {detail && <span className="label">{detail}</span>}
              </p>
            ) : (
              <p className="text-[0.95rem] font-semibold">Not on sale yet.</p>
            )}

            <AddToCartButton product={product} variant={selected} onRequestNotify={onRequestNotify} />
          </div>
        </div>
      </div>
    </article>
  )
}
