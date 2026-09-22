import type { FlavourKey } from './shopify'
import type { Product } from '@/types/shopify'

/**
 * Presentation metadata for each flavour.
 *
 * This is *design* data only — accent colours, tasting notes, image paths.
 * Commercial data (title, description, price, availability, variants) always
 * comes from Shopify. Nothing priced lives in this file.
 */
export interface FlavourMeta {
  key: FlavourKey
  /** Short display name used in cards, filters and cart. */
  name: string
  /** Two or three words describing the cup. */
  note: string
  /** One line of card copy, in brand voice. */
  blurb: string
  accent: string
  image: {
    src: string
    srcSet: string
    alt: string
  }
}

function imageFor(slug: string, alt: string) {
  return {
    src: `/assets/products/${slug}-1100.webp`,
    srcSet: `/assets/products/${slug}-640.webp 640w, /assets/products/${slug}-1100.webp 1100w`,
    alt,
  }
}

export const flavours: Record<FlavourKey, FlavourMeta> = {
  classic: {
    key: 'classic',
    name: 'Classic',
    note: 'Rich · Full-bodied',
    blurb: 'The one you already love. Colombian Huila beans, naturally processed, nothing else added.',
    accent: 'var(--color-flavour-classic)',
    image: imageFor('classic', 'Kelvo Classic coffee concentrate pouch on a dark stone counter'),
  },
  vanilla: {
    key: 'vanilla',
    name: 'Vanilla',
    note: 'Soft · Fragrant',
    blurb: 'Madagascan Bourbon vanilla. Aromatic rather than sugary — the quiet one in the lineup.',
    accent: 'var(--color-flavour-vanilla)',
    image: imageFor('vanilla', 'Kelvo Vanilla coffee concentrate pouch on a dark stone counter'),
  },
  hazelnut: {
    key: 'hazelnut',
    name: 'Hazelnut',
    note: 'Nutty · Toasted',
    blurb: 'Slow-roasted hazelnut that behaves beautifully with milk. Our most-requested pour.',
    accent: 'var(--color-flavour-hazelnut)',
    image: imageFor('hazelnut', 'Kelvo Hazelnut coffee concentrate pouch on a dark stone counter'),
  },
  caramel: {
    key: 'caramel',
    name: 'Caramel',
    note: 'Buttery · Deep',
    blurb: 'Slow-caramelised and dessert-like, without tipping into syrup territory.',
    accent: 'var(--color-flavour-caramel)',
    image: imageFor('caramel', 'Kelvo Caramel coffee concentrate pouch on a dark stone counter'),
  },
  whiskey: {
    key: 'whiskey',
    name: 'Whiskey',
    note: 'Cask-aged · Alcohol-free',
    blurb: 'Barrel-fermented for deep, cask-aged character. All of the edge, none of the alcohol.',
    accent: 'var(--color-flavour-whiskey)',
    image: imageFor('whiskey', 'Kelvo Whiskey coffee concentrate pouch on a dark stone counter'),
  },
}

/**
 * Preview-mode catalog.
 *
 * Used only when Storefront credentials are absent, so the page can be
 * reviewed end to end. Mirrors the live Shopify catalog; the moment
 * `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` is set, this is ignored entirely and
 * every field below comes from Shopify instead.
 */
const PREVIEW_CURRENCY = 'INR'

function previewVariants(handleSeed: string, available: boolean) {
  return [
    {
      id: `preview://variant/${handleSeed}/50ml`,
      title: '50 ml - 5 servings',
      price: { amount: 150, currencyCode: PREVIEW_CURRENCY },
      compareAtPrice: null,
      availableForSale: available,
      selectedOptions: { Quantity: '50 ml - 5 servings' },
    },
    {
      id: `preview://variant/${handleSeed}/100ml`,
      title: '100 ml - 10 servings',
      price: { amount: 220, currencyCode: PREVIEW_CURRENCY },
      compareAtPrice: null,
      availableForSale: available,
      selectedOptions: { Quantity: '100 ml - 10 servings' },
    },
  ]
}

interface PreviewSeed {
  handle: string
  title: string
  description: string
  /** Whiskey is still a draft product in Shopify, so it is not purchasable. */
  available: boolean
  flavour: FlavourKey
}

const previewSeeds: PreviewSeed[] = [
  {
    flavour: 'classic',
    handle: 'classic-coffee-concentrate',
    title: 'Classic Coffee Concentrate',
    description:
      "Rich, full-bodied, and unmistakably coffee. No flavours, no distractions — just naturally processed beans from Colombian Huila.",
    available: true,
  },
  {
    flavour: 'vanilla',
    handle: 'vanilla-coffee-concentrate',
    title: 'Vanilla Coffee Concentrate',
    description:
      'Made with natural Madagascan Bourbon vanilla — soft and fragrant rather than sugary-sweet.',
    available: true,
  },
  {
    flavour: 'hazelnut',
    handle: 'hazelnut-coffee-concentrate',
    title: 'Hazelnut Coffee Concentrate',
    description:
      'Slow-roasted to bring out toasted hazelnut notes that pair beautifully with milk-based drinks.',
    available: true,
  },
  {
    flavour: 'caramel',
    handle: 'caramel-coffee-concentrate',
    title: 'Caramel Coffee Concentrate',
    description:
      'Our signature brew layered with deep, buttery caramel. Caramelised slow for a smooth finish.',
    available: true,
  },
  {
    flavour: 'whiskey',
    handle: 'whiskey-coffee-concentrate',
    title: 'Whiskey Coffee Concentrate',
    description:
      'Barrel-fermented to develop deep, cask-aged notes reminiscent of your favourite spirit — completely alcohol-free.',
    available: false,
  },
]

export const previewCatalog: Product[] = previewSeeds.map((seed) => ({
  id: `preview://product/${seed.flavour}`,
  handle: seed.handle,
  title: seed.title,
  description: seed.description,
  productType: 'Coffee Concentrate',
  availableForSale: seed.available,
  images: [
    {
      url: flavours[seed.flavour].image.src,
      altText: flavours[seed.flavour].image.alt,
      width: 1100,
      height: 821,
    },
  ],
  variants: previewVariants(seed.flavour, seed.available),
}))
