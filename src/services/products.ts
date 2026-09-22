import { isShopifyConfigured, productHandles, shopOrder, type FlavourKey } from '@/config/shopify'
import { flavours, previewCatalog } from '@/config/catalog'
import { storefrontFetch } from './storefront'
import { buildProductsByHandleQuery } from './queries'
import type { Product, ProductImage, ProductVariant } from '@/types/shopify'

/** Raw Storefront shapes, kept local so they never leak into the UI. */
interface RawMoney {
  amount: string
  currencyCode: string
}
interface RawVariant {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: Array<{ name: string; value: string }>
  price: RawMoney
  compareAtPrice: RawMoney | null
}
interface RawProduct {
  id: string
  handle: string
  title: string
  description: string
  productType: string | null
  availableForSale: boolean
  images: { nodes: Array<{ url: string; altText: string | null; width: number | null; height: number | null }> }
  variants: { nodes: RawVariant[] }
}

function normaliseMoney(money: RawMoney) {
  return { amount: Number.parseFloat(money.amount), currencyCode: money.currencyCode }
}

function normaliseVariant(variant: RawVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    price: normaliseMoney(variant.price),
    compareAtPrice: variant.compareAtPrice ? normaliseMoney(variant.compareAtPrice) : null,
    availableForSale: variant.availableForSale,
    selectedOptions: Object.fromEntries(variant.selectedOptions.map((o) => [o.name, o.value])),
  }
}

function normaliseProduct(product: RawProduct, fallbackAlt: string): Product {
  const images: ProductImage[] = product.images.nodes.map((image) => ({
    url: image.url,
    altText: image.altText?.trim() || fallbackAlt,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }))

  const variants = product.variants.nodes.map(normaliseVariant)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    productType: product.productType || 'Coffee Concentrate',
    images,
    variants,
    availableForSale: product.availableForSale && variants.some((v) => v.availableForSale),
  }
}

export interface CatalogResult {
  /** Flavour key → product, for every flavour Shopify returned. */
  byFlavour: Partial<Record<FlavourKey, Product>>
  /** Flavours in shop order that actually resolved to a product. */
  order: FlavourKey[]
  trialPack: Product | null
  /** True when the data came from the preview seed rather than Shopify. */
  isPreview: boolean
}

/**
 * Loads the whole storefront catalog in a single request.
 *
 * Falls back to the preview catalog when Storefront credentials are absent so
 * the page is reviewable before Shopify is connected.
 */
export async function fetchCatalog(): Promise<CatalogResult> {
  if (!isShopifyConfigured) {
    return previewResult()
  }

  const entries: Array<{ key: FlavourKey | 'trialPack'; handle: string }> = []
  for (const key of shopOrder) {
    if (productHandles[key]) entries.push({ key, handle: productHandles[key] })
  }
  if (productHandles.trialPack) {
    entries.push({ key: 'trialPack', handle: productHandles.trialPack })
  }

  const query = buildProductsByHandleQuery(entries.map((entry) => entry.handle))
  // One automatic retry: a transient Shopify blip should not put an error
  // screen in front of a shopper who could simply have waited a second.
  const data = await storefrontFetch<Record<string, RawProduct | null>>(query, {}, { retries: 1 })

  const byFlavour: Partial<Record<FlavourKey, Product>> = {}
  let trialPack: Product | null = null

  entries.forEach((entry, index) => {
    const raw = data[`p${index}`]
    if (!raw) {
      // Storefront returns null for products that are draft or unpublished
      // from the Online Store channel. Rather than dropping the flavour, show
      // it as coming soon so the card can still capture interest.
      console.warn(
        `[kelvo] No published Shopify product for handle "${entry.handle}". ` +
          'Rendering it as coming soon.',
      )
      if (entry.key !== 'trialPack') byFlavour[entry.key] = comingSoonProduct(entry.key, entry.handle)
      return
    }
    const product = normaliseProduct(raw, `${raw.title} pouch`)
    if (entry.key === 'trialPack') trialPack = product
    else byFlavour[entry.key] = product
  })

  return {
    byFlavour,
    order: shopOrder.filter((key) => byFlavour[key] !== undefined),
    trialPack,
    isPreview: false,
  }
}

/**
 * Stand-in for a flavour that exists as a concept but is not purchasable on
 * the storefront yet. It carries no variants and no price, so nothing invented
 * ever reaches the UI — the card falls through to the notify-me path.
 */
function comingSoonProduct(key: FlavourKey, handle: string): Product {
  const meta = flavours[key]
  return {
    id: `unpublished://${key}`,
    handle,
    title: `${meta.name} Concentrate`,
    description: meta.blurb,
    productType: 'Coffee Concentrate',
    images: [{ url: meta.image.src, altText: meta.image.alt, width: 1100, height: 821 }],
    variants: [],
    availableForSale: false,
  }
}

function previewResult(): CatalogResult {
  const byFlavour: Partial<Record<FlavourKey, Product>> = {}
  shopOrder.forEach((key) => {
    const product = previewCatalog.find((p) => p.id === `preview://product/${key}`)
    if (product) byFlavour[key] = product
  })
  return {
    byFlavour,
    order: shopOrder.filter((key) => byFlavour[key] !== undefined),
    trialPack: null,
    isPreview: true,
  }
}

/** Picks the variant a card should start on: the first purchasable one. */
export function defaultVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0]
}
