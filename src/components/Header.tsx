import { useCallback, useEffect, useRef, useState } from 'react'
import { navLinks, site } from '@/config/site'
import { useCart } from '@/context/cartContext'
import { useScrolled } from '@/hooks/useScrolled'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useSectionNav } from '@/hooks/useSectionNav'
import { useRouter, Link } from '@/router'
import { flavours } from '@/config/catalog'
import { productHandles, shopOrder } from '@/config/shopify'
import { Wordmark } from './ui/Wordmark'
import { ArrowRightIcon, CartIcon, CloseIcon, MenuIcon } from './ui/icons'
import { Button } from './ui/Button'
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
          className="kv-grain ground-paper animate-fade-in fixed inset-0 z-40 overflow-y-auto overscroll-contain lg:hidden"
        >
          {/* Under the header: the pages on a Caramel card, the range as five
              pouches, then the button. */}
          <div className="mx-auto flex min-h-full w-full max-w-[40rem] flex-col gap-5 [@media(max-height:720px)]:gap-4 px-3 pt-[calc(var(--spacing-header)+0.75rem)] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:gap-7 sm:px-4 sm:pt-[calc(var(--spacing-header)+1.5rem)]">
            <nav aria-label="Mobile" className="kv-surface ground-caramel rounded-xl px-5 py-1.5 sm:px-8 sm:py-3">
              <ul>
                {navLinks.map((link, index) => (
                  <li key={link.label} className="border-b-2 border-ink/15 last:border-b-0">
                    <a
                      href={link.href}
                      onClick={(event) => handleNav(event, link.href)}
                      className="animate-fade-up group flex items-center gap-4 py-3.5 [@media(max-height:720px)]:py-2.5 sm:gap-6 sm:py-5"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="tnum w-6 text-[0.8rem] font-semibold tracking-[0.08em] text-ink/60 sm:text-[0.9rem]">
                        0{index + 1}
                      </span>
                      <span className="flex-1 font-display text-[2.1rem] leading-none [@media(max-height:720px)]:text-[1.85rem] sm:text-[2.9rem]">{link.label}.</span>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink transition-colors group-hover:bg-ink group-hover:text-paper group-active:bg-ink group-active:text-paper sm:size-12">
                        <ArrowRightIcon className="size-5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* The range, filling the room between the links and the button: a
                pouch per flavour, straight to its page, and the hamper builder. */}
            <section aria-label="The range" className="animate-fade-up flex min-h-0 flex-1 flex-col" style={{ animationDelay: '0.2s' }}>
              <p className="label mb-2.5 px-1 text-ink/70">The range</p>
              <ul className="grid flex-1 auto-rows-[minmax(8.5rem,1fr)] grid-cols-3 gap-2 [@media(max-height:720px)]:auto-rows-[minmax(5.75rem,1fr)] sm:gap-3">
                {shopOrder.map((key) => {
                  const meta = flavours[key]
                  return (
                    <li key={key} className="flex">
                      <Link
                        href={`/products/${productHandles[key]}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex flex-1 flex-col overflow-hidden rounded-lg border-2 border-ink transition-transform active:scale-[0.97]"
                      >
                        <span className={cn('kv-grain relative block min-h-0 flex-1', meta.ground)}>
                          <img
                            src={meta.pouch.src}
                            srcSet={meta.pouch.srcSet}
                            sizes="(min-width: 640px) 12rem, 30vw"
                            alt=""
                            aria-hidden="true"
                            width={meta.pouch.width}
                            height={meta.pouch.height}
                            loading="lazy"
                            decoding="async"
                            className="absolute bottom-[-5%] left-1/2 h-[88%] w-auto max-w-none -translate-x-1/2 object-contain"
                          />
                        </span>
                        <span className="kv-grain ground-paper border-t-2 border-ink py-2 text-center font-display text-[0.9rem] leading-none sm:py-2.5 sm:text-[1.1rem]">
                          {meta.name}
                        </span>
                      </Link>
                    </li>
                  )
                })}
                {/* The sixth slot: make your own. */}
                <li className="flex">
                  <a
                    href="#hampers"
                    onClick={(event) => handleNav(event, '#hampers')}
                    className="group flex flex-1 flex-col justify-between rounded-lg border-2 border-ink bg-ink p-3 text-paper transition-transform active:scale-[0.97] sm:p-4"
                  >
                    <span className="font-display text-[1.25rem] leading-[0.95] sm:text-[1.6rem]">
                      Build a
                      <br />
                      hamper.
                    </span>
                    <span className="flex items-end justify-between gap-2">
                      <span className="text-[0.78rem] leading-tight text-paper/70 sm:text-[0.9rem]">2 or 4 packs</span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-paper transition-colors group-hover:bg-paper group-hover:text-ink group-active:bg-paper group-active:text-ink sm:size-10">
                        <ArrowRightIcon className="size-4 sm:size-5" />
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </section>

            <div className="animate-fade-up mt-auto pt-2 [@media(max-height:720px)]:pt-0" style={{ animationDelay: '0.28s' }}>
              <Button
                size="lg"
                fullWidth
                onClick={() => {
                  setMenuOpen(false)
                  scrollToSection('#shop')
                }}
              >
                Shop the flavours
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
