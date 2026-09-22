import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks, site } from '@/config/site'
import { useCart } from '@/context/cartContext'
import { useScrolled } from '@/hooks/useScrolled'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useSectionNav } from '@/hooks/useSectionNav'
import { useRouter, Link } from '@/router'
import { policies } from '@/config/policies'
import { cn } from '@/lib/cn'

/**
 * Minimal editorial header: wordmark, cart count, Menu.
 *
 * It sits over the hero rather than above it, so the image runs to the top of
 * the viewport. Over the hero it is transparent with cream type; once scrolled
 * past, it lands on a cream bar with a hairline under it.
 */
export function Header() {
  const scrolled = useScrolled(80)
  const { path } = useRouter()
  const { totalQuantity, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollToSection = useSectionNav()
  const [bump, setBump] = useState(false)
  const previousQuantity = useRef(totalQuantity)

  const isHome = path === '/' || path === ''
  // Only the home page has a dark hero for the header to sit on.
  const overHero = isHome && !scrolled

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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleNav = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault()
      setMenuOpen(false)
      scrollToSection(href)
    },
    [scrollToSection],
  )

  // The menu overlay is flooded espresso, so the header must stay cream on it.
  const tone = overHero || menuOpen ? 'text-cream' : 'text-espresso'

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-[var(--ease-out-soft)]',
          'border-b',
          menuOpen
            ? 'border-transparent bg-transparent'
            : overHero
              ? 'border-transparent bg-transparent'
              : 'border-[var(--rule)] bg-cream/95 backdrop-blur-xl',
        )}
      >
        <div
          className={cn(
            'container-page flex h-[var(--spacing-header)] items-center justify-between gap-6 transition-colors duration-500',
            tone,
          )}
        >
          <Link
            href="/"
            onClick={(event) => {
              if (!isHome) return
              event.preventDefault()
              setMenuOpen(false)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="label -ml-0.5 shrink-0 rounded-xs px-0.5 py-1 font-display text-[0.95rem] tracking-[0.24em] transition-opacity hover:opacity-60 sm:text-[1.05rem]"
            aria-label={`${site.name} — home`}
          >
            KELVO
          </Link>

          <div className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={openCart}
              className="label group flex items-baseline gap-1 rounded-xs py-2 transition-opacity hover:opacity-60"
              aria-label={
                totalQuantity > 0
                  ? `Open cart, ${totalQuantity} item${totalQuantity === 1 ? '' : 's'}`
                  : 'Open cart, empty'
              }
            >
              Cart
              <span
                className={cn('index-mark text-[0.62rem] align-super', bump && 'animate-pop')}
                aria-hidden="true"
              >
                {totalQuantity}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="label rounded-xs py-2 transition-opacity hover:opacity-60"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNav}
      />
    </>
  )
}

function MenuOverlay({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}) {
  if (!open) return null

  return (
    <div
      id="site-menu"
      className="animate-fade-in fixed inset-0 z-40 bg-espresso text-cream"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="container-page flex h-full flex-col justify-between pt-[calc(var(--spacing-header)+3rem)] pb-10 sm:pb-14">
        <nav aria-label="Primary">
          <ul className="flex flex-col">
            {navLinks.map((link, index) => (
              <li key={link.label} className="border-t border-[var(--rule-dark)] last:border-b">
                <a
                  href={link.href}
                  onClick={(event) => onNavigate(event, link.href)}
                  className="animate-fade-up group flex items-baseline gap-5 py-5 sm:py-7"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="index-mark label shrink-0 text-caramel-soft opacity-80">
                    [{index + 1}]
                  </span>
                  <span className="font-display text-[2rem] leading-none transition-opacity group-hover:opacity-60 sm:text-[3rem] lg:text-[3.75rem]">
                    {link.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {policies.map((policy) => (
              <li key={policy.handle}>
                <Link
                  href={`/policies/${policy.handle}`}
                  onClick={onClose}
                  className="label text-cream/55 transition-colors hover:text-cream"
                >
                  {policy.title}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${site.email}`}
            className="link-underline label self-start text-cream/80 sm:self-auto"
          >
            {site.email}
          </a>
        </div>
      </div>
    </div>
  )
}
