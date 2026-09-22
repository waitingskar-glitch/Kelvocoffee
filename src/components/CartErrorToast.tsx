import { useEffect } from 'react'
import { useCart } from '@/context/cartContext'
import { useRouter } from '@/router'
import { CloseIcon } from './ui/icons'

const AUTO_DISMISS_MS = 7000

/**
 * Surfaces cart errors when the drawer is closed.
 *
 * Without this, a failed add-to-cart would set an error nobody ever sees,
 * because the drawer's own error banner is only rendered while it is open.
 */
export function CartErrorToast() {
  const { error, dismissError } = useCart()
  const { path } = useRouter()
  // The cart page shows the same error inline, so don't say it twice.
  const visible = Boolean(error) && path !== '/cart'

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(dismissError, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [visible, dismissError])

  if (!visible) return null

  return (
    <div
      role="alert"
      className="animate-fade-up fixed inset-x-4 bottom-24 z-50 flex items-start gap-3 rounded-sm border border-[#c0704f]/50 bg-[#fbeee6] px-4 py-3 text-[0.86rem] text-[#7d3a1c] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm lg:bottom-6"
    >
      <span className="flex-1">{error}</span>
      <button
        type="button"
        onClick={dismissError}
        aria-label="Dismiss"
        className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center transition-colors hover:bg-[#7d3a1c]/10"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}
