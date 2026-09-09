import { createContext, useContext } from 'react'
import type { CatalogResult } from '@/services/products'
import type { Product, ProductVariant } from '@/types/shopify'

export interface CatalogState {
  catalog: CatalogResult | null
  status: 'loading' | 'ready' | 'error'
  error: string | null
  retry: () => void
  /** Looks up a variant (and its product) by Shopify variant id. */
  resolveVariant: (merchandiseId: string) => { product: Product; variant: ProductVariant } | null
}

export const CatalogContext = createContext<CatalogState | null>(null)

export function useCatalog(): CatalogState {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return context
}
