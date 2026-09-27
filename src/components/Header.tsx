import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks, site } from '@/config/site'
import { useCart } from '@/context/cartContext'
import { useScrolled } from '@/hooks/useScrolled'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useSectionNav } from '@/hooks/useSectionNav'
import { useRouter, Link } from '@/router'
import { policies } from '@/config/policies'
import { Wordmark } from './ui/Wordmark'
import { CartIcon, CloseIcon, MenuIcon } from './ui/icons'
import { cn } from '@/lib/cn'
import { smoothScrollTo } from '@/lib/smoothScroll'

export function Header() {
  const scrolled = useScrolled(12)
  const { path, navigate } = useRouter()
  const { totalQuantity } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollToSection = useSectionNav()
  const [bump, setBump] = useState(false)
  const previousQuantity = useRef(totalQuantity)

  useBodyScrollLock(menuOpen)

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
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Close the menu whenever the route changes underneath it.
  useEffect(() => setMenuOpen(false), [path])

  const handleNav = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault()
      setMenuOpen(false)
      if (href.startsWith('#')) scrollToSection(href)
      else void navigate(href)
    },
    [scrollToSection, navigate],
  )

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 [view-transition-name:site-header] sm:px-4 sm:pt-4">
        <div
          className={cn(
            'kv-grain ground-paper mx-auto flex h-[calc(var(--spacing-header)-12px)] max-w-[75rem] items-center justify-between gap-6 rounded-lg px-4 transition-shadow duration-300 sm:px-6',
            scrolled || menuOpen ? 'shadow-[0_2px_0_0_rgb(27_25_24_/_0.12)]' : '',
          )}
        >
          <Link
            href="/"
            onClick={(event) => {
              setMenuOpen(false)
              if (path !== '/') return
              event.preventDefault()
              void smoothScrollTo(0)
            }}
            className="-ml-1 shrink-0 rounded-xs p-1"
            aria-label={`${site.name}, home`}
          >
            <Wordmark className="w-[104px] sm:w-[118px]" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleNav(event, link.href)}
                    className="shape-squircle px-4 py-2 text-[0.98rem] font-semibold transition-colors hover:bg-ink/[0.06]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="relative grid size-11 place-items-center shape-squircle transition-colors hover:bg-ink/[0.06]"
              aria-label={totalQuantity > 0 ? `Cart, ${totalQuantity} item${totalQuantity === 1 ? '' : 's'}` : 'Cart, empty'}
            >
              <CartIcon className="size-6" />
              {totalQuantity > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'tnum absolute -top-0.5 -right-0.5 grid min-w-[1.3rem] place-items-center rounded-pill bg-ink px-1 py-0.5 text-[0.7rem] leading-none font-bold text-paper',
                    bump && 'animate-pop',
                  )}
                >
                  {totalQuantity}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-11 place-items-center shape-squircle transition-colors hover:bg-ink/[0.06] lg:hidden"
            >
              {menuOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="kv-surface ground-caramel animate-fade-in fixed inset-0 z-40 overflow-y-auto lg:hidden"
        >
          <div className="container-page flex min-h-full flex-col justify-between pt-[calc(var(--spacing-header)+2.5rem)] pb-10">
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(event) => handleNav(event, link.href)}
                      className="animate-fade-up block py-2 font-display text-[2.9rem] leading-[1.05]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {link.label}.
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ul className="mt-12 flex flex-col gap-2.5">
              {policies.map((policy) => (
                <li key={policy.handle}>
                  <Link href={`/policies/${policy.handle}`} onClick={() => setMenuOpen(false)} className="label">
                    {policy.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
