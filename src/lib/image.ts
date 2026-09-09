/**
 * Shopify CDN image helpers.
 *
 * Shopify serves product images at their full upload size unless a width is
 * requested. It already negotiates WebP on its own, but asking for the size
 * actually needed roughly halves the bytes again and lets the browser pick
 * sensibly from a srcset.
 *
 * Non-Shopify URLs (the local placeholder assets) pass through untouched.
 */

const SHOPIFY_CDN = 'cdn.shopify.com'

function isShopifyUrl(url: string): boolean {
  return url.includes(SHOPIFY_CDN)
}

export function shopifyImage(url: string, width: number): string {
  if (!isShopifyUrl(url)) return url
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('width', String(width))
    return parsed.toString()
  } catch {
    return url
  }
}

export function shopifySrcSet(url: string, widths: number[]): string | undefined {
  if (!isShopifyUrl(url)) return undefined
  return widths.map((width) => `${shopifyImage(url, width)} ${width}w`).join(', ')
}
