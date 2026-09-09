import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchCatalog, type CatalogResult } from '@/services/products'
import { CommerceError, type Product } from '@/types/shopify'
import { CatalogContext, type CatalogState } from './catalogContext'

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogResult | null>(null)
  const [status, setStatus] = useState<CatalogState['status']>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)

    fetchCatalog()
      .then((result) => {
        if (cancelled) return
        setCatalog(result)
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        console.error('[kelvo] Failed to load catalog:', caught)
        setError(
          caught instanceof CommerceError
            ? caught.userMessage
            : "We couldn't load our coffee just now. Please try again.",
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const resolveVariant = useCallback<CatalogState['resolveVariant']>(
    (merchandiseId) => {
      if (!catalog) return null
      const products = [
        ...Object.values(catalog.byFlavour),
        ...(catalog.trialPack ? [catalog.trialPack] : []),
      ] as Product[]
      for (const product of products) {
        const variant = product.variants.find((v) => v.id === merchandiseId)
        if (variant) return { product, variant }
      }
      return null
    },
    [catalog],
  )

  const value = useMemo<CatalogState>(
    () => ({ catalog, status, error, retry, resolveVariant }),
    [catalog, status, error, retry, resolveVariant],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
