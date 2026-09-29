import { brand } from './brand'
import { productHandles } from './shopify'
import type { Cart, CartLine } from '@/types/shopify'

/**
 * Hampers per order. Each one is built on its own (Duo or Four, 50 or 100 ml,
 * any flavours) and goes into the cart as its own line, its flavours noted on
 * it for packing; identical hampers simply stack. Past this many, people get
 * in touch instead (gifting and bulk orders are handled by hand).
 */
export const MAX_HAMPERS_PER_ORDER = 5

export function isHamperHandle(handle: string | undefined): boolean {
  return handle === productHandles.duoHamper || handle === productHandles.fourHamper
}

export function isHamperLine(line: CartLine): boolean {
  return isHamperHandle(line.productHandle)
}

/** Hampers in the cart, counting each copy of a stacked hamper. */
export function hamperCount(cart: Cart | null): number {
  return cart?.lines.filter(isHamperLine).reduce((sum, line) => sum + line.quantity, 0) ?? 0
}

export const hamperLimitMessage = `An order can hold up to ${MAX_HAMPERS_PER_ORDER} hampers. For more, call us on ${brand.customerCare} and we'll put it together for you.`

/** The customer care number as a tel: link. */
export const customerCareHref = `tel:${brand.customerCare.replace(/\s+/g, '')}`
