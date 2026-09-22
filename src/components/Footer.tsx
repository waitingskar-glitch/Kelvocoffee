import { footerSections, site, socialLinks } from '@/config/site'
import { Link } from '@/router'
import { useSectionNav } from '@/hooks/useSectionNav'

export function Footer() {
  const scrollToSection = useSectionNav()

  return (
    <footer className="bg-espresso text-cream">
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <p className="label font-display text-[1.05rem] tracking-[0.24em] text-cream">KELVO</p>
            <p className="mt-6 max-w-[32ch] text-[0.92rem] leading-relaxed text-muted-dark">
              Small-batch coffee concentrate for the filter-coffee faithful who fancy a change.
              Pour, mix, get on with your morning.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline mt-8 inline-block text-[0.88rem] text-cream"
            >
              {site.email}
            </a>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {footerSections.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="label border-t border-[var(--rule-dark)] pt-4 text-caramel-soft">
                  {section.title}
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={(event) => {
                          if (!link.href.startsWith('#')) return
                          event.preventDefault()
                          scrollToSection(link.href)
                        }}
                        className="inline-block rounded-xs text-[0.87rem] text-cream/70 transition-colors hover:text-cream"
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

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--rule-dark)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-muted-dark">
            © {new Date().getFullYear()} {site.legalName} — Made for {site.city} mornings
          </p>

          {socialLinks.length > 0 && (
            <ul className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label text-cream/70 transition-colors hover:text-cream"
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
