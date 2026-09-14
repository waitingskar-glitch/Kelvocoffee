import { useEffect } from 'react'
import type { Policy } from '@/config/policies'
import { policies } from '@/config/policies'
import { site } from '@/config/site'
import { Link } from '@/router'
import { ArrowRightIcon } from '@/components/ui/icons'

/** Renders one legal page in the site's editorial style. */
export function PolicyPage({ policy }: { policy: Policy }) {
  useEffect(() => {
    document.title = `${policy.title} — ${site.legalName}`
    return () => {
      document.title = 'Kelvo Coffee — Flavoured Filter Coffee, Reimagined'
    }
  }, [policy.title])

  const others = policies.filter((item) => item.handle !== policy.handle)

  return (
    <main id="main" className="pt-[var(--spacing-header)]">
      <article className="container-page py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[46rem]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xs text-[0.82rem] font-medium text-muted transition-colors hover:text-espresso"
          >
            <ArrowRightIcon className="size-3.5 rotate-180" />
            Back to the shop
          </Link>

          <h1 className="mt-6 text-display-sm text-espresso">{policy.title}</h1>
          <p className="mt-3 text-[1rem] leading-relaxed text-muted">{policy.summary}</p>
          <p className="mt-4 text-[0.78rem] tracking-[0.08em] text-muted uppercase">
            Last updated · {policy.lastUpdated}
          </p>

          {policy.isDraft && (
            <div
              role="note"
              className="mt-8 rounded-md border border-caramel/50 bg-cream-deep px-5 py-4"
            >
              <p className="text-[0.88rem] font-medium text-espresso">
                This policy is not final yet.
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted">
                It is published as a working draft while we complete it. For anything that affects
                your order right now, email{' '}
                <a
                  href={`mailto:${site.email}`}
                  className="text-espresso underline decoration-gold/60 underline-offset-2"
                >
                  {site.email}
                </a>{' '}
                and we will answer directly.
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-10">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-[1.4rem] leading-tight text-espresso sm:text-[1.55rem]">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <Paragraph key={index} text={paragraph} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <nav aria-label="Other policies" className="mt-16 border-t border-espresso/[0.1] pt-8">
            <h2 className="text-eyebrow font-semibold text-caramel uppercase">Other policies</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {others.map((item) => (
                <li key={item.handle}>
                  <Link
                    href={`/policies/${item.handle}`}
                    className="rounded-xs text-[0.9rem] text-espresso underline decoration-gold/50 underline-offset-4 transition-colors hover:decoration-gold"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </article>
    </main>
  )
}

/**
 * "TO CONFIRM:" marks a decision the business still has to make. It is styled
 * distinctly so nobody mistakes scaffolding for finished policy.
 */
function Paragraph({ text }: { text: string }) {
  if (text.startsWith('TO CONFIRM:')) {
    return (
      <p className="rounded-sm border-l-2 border-dashed border-caramel/60 bg-cream-deep/60 py-2 pl-4 text-[0.86rem] leading-relaxed text-coffee">
        <span className="font-medium tracking-[0.06em] text-caramel uppercase">To confirm — </span>
        {text.replace('TO CONFIRM:', '').trim()}
      </p>
    )
  }
  return <p className="text-[0.95rem] leading-relaxed text-muted">{text}</p>
}
