import { CommerceError, type Cart, type CartLine, type Product, type ProductVariant } from '@/types/shopify'
import type { CartService } from './cart'

const PREVIEW_CART_KEY = 'kelvo:preview-cart'

export type VariantResolver = (
  merchandiseId: string,
) => { product: Product; variant: ProductVariant } | null

interface StoredLine {
  merchandiseId: string
  quantity: number
}

/**
 * Browser-local cart used only in preview mode (no Storefront credentials).
 *
 * It exists so the cart drawer, quantity controls and empty/loading states can
 * be reviewed before Shopify is connected. It deliberately cannot check out:
 * payments always belong to Shopify.
 */
export function previewCart(resolveVariant: VariantResolver): CartService {
  function read(): StoredLine[] {
    try {
      const raw = window.localStorage.getItem(PREVIEW_CART_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (line): line is StoredLine =>
          typeof line === 'object' &&
          line !== null &&
          typeof (line as StoredLine).merchandiseId === 'string' &&
          typeof (line as StoredLine).quantity === 'number',
      )
    } catch {
      return []
    }
  }

  function write(lines: StoredLine[]): void {
    try {
      window.localStorage.setItem(PREVIEW_CART_KEY, JSON.stringify(lines))
    } catch {
      /* Ignore quota / private-mode failures. */
    }
  }

  function build(stored: StoredLine[]): Cart {
    const lines: CartLine[] = []
    let currencyCode = 'INR'

    for (const stored_ of stored) {
      const resolved = resolveVariant(stored_.merchandiseId)
      if (!resolved) continue
      const { product, variant } = resolved
      currencyCode = variant.price.currencyCode
      lines.push({
        id: `preview-line:${stored_.merchandiseId}`,
        quantity: stored_.quantity,
        merchandiseId: stored_.merchandiseId,
        variantTitle: variant.title,
        productTitle: product.title,
        productHandle: product.handle,
        image: product.images[0] ?? null,
        unitPrice: variant.price,
        lineTotal: {
          amount: variant.price.amount * stored_.quantity,
          currencyCode: variant.price.currencyCode,
        },
      })
    }

    return {
      id: 'preview-cart',
      checkoutUrl: null,
      totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
      subtotal: {
        amount: lines.reduce((total, line) => total + line.lineTotal.amount, 0),
        currencyCode,
      },
      lines,
    }
  }

  function lineIdToMerchandiseId(lineId: string): string {
    return lineId.replace(/^preview-line:/, '')
  }

  return {
    canCheckout: false,

    async load() {
      const stored = read()
      return stored.length ? build(stored) : null
    },

    async add(merchandiseId, quantity) {
      if (!resolveVariant(merchandiseId)) {
        throw new CommerceError('unavailable', 'That option is not available right now.')
      }
      const stored = read()
      const existing = stored.find((line) => line.merchandiseId === merchandiseId)
      if (existing) existing.quantity += quantity
      else stored.push({ merchandiseId, quantity })
      write(stored)
      return build(stored)
    },

    async update(lineId, quantity) {
      const merchandiseId = lineIdToMerchandiseId(lineId)
      let stored = read()
      if (quantity <= 0) {
        stored = stored.filter((line) => line.merchandiseId !== merchandiseId)
      } else {
        const existing = stored.find((line) => line.merchandiseId === merchandiseId)
        if (existing) existing.quantity = quantity
      }
      write(stored)
      return build(stored)
    },

    async remove(lineId) {
      const merchandiseId = lineIdToMerchandiseId(lineId)
      const stored = read().filter((line) => line.merchandiseId !== merchandiseId)
      write(stored)
      return build(stored)
    },
  }
}
