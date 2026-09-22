import { createContext, useContext } from 'react'
import type { Cart } from '@/types/shopify'

export interface CartState {
  cart: Cart | null
  /** Ready once the persisted cart has been restored (or found to be absent). */
  isHydrated: boolean
  /** Variant ids currently being added. */
  pendingVariantIds: ReadonlySet<string>
  /** Variant ids that were just added, for the "Added ✓" confirmation. */
  confirmedVariantIds: ReadonlySet<string>
  /** Cart line ids currently updating. */
  pendingLineIds: ReadonlySet<string>
  error: string | null
  dismissError: () => void
  canCheckout: boolean
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>
  updateLine: (lineId: string, quantity: number) => Promise<void>
  removeLine: (lineId: string) => Promise<void>
  checkout: () => void
  totalQuantity: number
  /** Announcement text for the live region. */
  announcement: string
}

export const CartContext = createContext<CartState | null>(null)

export function useCart(): CartState {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}
