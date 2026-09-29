import { site } from '@/config/site'
import type { CartLine, Money, Product, ProductVariant } from '@/types/shopify'

/**
 * Meta (Facebook) Pixel, for measuring and targeting ads.
 *
 * Loads Meta's script and sends the standard events: a PageView on the first
 * load and on every route change (the site is one page app, so Meta's own
 * snippet would only ever see the first), ViewContent on a product page and
 * AddToCart when something lands in the cart. It is the same pixel as
 * Shopify's checkout, so a visit reads as one journey. Checkout, payment and
 * purchase happen on Shopify's checkout, which reports them itself through
 * Shopify's Meta connection, so they are deliberately not sent from here
 * (sending InitiateCheckout too would count every checkout twice).
 *
 * Only runs on the live domain, so local and preview runs never pollute the
 * ad data. The ID can be overridden with VITE_META_PIXEL_ID.
 */

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() || '3666555496838317'

type Fbq = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[]
  push: Fbq
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

const liveHost = new URL(site.url).hostname
const enabled =
  typeof window !== 'undefined' && import.meta.env.PROD && window.location.hostname.replace(/^www\./, '') === liveHost

let lastPath: string | null = null

/** Meta's loader, as in its snippet: queues calls until fbevents.js arrives. */
export function installMetaPixel(): void {
  if (!enabled || window.fbq) return
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  } as Fbq
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  window.fbq = fbq
  if (!window._fbq) window._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  fbq('init', PIXEL_ID)
  fbq('track', 'PageView')
  lastPath = window.location.pathname
}

function track(event: string, data?: Record<string, unknown>): void {
  if (!enabled || !window.fbq) return
  window.fbq('track', event, data)
}

/** Shopify's global IDs (gid://shopify/ProductVariant/123) as Meta content IDs ("123"). */
const contentId = (gid: string) => gid.split('/').pop() ?? gid

const money = (price: Money) => ({ value: Number(price.amount.toFixed(2)), currency: price.currencyCode })

/** A route change. The first page's view is sent when the pixel loads. */
export function trackPageView(path: string): void {
  if (!enabled || path === lastPath) return
  lastPath = path
  track('PageView')
}

export function trackViewContent(product: Product, variant: ProductVariant | undefined): void {
  if (!variant) return
  track('ViewContent', {
    content_ids: [contentId(variant.id)],
    content_type: 'product',
    content_name: product.title,
    ...money(variant.price),
  })
}

export function trackAddToCart(line: CartLine, quantity: number): void {
  track('AddToCart', {
    content_ids: [contentId(line.merchandiseId)],
    content_type: 'product',
    content_name: line.productTitle,
    contents: [{ id: contentId(line.merchandiseId), quantity }],
    ...money({ amount: line.unitPrice.amount * quantity, currencyCode: line.unitPrice.currencyCode }),
  })
}
