import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks, site } from '@/config/site'
import { useCart } from '@/context/cartContext'
import { useScrolled } from '@/hooks/useScrolled'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { Button } from './ui/Button'
import { CartIcon, CloseIcon, MenuIcon } from './ui/icons'
import { cn } from '@/lib/cn'

function scrollToSection(hash: string) {
  const target = document.querySelector(hash)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // Move keyboard focus with the viewport so the jump works for AT too.
  ;(target as HTMLElement).setAttribute('tabindex', '-1')
  ;(target as HTMLElement).focus({ preventScroll: true })
}

export function Header() {
  const scrolled = useScrolled(10)
  const { totalQuantity, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const [bump, setBump] = useState(false)
  const previousQuantity = useRef(totalQuantity)

  useBodyScrollLock(menuOpen)

  // Animate the badge whenever the count actually changes.
  useEffect(() => {
    const changed = previousQuantity.current !== totalQuantity
    previousQuantity.current = totalQuantity
    if (!changed || totalQuantity === 0) return

    setBump(true)
    const timer = window.setTimeout(() => setBump(false), 450)
    return () => window.clearTimeout(timer)
  }, [totalQuantity])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleNav = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setMenuOpen(false)
    scrollToSection(href)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)]',
        'border-b backdrop-blur-xl',
        scrolled
          ? 'border-espresso/10 bg-cream/88 shadow-subtle'
          : 'border-transparent bg-cream/45',
      )}
    >
      <div className="container-page flex h-[var(--spacing-header)] items-center justify-between gap-4">
        {/* Wordmark */}
        <a
          href="#top"
          onClick={(event) => handleNav(event, '#top')}
          className="-ml-0.5 shrink-0 rounded-xs px-0.5 py-1 font-display text-[1.35rem] leading-none font-semibold tracking-[0.14em] text-espresso uppercase transition-opacity hover:opacity-70"
          aria-label={`${site.name} — home`}
        >
          Kelvo
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={(event) => handleNav(event, link.href)}
                  className="rounded-pill px-3.5 py-2 text-[0.86rem] font-medium text-espresso/75 transition-colors duration-200 hover:bg-espresso/[0.05] hover:text-espresso"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <CartButton count={totalQuantity} bump={bump} onClick={openCart} />

          {/* Wrapped rather than given `hidden` directly: the button's own
              `inline-flex` is the same CSS property and would win. */}
          <span className="hidden lg:block">
            <Button size="sm" onClick={() => scrollToSection('#shop')}>
              Shop coffee
            </Button>
          </span>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-11 place-items-center rounded-pill text-espresso transition-colors hover:bg-espresso/[0.06] lg:hidden"
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-espresso/10 bg-cream/97 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-4">
          <ul className="flex flex-col">
            {navLinks.map((link, index) => (
              <li key={link.label} className={cn(index > 0 && 'border-t border-espresso/[0.07]')}>
                <a
                  href={link.href}
                  onClick={(event) => handleNav(event, link.href)}
                  className="flex min-h-13 items-center font-display text-[1.15rem] text-espresso"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            fullWidth
            size="lg"
            className="mt-4"
            onClick={() => {
              setMenuOpen(false)
              scrollToSection('#shop')
            }}
          >
            Shop coffee
          </Button>
        </nav>
      </div>
    </header>
  )
}

function CartButton({
  count,
  bump,
  onClick,
}: {
  count: number
  bump: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative grid size-11 place-items-center rounded-pill text-espresso transition-colors hover:bg-espresso/[0.06]"
      aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart, empty'}
    >
      <CartIcon className="size-5" />
      {count > 0 && (
        <span
          className={cn(
            'tnum absolute top-1 right-0.5 grid min-w-[1.15rem] place-items-center rounded-pill bg-caramel px-1 py-0.5 text-[0.65rem] leading-none font-semibold text-cream',
            bump && 'animate-pop',
          )}
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  )
}
