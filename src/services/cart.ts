import { isShopifyConfigured } from '@/config/shopify'
import { storefrontFetch, assertNoUserErrors } from './storefront'
import {
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './queries'
import { CommerceError, type Cart, type CartLine } from '@/types/shopify'
import { previewCart, type VariantResolver } from './previewCart'

const CART_ID_KEY = 'kelvo:cart-id'

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

function readCartId(): string | null {
  try {
    return window.localStorage.getItem(CART_ID_KEY)
  } catch {
    return null
  }
}

function writeCartId(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(CART_ID_KEY, id)
    else window.localStorage.removeItem(CART_ID_KEY)
  } catch {
    /* Private browsing — the cart still works for this page view. */
  }
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                       */
/* ------------------------------------------------------------------ */

interface RawCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: { amount: string; currencyCode: string } }
  lines: {
    nodes: Array<{
      id: string
      quantity: number
      cost: {
        totalAmount: { amount: string; currencyCode: string }
        amountPerQuantity: { amount: string; currencyCode: string }
      }
      merchandise: {
        id: string
        title: string
        image: { url: string; altText: string | null; width: number | null; height: number | null } | null
        product: { title: string; handle: string }
      }
    }>
  }
}

function normaliseCart(raw: RawCart): Cart {
  const lines: CartLine[] = raw.lines.nodes.map((node) => ({
    id: node.id,
    quantity: node.quantity,
    merchandiseId: node.merchandise.id,
    variantTitle: node.merchandise.title,
    productTitle: node.merchandise.product.title,
    productHandle: node.merchandise.product.handle,
    image: node.merchandise.image
      ? {
          url: node.merchandise.image.url,
          altText: node.merchandise.image.altText?.trim() || node.merchandise.product.title,
          width: node.merchandise.image.width ?? undefined,
          height: node.merchandise.image.height ?? undefined,
        }
      : null,
    unitPrice: {
      amount: Number.parseFloat(node.cost.amountPerQuantity.amount),
      currencyCode: node.cost.amountPerQuantity.currencyCode,
    },
    lineTotal: {
      amount: Number.parseFloat(node.cost.totalAmount.amount),
      currencyCode: node.cost.totalAmount.currencyCode,
    },
  }))

  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: {
      amount: Number.parseFloat(raw.cost.subtotalAmount.amount),
      currencyCode: raw.cost.subtotalAmount.currencyCode,
    },
    lines,
  }
}

/* ------------------------------------------------------------------ */
/* Shopify-backed operations                                           */
/* ------------------------------------------------------------------ */

const ADD_FAILED = 'Something went wrong while adding this to your cart. Please try again.'
const UPDATE_FAILED = "We couldn't update your cart just now. Please try again."

async function shopifyLoad(): Promise<Cart | null> {
  const cartId = readCartId()
  if (!cartId) return null

  const data = await storefrontFetch<{ cart: RawCart | null }>(CART_QUERY, { id: cartId })
  if (!data.cart) {
    // Shopify expires carts after ~10 days; start fresh rather than erroring.
    writeCartId(null)
    return null
  }
  return normaliseCart(data.cart)
}

async function shopifyAdd(merchandiseId: string, quantity: number): Promise<Cart> {
  const cartId = readCartId()

  if (!cartId) {
    const data = await storefrontFetch<{
      cartCreate: { cart: RawCart | null; userErrors: Array<{ message: string }> }
    }>(CART_CREATE_MUTATION, { lines: [{ merchandiseId, quantity }] })
    assertNoUserErrors(data.cartCreate.userErrors, ADD_FAILED)
    if (!data.cartCreate.cart) throw new CommerceError('api', ADD_FAILED)
    writeCartId(data.cartCreate.cart.id)
    return normaliseCart(data.cartCreate.cart)
  }

  const data = await storefrontFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: Array<{ message: string }> }
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  })

  if (!data.cartLinesAdd.cart) {
    // The stored cart is gone or invalid — retry once with a brand new cart.
    writeCartId(null)
    return shopifyAdd(merchandiseId, quantity)
  }
  assertNoUserErrors(data.cartLinesAdd.userErrors, ADD_FAILED)
  return normaliseCart(data.cartLinesAdd.cart)
}

async function shopifyUpdate(lineId: string, quantity: number): Promise<Cart> {
  const cartId = readCartId()
  if (!cartId) throw new CommerceError('api', UPDATE_FAILED)

  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: Array<{ message: string }> }
  }>(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] })
  assertNoUserErrors(data.cartLinesUpdate.userErrors, UPDATE_FAILED)
  if (!data.cartLinesUpdate.cart) throw new CommerceError('api', UPDATE_FAILED)
  return normaliseCart(data.cartLinesUpdate.cart)
}

async function shopifyRemove(lineId: string): Promise<Cart> {
  const cartId = readCartId()
  if (!cartId) throw new CommerceError('api', UPDATE_FAILED)

  const data = await storefrontFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: Array<{ message: string }> }
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] })
  assertNoUserErrors(data.cartLinesRemove.userErrors, UPDATE_FAILED)
  if (!data.cartLinesRemove.cart) throw new CommerceError('api', UPDATE_FAILED)
  return normaliseCart(data.cartLinesRemove.cart)
}

/* ------------------------------------------------------------------ */
/* Public surface                                                      */
/* ------------------------------------------------------------------ */

export interface CartService {
  /** True when checkout can hand off to Shopify. */
  readonly canCheckout: boolean
  load(): Promise<Cart | null>
  add(merchandiseId: string, quantity: number): Promise<Cart>
  update(lineId: string, quantity: number): Promise<Cart>
  remove(lineId: string): Promise<Cart>
}

/**
 * Returns the Shopify cart when credentials exist, otherwise a browser-local
 * preview cart so the interface can be exercised before the store is wired up.
 */
export function createCartService(resolveVariant: VariantResolver): CartService {
  if (isShopifyConfigured) {
    return {
      canCheckout: true,
      load: shopifyLoad,
      add: shopifyAdd,
      update: shopifyUpdate,
      remove: shopifyRemove,
    }
  }
  return previewCart(resolveVariant)
}
