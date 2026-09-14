import { footerSections, site, socialLinks } from '@/config/site'
import { DripIcon } from './ui/icons'
import { Link } from '@/router'
import { useSectionNav } from '@/hooks/useSectionNav'

export function Footer() {
  const scrollToSection = useSectionNav()

  return (
    <footer className="surface-grain relative overflow-hidden bg-espresso text-cream">
      <div className="container-page relative py-14 sm:py-16 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-pill border border-cream/20 text-caramel-soft" aria-hidden="true">
                <DripIcon className="size-4.5" />
              </span>
              <span className="font-display text-[1.3rem] leading-none tracking-[0.14em] text-cream uppercase">
                {site.name}
              </span>
            </div>
            <p className="mt-5 max-w-[34ch] text-[0.9rem] leading-relaxed text-muted-dark">
              Small-batch coffee concentrate for the filter-coffee faithful who fancy a change.
              Pour, mix, get on with your morning.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-block rounded-xs text-[0.88rem] text-cream underline decoration-gold/50 underline-offset-4 transition-colors hover:decoration-gold"
            >
              {site.email}
            </a>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:col-span-2 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
            {footerSections.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="text-eyebrow font-semibold text-caramel-soft uppercase">
                  {section.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={(event) => {
                          if (!link.href.startsWith('#')) return
                          event.preventDefault()
                          scrollToSection(link.href)
                        }}
                        className="inline-block rounded-xs py-0.5 text-[0.88rem] text-cream/75 transition-colors hover:text-cream"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/12 pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8rem] text-muted-dark">
            © {new Date().getFullYear()} {site.legalName}. Made for {site.city} mornings.
          </p>

          {socialLinks.length > 0 && (
            <ul className="flex items-center gap-5">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-xs text-[0.82rem] text-cream/75 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
