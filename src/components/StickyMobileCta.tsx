import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import { useRouter } from '@/router'
import { formatMoney } from '@/lib/format'
import { Button } from './ui/Button'
import { cn } from '@/lib/cn'

/**
 * Mobile-only action bar.
 *
 * Appears once the hero has scrolled away and hides again over the footer, so
 * it never sits on top of the footer links. Switches from "Shop" to a cart
 * summary as soon as there is something in the cart.
 */
export function StickyMobileCta() {
  const { cart, totalQuantity } = useCart()
  const { navigate } = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const footer = document.querySelector('footer')
    let frame = 0

    const update = () => {
      frame = 0
      const pastHero = window.scrollY > window.innerHeight * 0.75
      const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      setVisible(pastHero && footerTop > window.innerHeight - 40)
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const hasItems = totalQuantity > 0

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--rule)] bg-cream/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-300 ease-[var(--ease-out-soft)] lg:hidden',
        visible ? 'translate-y-0' : 'translate-y-[130%]',
      )}
      aria-hidden={!visible}
    >
      {hasItems && cart ? (
        <Button fullWidth size="lg" onClick={() => navigate('/cart')} tabIndex={visible ? undefined : -1}>
          <span>View cart · {totalQuantity}</span>
          <span className="tnum opacity-70">{formatMoney(cart.subtotal)}</span>
        </Button>
      ) : (
        <Button
          fullWidth
          size="lg"
          tabIndex={visible ? undefined : -1}
          onClick={() => {
            const target = document.querySelector('#shop')
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          Shop the flavours
        </Button>
      )}
    </div>
  )
}
