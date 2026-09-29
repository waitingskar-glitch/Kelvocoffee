import { useEffect } from 'react'
import { useCart } from '@/context/cartContext'
import { useCatalog } from '@/context/catalogContext'
import { site } from '@/config/site'
import { flavours, metaForHandle } from '@/config/catalog'
import { shopOrder } from '@/config/shopify'
import { DELIVERY_CHARGE, FREE_DELIVERY_FROM } from '@/config/delivery'
import { MAX_HAMPERS_PER_ORDER, customerCareHref, hamperCount, isHamperLine } from '@/config/hampers'
import { brand } from '@/config/brand'
import { formatMoney } from '@/lib/format'
import { shopifyImage, shopifySrcSet } from '@/lib/image'
import { cn } from '@/lib/cn'
import { useSectionNav } from '@/hooks/useSectionNav'
import { QuantitySelector } from '@/components/QuantitySelector'
import { shortVariantLabel, variantDetail } from '@/components/ProductVariantSelector'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, CheckIcon, CloseIcon, DripIcon } from '@/components/ui/icons'
import { Link } from '@/router'
import type { CartLine } from '@/types/shopify'

/**
 * Cart at /cart — a page rather than a drawer, so it survives a refresh,
 * can be linked to, and has room to show what is actually being bought.
 */
export function CartPage() {
  const { cart, isHydrated, pendingLineIds, error, dismissError, canCheckout, updateLine, removeLine, checkout } =
    useCart()
  const { catalog } = useCatalog()

  const scrollTo = useSectionNav()
  const lines = cart?.lines ?? []
  const isEmpty = isHydrated && lines.length === 0
  const itemCount = cart?.totalQuantity ?? 0
  const hampersLive = Boolean(catalog?.hampers.duo || catalog?.hampers.four)
  // Hampers cap at MAX_HAMPERS_PER_ORDER per order: how many more fit.
  const hamperRoom = Math.max(0, MAX_HAMPERS_PER_ORDER - hamperCount(cart))

  // Free delivery in India at or above the threshold; below it, what's left to go.
  const subtotal = cart?.subtotal.amount ?? 0
  const currencyCode = cart?.subtotal.currencyCode ?? 'INR'
  const free = subtotal >= FREE_DELIVERY_FROM
  const delivery = {
    free,
    charge: { amount: free ? 0 : DELIVERY_CHARGE, currencyCode },
    shortfall: { amount: Math.max(0, FREE_DELIVERY_FROM - subtotal), currencyCode },
    progress: Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100),
  }
  // The total within India, delivery included (Shopify's checkout charges the same).
  const total = { amount: subtotal + delivery.charge.amount, currencyCode }

  useEffect(() => {
    document.title = `Your cart | ${site.legalName}`
    return () => {
      document.title = site.defaultTitle
    }
  }, [])

  return (
    <main id="main" className="pt-[calc(var(--spacing-header)+1rem)]">
      {error && (
        <div className="container-page pt-6">
          <div
            role="alert"
            className="kv-grain ground-whiskey flex items-start justify-between gap-3 rounded-lg border-2 border-ink px-5 py-4 text-[1rem] font-semibold"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={dismissError}
              aria-label="Dismiss"
              className="-mt-1 -mr-2 grid size-9 shrink-0 place-items-center shape-squircle hover:bg-ink/10"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- Empty: one centred, branded panel, and a way straight back in --- */}
      {isEmpty && (
        <section aria-labelledby="cart-title" className="px-3 pt-6 pb-20 sm:px-4 sm:pt-10">
          <div className="kv-surface ground-vanilla mx-auto flex max-w-[56rem] flex-col items-center rounded-xl border-2 border-ink px-6 py-12 text-center sm:px-12 sm:py-16">
            {/* The three pouches, fanned, as in the hero. */}
            <div aria-hidden="true" className="relative h-36 w-52 sm:h-44 sm:w-64">
              {(
                [
                  { key: 'classic', x: -44, rotate: -10, scale: 0.84, z: 1 },
                  { key: 'whiskey', x: 44, rotate: 10, scale: 0.84, z: 2 },
                  { key: 'caramel', x: 0, rotate: 0, scale: 1, z: 3 },
                ] as const
              ).map(({ key, x, rotate, scale, z }) => (
                <img
                  key={key}
                  src={flavours[key].pouch.src.replace('-full.', '-320.')}
                  alt=""
                  width={flavours[key].pouch.width}
                  height={flavours[key].pouch.height}
                  className="absolute bottom-0 left-1/2 h-full w-auto drop-shadow-[0_6px_10px_rgb(150_100_30_/_0.18)]"
                  style={{
                    transform: `translateX(calc(-50% + ${x}%)) rotate(${rotate}deg) scale(${scale})`,
                    transformOrigin: '50% 100%',
                    zIndex: z,
                  }}
                />
              ))}
            </div>

            <p className="label mt-8">Your cart</p>
            <h1 id="cart-title" className="text-h2 mt-3 max-w-[14ch]">
              Nothing in here. Yet.
            </h1>
            <p className="mt-4 max-w-[34ch] text-[1.08rem] leading-snug font-medium">
              Pick a flavour and it lands here. Can&rsquo;t pick? Build a hamper of two or four.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => scrollTo('#shop')}>
                Shop the flavours
              </Button>
              {hampersLive && (
                <Button size="lg" variant="secondary" className="bg-paper" onClick={() => scrollTo('#hampers')}>
                  Build a hamper
                </Button>
              )}
            </div>

            {/* Or start from a flavour. */}
            <ul className="mt-10 grid w-full max-w-[30rem] grid-cols-5 gap-2 sm:gap-3">
              {shopOrder.map((key) => {
                const product = catalog?.byFlavour[key]
                return (
                  <li key={key}>
                    <Link
                      href={`/products/${product?.handle ?? ''}`}
                      className="group flex flex-col overflow-hidden shape-squircle border-2 border-ink bg-paper transition-transform duration-200 hover:-translate-y-1"
                    >
                      <span
                        className={cn('kv-grain flex aspect-[4/5] items-end justify-center pt-2', flavours[key].ground)}
                      >
                        <img
                          src={flavours[key].pouch.src.replace('-full.', '-320.')}
                          alt=""
                          width={flavours[key].pouch.width}
                          height={flavours[key].pouch.height}
                          loading="lazy"
                          decoding="async"
                          className="h-[86%] w-auto object-contain"
                        />
                      </span>
                      <span className="border-t-2 border-ink py-1.5 font-display text-[0.66rem] leading-none min-[400px]:text-[0.74rem] sm:text-[0.9rem]">
                        {flavours[key].name}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* --- Something in it (or still loading) --- */}
      {!isEmpty && (
        <>
          <div className="container-page flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-8 pb-8 sm:pt-12">
            <div>
              <p className="label">Your cart</p>
              <h1 className="text-h2 mt-3">Good picks.</h1>
            </div>
            {isHydrated && (
              <p className="label pb-1">
                {itemCount} item{itemCount === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div className="container-page grid gap-8 pb-20 lg:grid-cols-[1fr_24rem] lg:gap-10">
            <div>
              {!isHydrated && (
                <ul className="flex flex-col gap-3" aria-hidden="true">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <li key={index} className="flex gap-5 rounded-xl border-2 border-ink/20 p-4">
                      <div className="size-24 shrink-0 animate-pulse shape-squircle bg-ink/10 sm:size-28" />
                      <div className="flex flex-1 flex-col gap-3 py-1">
                        <div className="h-5 w-2/3 animate-pulse rounded-xs bg-ink/10" />
                        <div className="h-4 w-1/3 animate-pulse rounded-xs bg-ink/10" />
                        <div className="mt-auto h-10 w-28 animate-pulse shape-squircle bg-ink/10" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {lines.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {lines.map((line) => (
                    <CartLineRow
                      key={line.id}
                      line={line}
                      max={isHamperLine(line) ? line.quantity + hamperRoom : undefined}
                      busy={pendingLineIds.has(line.id)}
                      onUpdate={updateLine}
                      onRemove={removeLine}
                    />
                  ))}
                </ul>
              )}

              {/* At the hamper limit: bigger orders are handled by hand. */}
              {hampersLive && hamperRoom === 0 && (
                <p role="status" className="kv-grain ground-vanilla mt-3 shape-squircle border-2 border-ink px-4 py-3.5 text-[0.95rem] leading-snug sm:px-5">
                  <strong className="font-display text-[1.05rem] font-normal">{MAX_HAMPERS_PER_ORDER} hampers</strong> is the
                  most one order can hold. Need more? Call us on{' '}
                  <a href={customerCareHref} className="link-underline tnum font-semibold">
                    {brand.customerCare}
                  </a>{' '}
                  and we&rsquo;ll put it together.
                </p>
              )}

              {lines.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollTo('#shop')}
                  className="group mt-6 inline-flex items-center gap-2 text-[1rem] font-semibold"
                >
                  <ArrowRightIcon className="size-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
                  Keep shopping
                </button>
              )}
            </div>

            {/* --- Summary --- */}
            {lines.length > 0 && cart && (
              <aside
                aria-label="Order summary"
                className="flex h-fit flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]"
              >
                <div className="kv-surface ground-paper rounded-xl border-2 border-ink p-6 [--grid-rule:rgb(27_25_24_/_0.05)] sm:p-7">
                  <h2 className="font-display text-[1.7rem] leading-none">Summary.</h2>

                  <dl className="mt-6 flex flex-col gap-3 text-[1rem]">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-ink/70">
                        Subtotal · {itemCount} item{itemCount === 1 ? '' : 's'}
                      </dt>
                      <dd className="tnum font-semibold">{formatMoney(cart.subtotal)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-ink/70">Delivery in India</dt>
                      <dd className="tnum font-semibold">{delivery.free ? 'Free' : formatMoney(delivery.charge)}</dd>
                    </div>
                  </dl>

                  {/* How far from free delivery: a nudge and a bar below the threshold, a tick once past it. */}
                  <div role="status" className="mt-5">
                    {delivery.free ? (
                      <p className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-paper">
                          <CheckIcon className="size-3.5" />
                        </span>
                        You&rsquo;ve got free delivery in India.
                      </p>
                    ) : (
                      <div className="kv-grain ground-vanilla rounded-lg border-2 border-ink px-4 py-3.5">
                        <p className="text-[0.98rem] leading-snug">
                          Add <strong className="tnum">{formatMoney(delivery.shortfall)}</strong> more for{' '}
                          <strong>free delivery</strong> in India.
                        </p>
                        <div
                          aria-hidden="true"
                          className="mt-2.5 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-paper"
                        >
                          <div
                            className="h-full rounded-full bg-ink transition-[width] duration-500 ease-[var(--ease-out-soft)]"
                            style={{ width: `${delivery.progress}%` }}
                          />
                        </div>
                        <p className="mt-2.5 text-[0.85rem] leading-snug text-ink/70">
                          Orders under ₹{FREE_DELIVERY_FROM} carry a flat ₹{DELIVERY_CHARGE} delivery charge within India.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4 border-t-2 border-ink pt-5">
                    <span className="font-display text-[1.3rem] leading-none">Total</span>
                    <span className="text-right">
                      <span className="tnum block font-display text-[2.2rem] leading-none">{formatMoney(total)}</span>
                    </span>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    className="group mt-6"
                    onClick={checkout}
                    disabled={!canCheckout || !cart.checkoutUrl}
                  >
                    Checkout
                    <ArrowRightIcon className="size-4 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1" />
                  </Button>
                  <p className="mt-3 text-center text-[0.85rem] text-ink/60">
                    {canCheckout
                      ? 'Secure checkout by Shopify. Delivery outside India is added there.'
                      : 'Checkout opens once the store is connected.'}
                  </p>
                </div>

                {/* A quiet nudge towards the hampers (while there's room for one). */}
                {hampersLive && hamperRoom > 0 && (
                  <button
                    type="button"
                    onClick={() => scrollTo('#hampers')}
                    className="kv-surface ground-vanilla group flex items-center justify-between gap-4 rounded-xl border-2 border-ink px-5 py-4 text-left"
                  >
                    <span>
                      <span className="block font-display text-[1.15rem] leading-none">Mix a hamper</span>
                      <span className="mt-1.5 block text-[0.9rem] leading-snug">
                        Two or four packs, any flavours, one flat price.
                      </span>
                    </span>
                    <ArrowRightIcon className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                )}
              </aside>
            )}
          </div>
        </>
      )}
    </main>
  )
}

function CartLineRow({
  line,
  max,
  busy,
  onUpdate,
  onRemove,
}: {
  line: CartLine
  /** The most this line can go to (hampers are capped per order). */
  max?: number
  busy: boolean
  onUpdate: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}) {
  const meta = metaForHandle(line.productHandle)
  // A hamper has no photo of its own: show the pouches of the flavours in it (up to three), fanned.
  const hamperFlavours = meta
    ? []
    : shopOrder.filter((key) =>
        line.attributes.some(
          (attribute) => attribute.key === 'Flavours' && attribute.value.includes(flavours[key].name),
        ),
      )
  const name = meta?.name ?? line.productTitle
  const itemLabel = `${name}, ${shortVariantLabel(line.variantTitle)}`
  const cups = variantDetail(line.variantTitle)

  return (
    <li
      className={cn(
        'kv-grain ground-paper flex gap-4 rounded-xl border-2 border-ink p-3 transition-opacity sm:gap-5 sm:p-4',
        busy && 'opacity-70',
      )}
    >
      {/* The picture: the pouch on its flavour's ground (a hamper fans the pouches in it). */}
      <span
        aria-hidden="true"
        className={cn(
          'kv-grain relative flex size-24 shrink-0 items-end justify-center overflow-hidden shape-squircle border-2 border-ink sm:size-28',
          meta ? meta.ground : hamperFlavours.length > 0 ? flavours[hamperFlavours[0]].ground : 'ground-ink',
        )}
      >
        {meta ? (
          <img
            src={meta.pouch.src.replace('-full.', '-320.')}
            alt=""
            width={meta.pouch.width}
            height={meta.pouch.height}
            loading="lazy"
            decoding="async"
            className="h-[86%] w-auto object-contain drop-shadow-[0_4px_6px_rgb(27_25_24_/_0.2)]"
          />
        ) : hamperFlavours.length > 0 ? (
          hamperFlavours.slice(0, 3).map((key, index, shown) => (
            <img
              key={key}
              src={flavours[key].pouch.src.replace('-full.', '-320.')}
              alt=""
              width={flavours[key].pouch.width}
              height={flavours[key].pouch.height}
              loading="lazy"
              decoding="async"
              className="absolute bottom-1 h-[82%] w-auto object-contain drop-shadow-[0_3px_5px_rgb(27_25_24_/_0.25)]"
              style={{
                transform: `translateX(${(index - (shown.length - 1) / 2) * 30}%) rotate(${(index - (shown.length - 1) / 2) * 8}deg)`,
                zIndex: index === Math.floor(shown.length / 2) ? 3 : 1,
              }}
            />
          ))
        ) : line.image ? (
          <img
            src={shopifyImage(line.image.url, 256)}
            srcSet={shopifySrcSet(line.image.url, [128, 256, 384])}
            sizes="128px"
            alt=""
            width={128}
            height={128}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <DripIcon className="m-auto size-8 text-paper" />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-[1.5rem] leading-none sm:text-[1.6rem]">
              {/* Flavours link to their page; a hamper has no page of its own. */}
              {meta ? (
                <Link
                  href={`/products/${line.productHandle}`}
                  className="hover:underline hover:decoration-2 hover:underline-offset-4"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </h3>
            <p className="label mt-2">
              {shortVariantLabel(line.variantTitle)}
              {cups ? ` · ${cups}` : ''} · <span className="tnum">{formatMoney(line.unitPrice)}</span> each
            </p>
            {/* Notes on the line, e.g. a hamper's flavours. */}
            {line.attributes
              .filter((attribute) => !attribute.key.startsWith('_'))
              .map((attribute) => (
                <p key={attribute.key} className="mt-1.5 text-[0.95rem] leading-snug font-medium">
                  <span className="text-ink/60">{attribute.key}:</span> {attribute.value}
                </p>
              ))}
          </div>
          <span className="tnum shrink-0 font-display text-[1.5rem] leading-none">{formatMoney(line.lineTotal)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantitySelector
            quantity={line.quantity}
            max={max}
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
            aria-label={`Remove ${itemLabel}`}
            className="link-underline min-h-11 text-[0.92rem] font-semibold disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
