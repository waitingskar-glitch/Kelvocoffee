import { useId, useMemo, useState, type ReactNode } from 'react'
import { flavours } from '@/config/catalog'
import { productHandles, shopOrder, type FlavourKey } from '@/config/shopify'
import { useCatalog } from '@/context/catalogContext'
import { useCart } from '@/context/cartContext'
import { formatAmount, formatMoney, perCup } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ProductVariant } from '@/types/shopify'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'
import { CloseIcon } from './ui/icons'
import { Link } from '@/router'
import { MAX_HAMPERS_PER_ORDER, customerCareHref, hamperCount, isHamperLine } from '@/config/hampers'
import { brand } from '@/config/brand'

type HamperSize = 'duo' | 'four'
type PackMl = 50 | 100

const HAMPERS: Record<HamperSize, { name: string; packs: number }> = {
  duo: { name: 'Duo', packs: 2 },
  four: { name: 'Four', packs: 4 },
}

/** The variant for a pack size, matched on "50 ml" / "100 ml" in its title or options. */
function variantFor(variants: ProductVariant[], ml: PackMl): ProductVariant | undefined {
  const pattern = new RegExp(`(^|\\D)${ml}\\s*ml`, 'i')
  return variants.find((variant) => pattern.test([variant.title, ...Object.values(variant.selectedOptions)].join(' ')))
}

/** "Caramel ×2, Hazelnut, Whiskey": the note that rides on the cart line and lands on the order. */
function describe(picks: FlavourKey[]): string {
  return shopOrder
    .map((key) => ({ key, count: picks.filter((pick) => pick === key).length }))
    .filter(({ count }) => count > 0)
    .map(({ key, count }) => (count > 1 ? `${flavours[key].name} ×${count}` : flavours[key].name))
    .join(', ')
}

/**
 * SECTION 3b — Build a hamper, right after the range.
 *
 * Three numbered steps, in the How to Kelvo style. On the left, under the
 * flat-price promise: 1, the hamper (Duo: two packs, Four: four); 2, the pack
 * size (50 or 100 ml). On the right, which stretches to the full height:
 * 3, a row of flavour tiles (tap to add, repeats welcome, a badge counts
 * each), the box as a row of slots (tap one to take it out), and checkout.
 *
 * Each hamper is one Shopify product at a fixed price whatever goes in, with a
 * 50 ml and a 100 ml variant (handles in config/shopify.ts). The flavours go
 * into the cart as a note on the line ("Flavours: Caramel ×2, Hazelnut"),
 * which shows on the order for packing. Several hampers can go in one order,
 * each built its own way (a hamper added resets the builder for the next, and
 * the ones already in the cart are listed underneath), up to
 * MAX_HAMPERS_PER_ORDER; past that the builder stops and points to a call.
 * The cart enforces the same limit. Until the products exist in Shopify
 * the section stays off the live site; the dev server shows it for review,
 * without a price.
 */
export function HamperBuilder() {
  const { catalog } = useCatalog()
  const { cart, addItem, removeLine, pendingVariantIds, confirmedVariantIds, pendingLineIds } = useCart()
  const [size, setSize] = useState<HamperSize>('duo')
  const [ml, setMl] = useState<PackMl>(50)
  const [picks, setPicks] = useState<FlavourKey[]>([])

  const capacity = HAMPERS[size].packs
  const product = catalog?.hampers[size] ?? null
  const variant = product ? variantFor(product.variants, ml) : undefined
  const purchasable = Boolean(variant?.availableForSale)
  const full = picks.length === capacity
  const pending = variant ? pendingVariantIds.has(variant.id) : false
  const confirmed = variant ? confirmedVariantIds.has(variant.id) : false
  // The note that goes on the cart line: "Caramel ×2, Hazelnut".
  const summary = useMemo(() => describe(picks), [picks])

  // The hampers already built (in the cart), and whether there's room for another.
  // Shopify lists the newest line first; show them in the order they were built.
  const built = (cart?.lines.filter(isHamperLine) ?? []).reverse()
  const hampersBuilt = hamperCount(cart)
  const atLimit = hampersBuilt >= MAX_HAMPERS_PER_ORDER

  const live = Boolean(catalog?.hampers.duo || catalog?.hampers.four)
  if (!live && !import.meta.env.DEV) return null

  const changeSize = (next: HamperSize) => {
    setSize(next)
    // Going from four to two keeps the first two picks.
    setPicks((current) => current.slice(0, HAMPERS[next].packs))
  }
  const addPick = (key: FlavourKey) => setPicks((current) => (current.length < capacity ? [...current, key] : current))
  const removeAt = (index: number) => setPicks((current) => [...current.slice(0, index), ...current.slice(index + 1)])

  const addToCart = async () => {
    if (!variant || !full || atLimit) return
    const added = await addItem(variant.id, 1, [{ key: 'Flavours', value: summary }])
    // Clear the box for the next one; size and pack size stay as they were.
    if (added) setPicks([])
  }

  const remaining = capacity - picks.length
  const cups = capacity * (ml / 10)
  // What the same packs cost bought one by one (every flavour is priced alike), so the saving can be said plainly.
  const single = catalog ? Object.values(catalog.byFlavour).find(Boolean) : undefined
  const singleVariant = single ? variantFor(single.variants, ml) : undefined
  const saving = variant && singleVariant ? singleVariant.price.amount * capacity - variant.price.amount : 0

  return (
    <section id="hampers" aria-labelledby="hamper-heading" className="scroll-mt-24 px-3 pb-16 sm:px-4 sm:pb-20">
      <div className="mx-auto grid max-w-[75rem] overflow-hidden rounded-xl border-2 border-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* --- 1 and 2: the hamper and the pack size, under the promise --- */}
        <div className="kv-surface ground-vanilla flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="text-center">
            <h2 id="hamper-heading" className="text-h2 mx-auto max-w-[12ch]">
              Build a hamper.
            </h2>
            <p className="mx-auto mt-4 max-w-[30ch] text-[1.05rem] leading-relaxed sm:text-[1.1rem]">
              Pick any 2 or 4. Mix your flavours however you like.
            </p>
            {/* The pricing, said plainly. */}
            <p className="mx-auto mt-5 max-w-[26rem] shape-squircle bg-ink px-5 py-3 text-[0.95rem] leading-snug text-paper">
              <strong className="font-display text-[1.1rem] tracking-[0.01em]">Flat price.</strong> Every Duo costs the
              same and every Four costs the same, whichever flavours go in.
            </p>
            {!live && (
              <p className="label mx-auto mt-4 max-w-[30rem] text-ink/60">
                Preview · create {productHandles.duoHamper} and {productHandles.fourHamper} in Shopify to sell
              </p>
            )}
          </div>

          <div className="mx-auto grid w-full max-w-[26rem] gap-6">
            <Choice
              step={1}
              legend="Pick a hamper"
              value={size}
              onChange={(next) => changeSize(next as HamperSize)}
              options={[
                { value: 'duo', label: 'Duo', detail: '2 packs' },
                { value: 'four', label: 'Four', detail: '4 packs' },
              ]}
            />
            <Choice
              step={2}
              legend="Pick a pack size"
              value={String(ml)}
              onChange={(next) => setMl(Number(next) as PackMl)}
              options={[
                { value: '50', label: '50 ml', detail: '5 cups each' },
                { value: '100', label: '100 ml', detail: '10 cups each' },
              ]}
            />
          </div>

          {/* Gifting and bigger orders are handled by hand. */}
          <p className="mx-auto max-w-[26rem] text-center text-[0.95rem] leading-snug">
            Gifting, or stocking up for the office? Call us on{' '}
            <a href={customerCareHref} className="link-underline tnum font-semibold whitespace-nowrap">
              {brand.customerCare}
            </a>{' '}
            for bigger orders.
          </p>
        </div>

        {/* --- 3: the flavours, the box filling up, and checkout. Stretches to the full height. --- */}
        <div className="kv-surface ground-paper flex flex-col justify-between gap-8 border-t-2 border-ink px-5 py-10 [--grid-rule:rgb(27_25_24_/_0.05)] sm:px-10 sm:py-12 lg:border-t-0 lg:border-l-2 lg:px-12">
          <div>
            <div className="flex items-center justify-between gap-3">
              <StepLabel step={3}>Pick {capacity} flavours</StepLabel>
              <span className="flex shrink-0 items-center gap-2">
                {/* Which hamper this is, once there's at least one in the cart. */}
                {hampersBuilt > 0 && !atLimit && (
                  <span className="tnum label hidden shape-squircle bg-ink px-3 py-1 text-paper sm:inline">
                    Hamper {hampersBuilt + 1}
                  </span>
                )}
                <span className="tnum label shape-squircle border-2 border-ink px-3 py-1">
                  {picks.length} / {capacity}
                </span>
              </span>
            </div>

            {/* One tile per flavour; tapping adds one. The badge counts it. */}
            <ul className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
              {shopOrder.map((key) => {
                const meta = flavours[key]
                const count = picks.filter((pick) => pick === key).length
                // The hampers aren't stock-tracked themselves, so a sold-out
                // pack would otherwise go in the box and be ordered. Check the
                // flavour's pack for the size being built, not the flavour as a
                // whole: 50 ml can run out while 100 ml is still on the shelf.
                const flavourProduct = catalog?.byFlavour[key]
                const soldOut = flavourProduct ? !variantFor(flavourProduct.variants, ml)?.availableForSale : false
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => addPick(key)}
                      disabled={full || atLimit || soldOut}
                      aria-label={`${meta.name}${soldOut ? ' (sold out)' : `${count ? ` (${count} in)` : ''}`}`}
                      className={cn(
                        'group relative flex w-full flex-col overflow-hidden shape-squircle border-2 border-ink bg-paper transition-[transform,opacity] duration-200 enabled:hover:-translate-y-1 disabled:cursor-not-allowed',
                        ((full && count === 0) || atLimit || soldOut) && 'opacity-40',
                      )}
                    >
                      {/* The flavour's ground with a fine, faint grid (a smaller square than the panels'). */}
                      <span
                        data-grid-module="20"
                        className={cn(
                          'kv-surface flex aspect-[4/5] items-end justify-center pt-2 [--grid-rule:rgb(27_25_24_/_0.07)]',
                          meta.ground,
                        )}
                      >
                        <img
                          src={meta.pouch.src}
                          srcSet={meta.pouch.srcSet}
                          sizes="6rem"
                          alt=""
                          width={meta.pouch.width}
                          height={meta.pouch.height}
                          loading="lazy"
                          decoding="async"
                          className="h-[88%] w-auto object-contain transition-transform duration-300 group-enabled:group-hover:-translate-y-0.5"
                        />
                      </span>
                      <span className="border-t-2 border-ink py-1.5 font-display text-[0.64rem] leading-none min-[400px]:text-[0.72rem] sm:text-[0.9rem]">
                        {meta.name}
                      </span>
                      {count > 0 && !soldOut && (
                        <span className="tnum kv-hamper-pop absolute top-1 right-1 grid size-6 place-items-center rounded-full border-2 border-paper bg-ink text-[0.75rem] font-bold text-paper sm:size-7">
                          {count}
                        </span>
                      )}
                      {/* Said on the tile as well as dimmed, so it doesn't read as merely disabled. */}
                      {soldOut && (
                        <span
                          aria-hidden="true"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 border-ink bg-paper px-2 py-1 font-display text-[0.58rem] leading-none whitespace-nowrap sm:text-[0.68rem]"
                        >
                          Sold out
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* The box: a slot per pack, filling left to right. Tap one to take it out. */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="label">Your {HAMPERS[size].name}</p>
              {picks.length > 0 && (
                <button type="button" onClick={() => setPicks([])} className="label underline underline-offset-4">
                  Clear
                </button>
              )}
            </div>
            <ul className={cn('mt-3 grid gap-2 sm:gap-3', capacity === 2 ? 'grid-cols-2' : 'grid-cols-4')}>
              {Array.from({ length: capacity }, (_, index) => {
                const key = picks[index]
                const meta = key ? flavours[key] : null
                return (
                  <li key={index} className="h-14 sm:h-16">
                    {meta ? (
                      <button
                        type="button"
                        onClick={() => removeAt(index)}
                        aria-label={`Take out ${meta.name}`}
                        className={cn(
                          'kv-grain kv-hamper-pop group relative flex size-full items-center justify-center shape-squircle border-2 border-ink px-2',
                          meta.ground,
                        )}
                      >
                        <span className="truncate font-display text-[0.8rem] leading-none min-[400px]:text-[0.86rem] sm:text-[1rem]">
                          {meta.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute top-1 right-1.5 hidden text-[0.95rem] leading-none opacity-50 group-hover:opacity-100 sm:block"
                        >
                          ×
                        </span>
                      </button>
                    ) : (
                      <div className="grid size-full place-items-center shape-squircle border-2 border-dashed border-ink/30 font-display text-[1.1rem] text-ink/35">
                        {index + 1}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="label mt-2.5 text-ink/55">Tap a pack to take it out.</p>
          </div>

          {/* Checkout: the price over what you get, and the button. */}
          <div className="flex flex-col items-stretch gap-4 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              {variant ? (
                <p className="tnum font-display text-[2.4rem] leading-none">{formatMoney(variant.price)}</p>
              ) : (
                <p className="font-display text-[1.9rem] leading-none whitespace-nowrap">Price soon</p>
              )}
              <p className="label mt-2 whitespace-nowrap">
                {capacity} × {ml} ml · {cups} cups
                {variant && <> · {perCup(variant.price, cups)}</>}
              </p>
              {saving > 0 && variant && (
                <p className="mt-2 text-[0.92rem] leading-snug font-semibold">
                  {formatAmount(saving, variant.price.currencyCode)} less than {capacity === 2 ? 'two' : 'four'} single packs.
                </p>
              )}
            </div>
            <Button
              size="lg"
              disabled={!full || !purchasable || pending || atLimit}
              onClick={addToCart}
              className="sm:min-w-[15rem]"
            >
              {pending ? (
                <>
                  <Spinner /> Adding
                </>
              ) : confirmed ? (
                'Added to cart ✓'
              ) : atLimit ? (
                `${MAX_HAMPERS_PER_ORDER} hampers is the most`
              ) : !product ? (
                'Coming soon'
              ) : !purchasable ? (
                'Sold out'
              ) : full ? (
                hampersBuilt > 0 ? `Add hamper ${hampersBuilt + 1} to cart` : 'Add hamper to cart'
              ) : (
                `Pick ${remaining} more`
              )}
            </Button>
          </div>

          {/* At the limit: bigger orders are handled by hand. */}
          {atLimit && (
            <div role="status" className="kv-grain ground-vanilla shape-squircle border-2 border-ink px-4 py-3.5 sm:px-5">
              <p className="font-display text-[1.15rem] leading-none">That&rsquo;s {MAX_HAMPERS_PER_ORDER} hampers.</p>
              <p className="mt-2 text-[0.95rem] leading-snug">
                The most one order can hold. Gifting a crowd, or need more? Call us on{' '}
                <a href={customerCareHref} className="link-underline tnum font-semibold">
                  {brand.customerCare}
                </a>{' '}
                and we&rsquo;ll put a bigger order together.
              </p>
            </div>
          )}

          {/* The hampers built so far, each as it went into the cart. */}
          {built.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="label">
                  Your hampers · <span className="tnum">{hampersBuilt} of {MAX_HAMPERS_PER_ORDER}</span>
                </p>
                <Link href="/cart" className="label underline underline-offset-4">
                  Go to cart
                </Link>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {built.map((line, index) => {
                  const flavourNote = line.attributes.find((attribute) => attribute.key === 'Flavours')?.value
                  const kind = line.productHandle === productHandles.fourHamper ? 'Four' : 'Duo'
                  const busy = pendingLineIds.has(line.id)
                  return (
                    <li
                      key={line.id}
                      className={cn(
                        'kv-hamper-pop flex items-center gap-3 shape-squircle border-2 border-ink bg-paper py-2 pr-2 pl-3 transition-opacity',
                        busy && 'opacity-50',
                      )}
                    >
                      <span className="tnum grid size-7 shrink-0 place-items-center rounded-full bg-ink font-display text-[0.85rem] leading-none text-paper">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[1rem] leading-none">
                          {kind} · {line.variantTitle.replace(/\s*packs?$/i, '')}
                          {line.quantity > 1 && <span className="tnum"> × {line.quantity}</span>}
                        </span>
                        {flavourNote && (
                          <span className="mt-1 block truncate text-[0.85rem] leading-snug text-ink/70">{flavourNote}</span>
                        )}
                      </span>
                      <span className="tnum shrink-0 font-semibold">{formatMoney(line.lineTotal)}</span>
                      <button
                        type="button"
                        onClick={() => void removeLine(line.id)}
                        disabled={busy}
                        aria-label={`Remove hamper ${index + 1} (${kind}, ${flavourNote ?? line.variantTitle})`}
                        className="grid size-9 shrink-0 place-items-center shape-squircle transition-colors hover:bg-ink/[0.08] disabled:cursor-not-allowed"
                      >
                        <CloseIcon className="size-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** A numbered step heading, in the How to Kelvo style. */
function StepLabel({ step, children }: { step: number; children: ReactNode }) {
  return (
    <span className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-[1rem] leading-none text-paper">
        {step}
      </span>
      <span className="font-display text-[1.3rem] leading-none sm:text-[1.45rem]">{children}</span>
    </span>
  )
}

/** A step with a pair of pills on real radio inputs (as the size pills on the product cards), side by side at full width. */
function Choice({
  step,
  legend,
  value,
  onChange,
  options,
}: {
  step: number
  legend: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; detail: string }>
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mb-3">
        <StepLabel step={step}>{legend}</StepLabel>
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {options.map((option) => {
          const id = `${name}-${option.value}`
          const selected = option.value === value
          return (
            <div key={option.value}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  'flex min-h-14 cursor-pointer flex-col items-center justify-center shape-squircle border-2 border-ink px-3 py-2 transition-colors',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
                  // Solid on hover (a see-through tint would let the ground and grid show through).
                  selected
                    ? 'bg-ink text-paper'
                    : 'bg-paper hover:bg-[color-mix(in_srgb,var(--color-paper),var(--color-ink)_8%)]',
                )}
              >
                <span className="font-display text-[1.25rem] leading-none">{option.label}</span>
                <span className={cn('mt-1 text-[0.8rem] leading-tight', selected ? 'text-paper/75' : 'text-ink/60')}>
                  {option.detail}
                </span>
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
