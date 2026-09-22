import { useEffect } from 'react'
import { useCart } from '@/context/cartContext'
import { site } from '@/config/site'
import { formatMoney } from '@/lib/format'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import { useSectionNav } from '@/hooks/useSectionNav'
import { QuantitySelector } from '@/components/QuantitySelector'
import { shortVariantLabel } from '@/components/ProductVariantSelector'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, DripIcon } from '@/components/ui/icons'
import { Link } from '@/router'
import type { CartLine } from '@/types/shopify'

/**
 * Cart at /cart — a page rather than a drawer, so it survives a refresh,
 * can be linked to, and has room to show what is actually being bought.
 */
export function CartPage() {
  const {
    cart,
    isHydrated,
    pendingLineIds,
    error,
    dismissError,
    canCheckout,
    updateLine,
    removeLine,
    checkout,
  } = useCart()

  const scrollTo = useSectionNav()
  const lines = cart?.lines ?? []
  const isEmpty = isHydrated && lines.length === 0

  useEffect(() => {
    const previous = document.title
    document.title = `Your cart — ${site.legalName}`
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main id="main" className="pt-[var(--spacing-header)]">
      <div className="container-page py-10 sm:py-14">
        <p className="label text-caramel">Your coffee cart</p>
        <h1 className="mt-5 text-display-sm text-espresso">
          {isEmpty ? 'Nothing in here yet.' : 'Ready when you are.'}
        </h1>
      </div>

      <div className="border-t border-[var(--rule)]">
        <div className="container-page grid gap-12 py-10 sm:py-12 lg:grid-cols-[1fr_21rem] lg:gap-16">
          <div>
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start justify-between gap-3 rounded-sm border border-[#c0704f]/40 bg-[#fbeee6] px-4 py-3 text-[0.85rem] text-[#7d3a1c]"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={dismissError}
                  className="-mr-1 shrink-0 rounded-xs px-1 underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!isHydrated && (
              <ul className="divide-y divide-[var(--rule)]" aria-hidden="true">
                {Array.from({ length: 2 }).map((_, index) => (
                  <li key={index} className="flex gap-5 py-6">
                    <div className="size-24 shrink-0 animate-pulse bg-sand sm:size-28" />
                    <div className="flex flex-1 flex-col gap-3 py-1">
                      <div className="h-4 w-2/3 animate-pulse bg-sand" />
                      <div className="h-3 w-1/3 animate-pulse bg-sand" />
                      <div className="mt-auto h-10 w-28 animate-pulse bg-sand" />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isEmpty && (
              <div className="flex flex-col items-start gap-5 border-t border-[var(--rule)] py-12">
                <span
                  className="grid size-14 place-items-center border border-dashed border-[var(--rule)] text-muted"
                  aria-hidden="true"
                >
                  <DripIcon className="size-6" />
                </span>
                <p className="max-w-[34ch] text-[0.95rem] leading-relaxed text-muted">
                  Pick a flavour and it will show up here. The Trial Pack is the easiest place to
                  start if you can&rsquo;t choose.
                </p>
                <Button onClick={() => scrollTo('#shop')}>Browse the flavours</Button>
              </div>
            )}

            {lines.length > 0 && (
              <ul className="divide-y divide-[var(--rule)] border-t border-[var(--rule)]">
                {lines.map((line) => (
                  <CartLineRow
                    key={line.id}
                    line={line}
                    busy={pendingLineIds.has(line.id)}
                    onUpdate={updateLine}
                    onRemove={removeLine}
                  />
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <button
                type="button"
                onClick={() => scrollTo('#shop')}
                className="link-underline label mt-8 text-muted transition-colors hover:text-espresso"
              >
                Keep shopping
              </button>
            )}
          </div>

          {/* --- Summary --- */}
          {lines.length > 0 && cart && (
            <aside
              aria-label="Order summary"
              className="h-fit border-t border-[var(--rule)] pt-6 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]"
            >
              <h2 className="label text-caramel">Summary</h2>

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <span className="label text-muted">Subtotal</span>
                <span className="index-mark font-display text-[1.75rem] leading-none text-espresso">
                  {formatMoney(cart.subtotal)}
                </span>
              </div>

              <Button
                fullWidth
                size="lg"
                className="group mt-7"
                onClick={checkout}
                disabled={!canCheckout || !cart.checkoutUrl}
              >
                Checkout
                <ArrowRightIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
              </Button>

              {!canCheckout && (
                <p className="mt-3 text-center text-[0.76rem] text-muted">
                  Checkout opens once the store is connected.
                </p>
              )}
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}

function CartLineRow({
  line,
  busy,
  onUpdate,
  onRemove,
}: {
  line: CartLine
  busy: boolean
  onUpdate: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}) {
  const itemLabel = `${line.productTitle}, ${shortVariantLabel(line.variantTitle)}`

  return (
    <li className="flex gap-5 py-6">
      <Link
        href={`/products/${line.productHandle}`}
        className="grid size-24 shrink-0 place-items-center overflow-hidden bg-espresso sm:size-28"
      >
        {line.image ? (
          <img
            src={shopifyImage(line.image.url, 224)}
            srcSet={shopifySrcSet(line.image.url, [112, 224, 336])}
            sizes="112px"
            alt={line.image.altText}
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <DripIcon className="size-8 text-caramel-soft" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[1rem] font-medium text-espresso">
              <Link
                href={`/products/${line.productHandle}`}
                className="transition-opacity hover:opacity-60"
              >
                {line.productTitle}
              </Link>
            </h3>
            <p className="mt-1 text-[0.8rem] text-muted">{line.variantTitle}</p>
            <p className="index-mark mt-1 text-[0.78rem] text-muted">
              {formatMoney(line.unitPrice)} each
            </p>
          </div>
          <span className="index-mark shrink-0 text-[1rem] font-medium text-espresso">
            {formatMoney(line.lineTotal)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantitySelector
            quantity={line.quantity}
            busy={busy}
            itemLabel={itemLabel}
            onChange={(quantity) => {
              if (quantity <= 0) onRemove(line.id)
              else onUpdate(line.id, quantity)
            }}
          />
          <button
            type="button"
            onClick={() => onRemove(line.id)}
            disabled={busy}
            className="link-underline rounded-xs text-[0.76rem] text-muted transition-opacity hover:opacity-60 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
