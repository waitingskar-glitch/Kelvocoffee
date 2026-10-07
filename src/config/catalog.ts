import { productHandles, shopOrder, type FlavourKey } from './shopify'
import type { Product } from '@/types/shopify'

/**
 * Presentation metadata for each flavour: the ground it owns, the pack
 * render, and a line of card copy in brand voice.
 *
 * Commercial data (title, description, price, availability, variants) always
 * comes from Shopify. Nothing priced lives in this file.
 *
 * Voice rules apply here too: lead with the flavour, never the origin; never
 * "natural", "small-batch", "artisanal" or tasting notes.
 */
export interface FlavourMeta {
  key: FlavourKey
  name: string
  /** A couple of words about the cup. */
  note: string
  /** One line of card copy. Three beats, then stop. */
  blurb: string
  /** How it's best made: a serving suggestion, never a tasting note. */
  bestWith: string
  /** CSS class that sets this flavour's ground on a .kv-surface / .kv-grain. */
  ground: string
  /** The ground as a colour, for the odd inline swatch. */
  accent: string
  /** Studio photograph of the front of the pouch. */
  image: ProductPhoto
  /** The back panel: ritual, ingredients, nutrition. */
  back: ProductPhoto
  /** The front of the pouch cut out (no background), for layouts that stand it on a ground. */
  pouch: ProductPhoto
}

export interface ProductPhoto {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
}

/** Studio photographs, 3:4, from "Product Images (1)". Widths match the files. */
const PHOTO_WIDTHS = [480, 800, 1086] as const

function photo(key: FlavourKey, side: 'front' | 'back', name: string): ProductPhoto {
  const path = (w: number) => `/assets/products/${key}-${side}-${w}.webp`
  return {
    src: path(800),
    srcSet: PHOTO_WIDTHS.map((w) => `${path(w)} ${w}w`).join(', '),
    width: 1086,
    height: 1448,
    alt:
      side === 'front'
        ? `Kelvo ${name} flavoured coffee concentrate pouch, front`
        : `Back of the Kelvo ${name} pouch: how to Kelvo, ingredients and nutrition`,
  }
}

/** Background-free pouch fronts, from "Product Images (1)/1-No BG". */
const POUCH_SIZES: Record<FlavourKey, [number, number]> = {
  classic: [490, 926],
  vanilla: [493, 929],
  hazelnut: [481, 913],
  caramel: [490, 926],
  whiskey: [493, 930],
}

function pouch(key: FlavourKey, name: string): ProductPhoto {
  const [w, h] = POUCH_SIZES[key]
  return {
    src: `/assets/pouches/${key}-full.webp`,
    srcSet: `/assets/pouches/${key}-320.webp 320w, /assets/pouches/${key}-full.webp ${w}w`,
    width: w,
    height: h,
    alt: `Kelvo ${name} flavoured coffee concentrate pouch`,
  }
}

export const flavours: Record<FlavourKey, FlavourMeta> = {
  classic: {
    key: 'classic',
    name: 'Classic',
    note: 'Just coffee',
    blurb: 'Just good old filter coffee. Simple, strong and familiar.',
    bestWith: 'Hot milk, first thing.',
    ground: 'ground-classic',
    accent: 'var(--color-classic)',
    image: photo('classic', 'front', 'Classic'),
    back: photo('classic', 'back', 'Classic'),
    pouch: pouch('classic', 'Classic'),
  },
  vanilla: {
    key: 'vanilla',
    name: 'Vanilla',
    note: 'Soft and sweet',
    blurb: 'Smooth, sweet and easy to drink. A little vanilla makes it extra nice.',
    bestWith: 'Cold milk over ice.',
    ground: 'ground-vanilla',
    accent: 'var(--color-vanilla)',
    image: photo('vanilla', 'front', 'Vanilla'),
    back: photo('vanilla', 'back', 'Vanilla'),
    pouch: pouch('vanilla', 'Vanilla'),
  },
  hazelnut: {
    key: 'hazelnut',
    name: 'Hazelnut',
    note: 'Nutty and warm',
    blurb: 'Nutty, slightly sweet and really good with milk.',
    bestWith: 'Hot milk on a slow afternoon.',
    ground: 'ground-hazelnut',
    accent: 'var(--color-hazelnut)',
    image: photo('hazelnut', 'front', 'Hazelnut'),
    back: photo('hazelnut', 'back', 'Hazelnut'),
    pouch: pouch('hazelnut', 'Hazelnut'),
  },
  caramel: {
    key: 'caramel',
    name: 'Caramel',
    note: 'Buttery',
    blurb: 'Sweet, buttery and a little dessert-like. Coffee that feels like a treat.',
    bestWith: 'Iced, or hot with extra milk.',
    ground: 'ground-caramel',
    accent: 'var(--color-caramel)',
    image: photo('caramel', 'front', 'Caramel'),
    back: photo('caramel', 'back', 'Caramel'),
    pouch: pouch('caramel', 'Caramel'),
  },
  whiskey: {
    key: 'whiskey',
    name: 'Whiskey',
    note: 'Oaky. Zero alcohol',
    blurb: 'Rich and smoky with that whiskey-like taste. No alcohol, though.',
    bestWith: 'Hot milk, after dinner.',
    ground: 'ground-whiskey',
    accent: 'var(--color-whiskey)',
    image: photo('whiskey', 'front', 'Whiskey'),
    back: photo('whiskey', 'back', 'Whiskey'),
    pouch: pouch('whiskey', 'Whiskey'),
  },
}

/** Flavour metadata for a Shopify handle, e.g. for a cart line. Null for anything that isn't a flavour (a hamper). */
export function metaForHandle(handle: string): FlavourMeta | null {
  const key = shopOrder.find((k) => productHandles[k] === handle)
  return key ? flavours[key] : null
}

/* ------------------------------------------------------------------ */
/* Preview catalog — only used when Storefront credentials are absent. */
/* ------------------------------------------------------------------ */

const PREVIEW_CURRENCY = 'INR'

function previewVariants(handleSeed: string, available: boolean) {
  return [
    {
      id: `preview://variant/${handleSeed}/50ml`,
      title: '50 ml - 5 servings',
      price: { amount: 250, currencyCode: PREVIEW_CURRENCY },
      compareAtPrice: null,
      availableForSale: available,
      selectedOptions: { Quantity: '50 ml - 5 servings' },
    },
    {
      id: `preview://variant/${handleSeed}/100ml`,
      title: '100 ml - 10 servings',
      price: { amount: 350, currencyCode: PREVIEW_CURRENCY },
      compareAtPrice: null,
      availableForSale: available,
      selectedOptions: { Quantity: '100 ml - 10 servings' },
    },
  ]
}

const previewSeeds: Array<{ flavour: FlavourKey; handle: string; title: string; available: boolean }> = [
  { flavour: 'classic', handle: 'classic-coffee-concentrate', title: 'Classic Coffee Concentrate', available: true },
  { flavour: 'vanilla', handle: 'vanilla-coffee-concentrate', title: 'Vanilla Coffee Concentrate', available: true },
  { flavour: 'hazelnut', handle: 'hazelnut-coffee-concentrate', title: 'Hazelnut Coffee Concentrate', available: true },
  { flavour: 'caramel', handle: 'caramel-coffee-concentrate', title: 'Caramel Coffee Concentrate', available: true },
  { flavour: 'whiskey', handle: 'whiskey-coffee-concentrate', title: 'Whiskey Coffee Concentrate', available: true },
]

export const previewCatalog: Product[] = previewSeeds.map((seed) => {
  const meta = flavours[seed.flavour]
  return {
    id: `preview://product/${seed.flavour}`,
    handle: seed.handle,
    title: seed.title,
    description: meta.blurb,
    descriptionHtml: `<p>${meta.blurb}</p>`,
    productType: 'Coffee Concentrate',
    availableForSale: seed.available,
    images: [{ url: meta.image.src, altText: meta.image.alt, width: meta.image.width, height: meta.image.height }],
    variants: previewVariants(seed.flavour, seed.available),
  }
})
