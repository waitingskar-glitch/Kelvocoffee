/**
 * Normalised commerce types.
 *
 * Everything the UI renders is shaped like this, whether it came from the
 * Shopify Storefront API or from the local seed catalog. Components never see
 * raw Storefront API payloads.
 */

export interface Money {
  amount: number
  currencyCode: string
}

export interface ProductImage {
  url: string
  altText: string
  width?: number
  height?: number
}

export interface ProductVariant {
  id: string
  title: string
  price: Money
  compareAtPrice?: Money | null
  availableForSale: boolean
  /**
   * Purchasable, but nothing is in stock — Shopify's "continue selling when
   * out of stock" state. This is what makes a line a preorder rather than a
   * normal sale, and it must always be disclosed to the shopper.
   */
  isPreorder: boolean
  /** e.g. { Quantity: "50 ml - 5 servings" } */
  selectedOptions: Record<string, string>
}

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  productType: string
  images: ProductImage[]
  variants: ProductVariant[]
  /** False when every variant is sold out or the product is unpublished. */
  availableForSale: boolean
}

export interface CartLine {
  id: string
  quantity: number
  merchandiseId: string
  variantTitle: string
  productTitle: string
  productHandle: string
  image: ProductImage | null
  unitPrice: Money
  lineTotal: Money
  /** True when this line was added as a disclosed preorder. */
  isPreorder: boolean
}

export interface Cart {
  id: string
  checkoutUrl: string | null
  totalQuantity: number
  subtotal: Money
  lines: CartLine[]
}

/** Thrown for anything that goes wrong talking to commerce. */
export class CommerceError extends Error {
  readonly kind: 'network' | 'api' | 'unavailable' | 'config'
  /** Safe to render to a shopper. Never contains raw API text. */
  readonly userMessage: string

  constructor(kind: CommerceError['kind'], userMessage: string, technical?: string) {
    super(technical ?? userMessage)
    this.name = 'CommerceError'
    this.kind = kind
    this.userMessage = userMessage
  }
}
