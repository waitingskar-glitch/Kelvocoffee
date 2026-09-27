import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { footerSections, site, socialLinks } from '@/config/site'
import { brand } from '@/config/brand'
import { flavours } from '@/config/catalog'
import { productHandles, shopOrder } from '@/config/shopify'
import { Link } from '@/router'
import { useSectionNav } from '@/hooks/useSectionNav'
import { WORDMARK_VIEWBOX, wordmarkLetters } from './wordmarkPaths'

const information = footerSections.find((section) => section.title === 'Information')?.links ?? []
const legal = footerSections.find((section) => section.title === 'Legal')?.links ?? []

/**
 * The footer, in black and white only: Ink ground, Paper type. The line and
 * the two ways to say hi, a heavy rule, the range in the display face, the
 * site links quieter underneath, and the wordmark drawn huge in Paper, running
 * off both sides, its letters hopping in a loop, cut off at the foot by the
 * legal bar (which carries every policy, so they aren't repeated above).
 */
export function Footer() {
  const scrollToSection = useSectionNav()

  // In-page links (#faq and the like) scroll smoothly instead of jumping.
  const onLinkClick = (href: string) => (event: MouseEvent) => {
    if (!href.startsWith('#')) return
    event.preventDefault()
    scrollToSection(href)
  }

  return (
    <footer className="kv-grain ground-ink relative overflow-hidden pt-20 sm:pt-28">
      <div className="container-page text-center">
        <p className="mx-auto max-w-[16ch] font-display text-[2.3rem] leading-[0.95] sm:text-[3.4rem]">{brand.oneLine}</p>

        {/* Say hi: customer care. */}
        <p className="mt-5 text-[1rem] text-paper/70 sm:mt-6 sm:text-[1.1rem]">Questions or feedback? Say hi.</p>
        <p className="mt-2 text-[1.05rem] font-semibold sm:text-[1.15rem]">
          <a href={`tel:${brand.customerCare.replace(/\s+/g, '')}`} className="link-underline tnum">
            {brand.customerCare}
          </a>
        </p>

        <hr className="mx-auto mt-12 h-[3px] max-w-[64rem] rounded-full border-0 bg-paper sm:mt-16" />

        {/* The range, in the display face: three to a row on phones, one row from sm. */}
        <nav aria-label="Shop" className="mt-10 sm:mt-14">
          <ul className="mx-auto grid max-w-[22rem] grid-cols-3 gap-x-4 gap-y-4 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-12">
            {[
              ...shopOrder.map((key) => ({ label: flavours[key].name, href: `/products/${productHandles[key]}` })),
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-display text-[1.35rem] leading-none decoration-2 underline-offset-[6px] hover:underline sm:text-[1.75rem]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Around the site, and any socials: quieter, underneath. */}
        <nav aria-label="Information" className="mt-8 sm:mt-10">
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2 sm:gap-x-10">
            {information
              .filter((link) => !link.href.startsWith('mailto:'))
              .map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onLinkClick(link.href)}
                    className="text-[1rem] font-medium text-paper/80 underline decoration-paper/35 decoration-1 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper sm:text-[1.05rem]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[1rem] font-medium text-paper/80 underline decoration-paper/35 decoration-1 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper sm:text-[1.05rem]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* The wordmark, huge in Paper, bleeding off both sides; the legal bar below cuts across its foot. */}
      <div className="relative mt-20 aspect-[964/290] w-full [clip-path:inset(-40%_0_0_0)] sm:mt-32">
        <HoppingWordmark className="absolute top-0 left-1/2 w-[106%] -translate-x-1/2" />
      </div>

      {/* The mandatory block (wording from the book) and the policies, on a bar across the wordmark's foot. */}
      <div className="relative z-10 mx-3 -mt-3 mb-3 rounded-xl border-2 border-paper bg-ink px-5 py-4 text-paper sm:mx-4 sm:-mt-8 sm:mb-4 sm:px-8 sm:py-5">
        <div className="flex flex-col items-center gap-3 text-center text-[0.88rem] text-paper/85 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-x-8 gap-y-2 lg:flex-row">
            <span>
              © {new Date().getFullYear()} {site.legalName}
            </span>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              {legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:underline hover:underline-offset-4">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <span className="tnum">
            {brand.licence} · Made in {site.city}
          </span>
        </div>
      </div>
    </footer>
  )
}

/**
 * The wordmark as live SVG, one path per letter, so each can hop: a squash,
 * a jump, a squashy landing, rippling left to right, then a rest before the
 * next wave (all in index.css). It pauses off screen; with reduced motion it
 * simply sits there.
 */
function HoppingWordmark({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) {
      setLive(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Kelvo"
      viewBox={`0 0 ${WORDMARK_VIEWBOX.width} ${WORDMARK_VIEWBOX.height}`}
      fill="var(--color-paper)"
      fillRule="evenodd"
      data-live={live}
      className={`kv-logo-hop overflow-visible ${className ?? ''}`}
    >
      {wordmarkLetters.map((letter, index) => (
        <path key={letter.letter} d={letter.d} style={{ '--i': index } as CSSProperties} />
      ))}
    </svg>
  )
}
