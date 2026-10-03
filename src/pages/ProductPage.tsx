import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Money, Product } from '@/types/shopify'
import { flavours, type FlavourMeta } from '@/config/catalog'
import { shopOrder } from '@/config/shopify'
import { brand, ingredientsFor, kcalPer100ml } from '@/config/brand'
import { site } from '@/config/site'
import { faqsForProduct } from '@/config/faq'
import { FaqSection } from '@/components/FaqSection'
import { defaultVariant, listProducts } from '@/services/products'
import { useCatalog } from '@/context/catalogContext'
import { cupsIn, formatMoney, perCup } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useSectionNav } from '@/hooks/useSectionNav'
import { Link } from '@/router'
import { AddToCartButton } from '@/components/AddToCartButton'
import { OfferNote } from '@/components/OfferNote'
import { ProductVariantSelector, variantDetail } from '@/components/ProductVariantSelector'
import { NotifyMeModal, type NotifyTarget } from '@/components/NotifyMeModal'
import { ArrowRightIcon } from '@/components/ui/icons'
import { trackViewContent } from '@/lib/metaPixel'
import { FREE_DELIVERY_FROM } from '@/config/delivery'

/** Line drawings for Pour, Mix and Enjoy, in ritual order. */
const RITUAL_ART = ['pour', 'mix', 'enjoy'] as const

/**
 * Product detail page at /products/:handle.
 *
 * Everything commercial (title, price, variants, availability) comes from
 * Shopify. The flavour meta supplies the ground, the pack render and the card
 * copy; the pack facts come from the brand book via config/brand.
 */
export function ProductPage({ product, meta }: { product: Product; meta: FlavourMeta }) {
  const { catalog } = useCatalog()
  const [selectedId, setSelectedId] = useState(() => defaultVariant(product)?.id ?? '')
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null)
  const scrollTo = useSectionNav()

  const selected = product.variants.find((v) => v.id === selectedId) ?? product.variants[0]
  const detail = selected ? variantDetail(selected.title) : null
  const cupPrice = selected ? perCup(selected.price, cupsIn(selected.title)) : null
  const displayName = meta.name
  const schemaImage = `${site.url}${meta.image.src}`

  // Reset the size choice when routing straight from one product to another,
  // and tell Meta which product is being looked at.
  useEffect(() => {
    setSelectedId(defaultVariant(product)?.id ?? '')
    trackViewContent(product, defaultVariant(product))
  }, [product])

  useEffect(() => {
    document.title = `${meta.name} coffee concentrate | ${site.legalName}`

    const tag = document.querySelector('meta[name="description"]')
    const previousDescription = tag?.getAttribute('content') ?? ''
    tag?.setAttribute('content', meta.blurb.slice(0, 155))

    const schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: schemaImage ? [schemaImage] : [],
      brand: { '@type': 'Brand', name: site.legalName },
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        name: variant.title,
        price: variant.price.amount,
        priceCurrency: variant.price.currencyCode,
        availability: variant.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${site.url}/products/${product.handle}`,
      })),
    })
    document.head.appendChild(schema)

    return () => {
      document.title = site.defaultTitle
      tag?.setAttribute('content', previousDescription)
      schema.remove()
    }
  }, [product, meta, schemaImage])

  const others = catalog ? listProducts(catalog).filter((item) => item.product.handle !== product.handle) : []
  const productFaqs = useMemo(() => faqsForProduct(meta.key), [meta])
  // The hamper card: its lowest price (a Duo of 50 ml packs).
  const hamperFrom = catalog?.hampers.duo?.variants.reduce<Money | null>(
    (lowest, variant) => (!lowest || variant.price.amount < lowest.amount ? variant.price : lowest),
    null,
  )
  // This flavour and the next two, for the card's little fan of pouches.
  const hamperTrio = [0, 1, 2].map((step) => shopOrder[(shopOrder.indexOf(meta.key) + step) % shopOrder.length])

  return (
    <main id="main" className="pt-[calc(var(--spacing-header)+1rem)]">
      <div className="container-page py-5">
        <button
          type="button"
          onClick={() => scrollTo('#shop')}
          className="label inline-flex min-h-11 items-center gap-2 rounded-pill transition-transform hover:-translate-x-1"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          All flavours
        </button>
      </div>

      {/* --- The photographs, and the buy --- */}
      <section className="px-3 sm:px-4" aria-labelledby="pdp-title">
        {/* Photo beside the buy from tablet width up; stacked on phones. */}
        <div className="mx-auto grid max-w-[75rem] overflow-hidden rounded-xl border-2 border-ink md:grid-cols-2">
          <PhotoGallery key={meta.key} meta={meta} />

          {/* The graph grid, as on every panel, ruled at under half strength so it never competes with the type. */}
          <div className="kv-surface ground-paper flex flex-col justify-center border-t-2 border-ink px-6 py-10 [--grid-rule:rgb(27_25_24_/_0.05)] sm:px-10 sm:py-12 md:border-t-0 md:border-l-2 md:px-8 lg:px-14">
            <p className="label">{meta.note}</p>

            <h1 id="pdp-title" className="mt-4 text-display">
              {displayName}
            </h1>

            <p className="mt-5 max-w-[34ch] text-[1.15rem] leading-snug font-medium">{meta.blurb}</p>
            {/* A serving suggestion, so the flavour comes with an occasion. */}
            <p className="mt-3 text-[1rem] leading-snug">
              <span className="label mr-2">Best with</span>
              {meta.bestWith}
            </p>

            <div className="mt-8 flex flex-col gap-5">
              <ProductVariantSelector
                variants={product.variants}
                selectedId={selectedId}
                onSelect={setSelectedId}
                legend={`Size for ${displayName}`}
              />

              {selected ? (
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="tnum font-display text-[3rem] leading-none">{formatMoney(selected.price)}</span>
                    {detail && (
                      <span className="label">
                        {detail}
                        {cupPrice && <> · {cupPrice}</>}
                      </span>
                    )}
                  </p>
                  {/* The dated code, said where the price is read and the buy decision is made. */}
                  <OfferNote />
                </div>
              ) : (
                <p className="text-[1rem] font-semibold">Not on sale yet. Join the list and you&rsquo;ll hear first.</p>
              )}

              <div className="sm:max-w-xs">
                <AddToCartButton
                  product={product}
                  variant={selected}
                  size="lg"
                  onRequestNotify={(p, v) =>
                    setNotifyTarget({ product: p, variant: v, title: p.title, handle: p.handle, intent: 'restock' })
                  }
                />
              </div>

              <ul className="mt-2 flex flex-wrap gap-2">
                {[brand.cupRatio, 'Hot or cold', `Free delivery from ₹${FREE_DELIVERY_FROM}`].map((fact) => (
                  <li key={fact} className="label rounded-pill border-2 border-ink px-3 py-1.5">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- What's in it --- */}
      <section aria-labelledby="pdp-facts" className="container-page py-16 sm:py-20">
        <div className="mx-auto flex max-w-[60rem] flex-col gap-10">
          <h2 id="pdp-facts" className="text-h2 text-center">
            What&rsquo;s in it.
          </h2>

          <dl className="grid gap-4 sm:grid-cols-2">
            <Fact term="Ingredients" wide>
              {ingredientsFor(meta.key, meta.name)}
            </Fact>
            <Fact term="Coffee to chicory">80% coffee. 20% chicory.</Fact>
            <Fact term="Energy">
              <span className="tnum">{kcalPer100ml[meta.key]}</span> kcal per 100 ml
            </Fact>
            <Fact term="Storage">{brand.storage}</Fact>
            <Fact term="Shelf life">{brand.shelfLife}</Fact>
          </dl>
        </div>
      </section>

      {/* --- How to Kelvo --- */}
      <section aria-labelledby="pdp-how" className="px-3 sm:px-4">
        <div className="kv-surface ground-classic mx-auto max-w-[75rem] rounded-xl px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
          <h2 id="pdp-how" className="text-h2 text-center">
            How to Kelvo.
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {brand.ritual.map((step, index) => (
              <li
                key={step.step}
                className="kv-grain ground-paper flex flex-col items-center rounded-lg border-2 border-ink p-6 text-center"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full bg-ink font-display text-[1.2rem] text-paper"
                >
                  {index + 1}
                </span>
                <img
                  src={`/assets/ritual/${RITUAL_ART[index]}-480.webp`}
                  srcSet={`/assets/ritual/${RITUAL_ART[index]}-480.webp 480w, /assets/ritual/${RITUAL_ART[index]}.webp 800w`}
                  sizes="(min-width: 640px) 16rem, 70vw"
                  alt=""
                  aria-hidden="true"
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto mt-2 aspect-square w-full max-w-[13rem] object-contain"
                />
                <h3 className="mt-5 font-display text-[1.9rem] leading-none">{step.step}</h3>
                <p className="mt-2 text-[1.05rem] leading-snug font-medium">{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- The questions that matter for this product, from the home page's list. --- */}
      <FaqSection id="pdp-faq" items={productFaqs} />

      {/* --- The rest of the range --- */}
      {others.length > 0 && (
        <section aria-labelledby="pdp-others" className="container-page py-16 sm:py-20">
          <h2 id="pdp-others" className="text-h2 text-center">
            The rest of the range.
          </h2>
          {/* A centred, wrapping row at the old five-up card size, so the four
              other flavours sit in the middle (and a lone last card centres too). */}
          <ul className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            {others.map(({ product: other, meta: otherMeta }) => {
              const price = defaultVariant(other)?.price
              return (
                <li
                  key={other.handle}
                  className="w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]"
                >
                  <Link
                    href={`/products/${other.handle}`}
                    className="group kv-grain ground-paper block h-full overflow-hidden rounded-lg border-2 border-ink"
                  >
                    <div className="relative aspect-square overflow-hidden bg-ink/10">
                      <img
                        src={otherMeta.image.src}
                        srcSet={otherMeta.image.srcSet}
                        sizes="(min-width: 1024px) 16rem, 45vw"
                        alt=""
                        width={otherMeta.image.width}
                        height={otherMeta.image.height}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="border-t-2 border-ink px-4 py-4 text-center">
                      <span className="block font-display text-[1.3rem] leading-none">{otherMeta.name}</span>
                      {price && <span className="tnum label mt-2 block">from {formatMoney(price)}</span>}
                    </div>
                  </Link>
                </li>
              )
            })}

            {/* And the hamper builder on the home page, with this flavour at the front. */}
            {hamperFrom && (
              <li className="w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)]">
                <button
                  type="button"
                  onClick={() => scrollTo('#hampers')}
                  className="group kv-grain ground-paper block h-full w-full overflow-hidden rounded-lg border-2 border-ink text-left"
                >
                  {/* A little fan of pouches, this flavour in front, as in the hero; they spread on hover. */}
                  <div className="kv-surface ground-vanilla relative aspect-square overflow-hidden">
                    <span className="label absolute top-2.5 left-2.5 z-10 shape-squircle bg-ink px-2 py-1 text-[0.68rem] text-paper">
                      Any 2 or 4
                    </span>
                    {[
                      { key: hamperTrio[1], x: -34, rotate: -10, scale: 0.8, z: 1 },
                      { key: hamperTrio[2], x: 34, rotate: 10, scale: 0.8, z: 2 },
                      { key: meta.key, x: 0, rotate: 0, scale: 1, z: 3 },
                    ].map(({ key, x, rotate, scale, z }) => (
                      <img
                        key={key}
                        src={flavours[key].pouch.src.replace('-full.', '-320.')}
                        alt=""
                        width={flavours[key].pouch.width}
                        height={flavours[key].pouch.height}
                        loading="lazy"
                        decoding="async"
                        className="absolute bottom-[8%] left-1/2 h-[74%] w-auto drop-shadow-[0_6px_10px_rgb(150_100_30_/_0.18)] transition-transform duration-500 ease-[var(--ease-out-soft)] [transform:translateX(calc(-50%+var(--x)*1%))_rotate(var(--r))_scale(var(--s))] group-hover:[transform:translateX(calc(-50%+var(--x)*1.35%))_rotate(calc(var(--r)*1.4))_scale(var(--s))]"
                        style={
                          {
                            '--x': x,
                            '--r': `${rotate}deg`,
                            '--s': scale,
                            zIndex: z,
                            transformOrigin: '50% 100%',
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <div className="border-t-2 border-ink px-4 py-4 text-center">
                    <span className="block font-display text-[1.3rem] leading-none">Build a hamper</span>
                    <span className="tnum label mt-2 block">from {formatMoney(hamperFrom)}</span>
                  </div>
                </button>
              </li>
            )}
          </ul>
        </section>
      )}

      <NotifyMeModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
    </main>
  )
}

function Fact({ term, wide, children }: { term: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn('kv-grain ground-paper rounded-lg border-2 border-ink p-5 text-center', wide && 'sm:col-span-2')}
    >
      <dt className="label">{term}</dt>
      <dd className="mt-2 text-[1.05rem] leading-snug font-medium">{children}</dd>
    </div>
  )
}

/** Front and back of the pouch, with thumbnails to switch. */
function PhotoGallery({ meta }: { meta: FlavourMeta }) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const shots = { front: meta.image, back: meta.back } as const

  return (
    // Tall 3:4 on phones; on a wider single column the height is capped (the
    // photo crops a little top and bottom) so it never towers over the page;
    // beside the buy from tablet width, it fills its column.
    <div className="relative aspect-[3/4] overflow-hidden bg-ink/10 sm:max-md:aspect-auto sm:max-md:h-[min(72svh,38rem)] md:aspect-auto md:min-h-[34rem] lg:min-h-[40rem]">
      {(['front', 'back'] as const).map((key) => (
        <img
          key={key}
          src={shots[key].src}
          srcSet={shots[key].srcSet}
          sizes="(min-width: 1024px) 44rem, (min-width: 768px) 50vw, 100vw"
          alt={shots[key].alt}
          width={shots[key].width}
          height={shots[key].height}
          fetchPriority={key === 'front' ? 'high' : undefined}
          loading={key === 'front' ? 'eager' : 'lazy'}
          aria-hidden={key !== side}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-500 ease-[var(--ease-out-soft)]',
            key === side ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      {/*
        The pouch starts ~27% in from the left of every photo, so the pair is
        sized off the photo's width to always finish before it:
        two thumbs of 12.5% - 9px each, plus the gap and inset, stay under 25%.
      */}
      <div className="absolute inset-x-3 bottom-3 flex items-end gap-1.5" role="group" aria-label="Choose a photo">
        {(['front', 'back'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSide(key)}
            aria-pressed={key === side}
            aria-label={key === 'front' ? 'Front of the pouch' : 'Back of the pouch'}
            className={cn(
              'aspect-square w-[min(4rem,calc(12.5%-9px))] shrink-0 overflow-hidden rounded-sm border-2 transition-[scale,border-color,opacity] duration-300 ease-[var(--ease-out-soft)]',
              // Shrink toward the other thumbnail so the pair stays together.
              key === 'front' ? 'origin-bottom-right' : 'origin-bottom-left',
              key !== side && 'scale-75 border-transparent opacity-50 hover:opacity-100',
            )}
            // The chosen photo is ringed in the pouch's own colour, not Ink.
            style={key === side ? { borderColor: meta.accent } : undefined}
          >
            <img
              src={shots[key].src.replace('-800.', '-480.')}
              alt=""
              width={shots[key].width}
              height={shots[key].height}
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
