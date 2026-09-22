import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createCartService } from '@/services/cart'
import { useCatalog } from './catalogContext'
import { CommerceError, type Cart } from '@/types/shopify'
import { CartContext, type CartState } from './cartContext'

const CONFIRMATION_MS = 1800

export function CartProvider({ children }: { children: ReactNode }) {
  const { resolveVariant, status: catalogStatus } = useCatalog()

  // The resolver changes identity when the catalog loads; keep the live one in
  // a ref so the service is created once and never goes stale.
  const resolverRef = useRef(resolveVariant)
  resolverRef.current = resolveVariant

  const service = useMemo(
    () => createCartService((merchandiseId) => resolverRef.current(merchandiseId)),
    [],
  )

  const [cart, setCart] = useState<Cart | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [pendingVariantIds, setPendingVariantIds] = useState<ReadonlySet<string>>(new Set())
  const [confirmedVariantIds, setConfirmedVariantIds] = useState<ReadonlySet<string>>(new Set())
  const [pendingLineIds, setPendingLineIds] = useState<ReadonlySet<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const timers = useRef<Map<string, number>>(new Map())

  // Restore the persisted cart. Waits for the catalog because the preview cart
  // needs product data to rebuild its lines.
  useEffect(() => {
    if (catalogStatus === 'loading') return
    let cancelled = false

    service
      .load()
      .then((restored) => {
        if (!cancelled) setCart(restored)
      })
      .catch((caught: unknown) => {
        // A cart that cannot be restored should never block the page.
        console.error('[kelvo] Failed to restore cart:', caught)
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true)
      })

    return () => {
      cancelled = true
    }
  }, [service, catalogStatus])

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((id) => window.clearTimeout(id))
      map.clear()
    }
  }, [])

  const withSet = useCallback(
    (setter: (updater: (previous: ReadonlySet<string>) => ReadonlySet<string>) => void, id: string, present: boolean) => {
      setter((previous) => {
        const next = new Set(previous)
        if (present) next.add(id)
        else next.delete(id)
        return next
      })
    },
    [],
  )

  const handleError = useCallback((caught: unknown, fallback: string) => {
    console.error('[kelvo] Cart error:', caught)
    setError(caught instanceof CommerceError ? caught.userMessage : fallback)
  }, [])

  const addItem = useCallback<CartState['addItem']>(
    async (merchandiseId, quantity = 1) => {
      setError(null)
      withSet(setPendingVariantIds, merchandiseId, true)
      try {
        const next = await service.add(merchandiseId, quantity)
        setCart(next)

        const line = next.lines.find((l) => l.merchandiseId === merchandiseId)
        setAnnouncement(
          line
            ? `${line.productTitle}, ${line.variantTitle}, added to cart. ${next.totalQuantity} item${next.totalQuantity === 1 ? '' : 's'} in cart.`
            : 'Added to cart.',
        )

        withSet(setConfirmedVariantIds, merchandiseId, true)
        const existing = timers.current.get(merchandiseId)
        if (existing) window.clearTimeout(existing)
        timers.current.set(
          merchandiseId,
          window.setTimeout(() => {
            withSet(setConfirmedVariantIds, merchandiseId, false)
            timers.current.delete(merchandiseId)
          }, CONFIRMATION_MS),
        )

        setIsOpen(true)
        return true
      } catch (caught) {
        handleError(caught, 'Something went wrong while adding this to your cart. Please try again.')
        return false
      } finally {
        withSet(setPendingVariantIds, merchandiseId, false)
      }
    },
    [service, withSet, handleError],
  )

  const updateLine = useCallback<CartState['updateLine']>(
    async (lineId, quantity) => {
      setError(null)
      withSet(setPendingLineIds, lineId, true)
      try {
        setCart(await service.update(lineId, quantity))
      } catch (caught) {
        handleError(caught, "We couldn't update your cart just now. Please try again.")
      } finally {
        withSet(setPendingLineIds, lineId, false)
      }
    },
    [service, withSet, handleError],
  )

  const removeLine = useCallback<CartState['removeLine']>(
    async (lineId) => {
      setError(null)
      withSet(setPendingLineIds, lineId, true)
      try {
        const next = await service.remove(lineId)
        setCart(next)
        setAnnouncement('Item removed from cart.')
      } catch (caught) {
        handleError(caught, "We couldn't update your cart just now. Please try again.")
      } finally {
        withSet(setPendingLineIds, lineId, false)
      }
    },
    [service, withSet, handleError],
  )

  const checkout = useCallback(() => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl
    } else {
      setError('Checkout is not available yet. Connect the store to continue.')
    }
  }, [cart])

  const value = useMemo<CartState>(
    () => ({
      cart,
      isHydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      pendingVariantIds,
      confirmedVariantIds,
      pendingLineIds,
      error,
      dismissError: () => setError(null),
      canCheckout: service.canCheckout,
      addItem,
      updateLine,
      removeLine,
      checkout,
      totalQuantity: cart?.totalQuantity ?? 0,
      announcement,
    }),
    [
      cart,
      isHydrated,
      isOpen,
      pendingVariantIds,
      confirmedVariantIds,
      pendingLineIds,
      error,
      service.canCheckout,
      addItem,
      updateLine,
      removeLine,
      checkout,
      announcement,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
