import { useCart } from '@/context/cartContext'
import { formatMoney } from '@/lib/format'
import { Overlay } from './ui/Overlay'
import { Button } from './ui/Button'
import { QuantitySelector } from './QuantitySelector'
import { ArrowRightIcon, DripIcon } from './ui/icons'
import { shortVariantLabel } from './ProductVariantSelector'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import type { CartLine } from '@/types/shopify'

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    isHydrated,
    pendingLineIds,
    error,
    dismissError,
    canCheckout,
    updateLine,
    removeLine,
    checkout,
  } = useCart()

  const lines = cart?.lines ?? []
  const isEmpty = isHydrated && lines.length === 0

  return (
    <Overlay
      open={isOpen}
      onClose={closeCart}
      labelledById="cart-heading"
      /* Bottom sheet on mobile, right-hand drawer from `sm` up. */
      panelClassName="animate-slide-up sm:animate-slide-right inset-x-0 bottom-0 top-[10vh] flex w-full flex-col border-l border-[var(--rule)] bg-cream sm:inset-y-0 sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-[27rem] lg:w-[30rem]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] px-5 py-5 sm:px-6">
        <h2 id="cart-heading" className="label text-espresso">
          Your coffee cart
        </h2>
        <button
          type="button"
          onClick={closeCart}
          className="label -mr-1 rounded-xs py-1 text-espresso transition-opacity hover:opacity-60"
        >
          Close
        </button>
      </div>

      {/* Body */}
      <div className="scroll-quiet flex-1 overflow-y-auto px-5 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start justify-between gap-3 rounded-sm border border-[#c0704f]/40 bg-[#fbeee6] px-4 py-3 text-[0.85rem] text-[#7d3a1c]"
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
          <ul className="space-y-4 py-6" aria-hidden="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <li key={index} className="flex gap-4">
                <div className="size-20 shrink-0 animate-pulse bg-sand" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <div className="h-4 w-2/3 animate-pulse bg-sand" />
                  <div className="h-3 w-1/3 animate-pulse bg-sand" />
                  <div className="mt-auto h-8 w-24 animate-pulse bg-sand" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {isEmpty && <EmptyCart onClose={closeCart} />}

        {lines.length > 0 && (
          <ul className="divide-y divide-[var(--rule)]">
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
      </div>

      {/* Footer */}
      {lines.length > 0 && cart && (
        <div className="border-t border-[var(--rule)] bg-cream px-5 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label text-muted">Subtotal</span>
            <span className="index-mark font-display text-[1.6rem] leading-none text-espresso">
              {formatMoney(cart.subtotal)}
            </span>
          </div>
          <p className="mt-1.5 text-[0.76rem] text-muted">
            Shipping and taxes are calculated at checkout.
          </p>


          <Button
            fullWidth
            size="lg"
            className="group mt-4"
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
        </div>
      )}
    </Overlay>
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
    <li className="flex gap-4 py-5">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden bg-espresso sm:size-22">
        {line.image ? (
          <img
            src={shopifyImage(line.image.url, 176)}
            srcSet={shopifySrcSet(line.image.url, [88, 176, 264])}
            sizes="88px"
            alt={line.image.altText}
            width={88}
            height={88}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          /* Products without photography still get a branded tile rather than
             an empty square. */
          <DripIcon className="size-7 text-caramel-soft" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-medium text-espresso">
              {line.productTitle}
            </h3>
            <p className="mt-0.5 text-[0.78rem] text-muted">{line.variantTitle}</p>
          </div>
          <span className="tnum shrink-0 text-[0.95rem] font-medium text-espresso">
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

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span
        className="grid size-14 place-items-center border border-dashed border-[var(--rule)] text-muted"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.4}>
          <path d="M4.5 7.5h15l-1.2 10.2a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L4.5 7.5Z" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="font-display text-[1.2rem] text-espresso">Nothing in here yet</p>
        <p className="mx-auto mt-1.5 max-w-[26ch] text-[0.87rem] text-muted">
          Pick a flavour and it will show up right here.
        </p>
      </div>
      <Button variant="secondary" onClick={onClose}>
        Browse the flavours
      </Button>
    </div>
  )
}
