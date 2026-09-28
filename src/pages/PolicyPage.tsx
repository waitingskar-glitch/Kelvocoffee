import { useEffect } from 'react'
import type { Policy } from '@/config/policies'
import { policies } from '@/config/policies'
import { site } from '@/config/site'
import { brand } from '@/config/brand'
import { Link } from '@/router'
import { ArrowRightIcon } from '@/components/ui/icons'

/** Renders one legal page in the site's editorial style. */
export function PolicyPage({ policy }: { policy: Policy }) {
  useEffect(() => {
    document.title = `${policy.title} | ${site.legalName}`
    return () => {
      document.title = site.defaultTitle
    }
  }, [policy.title])

  const others = policies.filter((item) => item.handle !== policy.handle)

  return (
    <main id="main" className="pt-[calc(var(--spacing-header)+1rem)]">
      <article className="container-page py-10 sm:py-14 lg:py-16">
        <div className="max-w-[48rem]">
          <Link href="/" className="label inline-flex min-h-11 items-center gap-2 transition-transform hover:-translate-x-1">
            <ArrowRightIcon className="size-4 rotate-180" />
            Back to the shop
          </Link>

          <h1 className="mt-6 max-w-[14ch] text-display">{policy.title}</h1>
          <p className="mt-5 max-w-[46ch] text-[1.1rem] leading-snug font-medium">{policy.summary}</p>
          <p className="label mt-5">Last updated · {policy.lastUpdated}</p>

          {policy.isDraft && (
            <div role="note" className="kv-grain ground-vanilla mt-8 rounded-lg border-2 border-ink px-5 py-4">
              <p className="text-[1rem] font-bold">This policy is not final yet.</p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed">
                It is published as a working draft while we complete it. For anything that affects your
                order right now, call us on{' '}
                <a href={`tel:${brand.customerCare.replace(/\s+/g, '')}`} className="link-underline tnum font-semibold">
                  {brand.customerCare}
                </a>{' '}
                and we will answer directly.
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-col gap-10">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-[1.6rem] leading-tight sm:text-[1.85rem]">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <Paragraph key={index} text={paragraph} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <nav aria-label="Other policies" className="mt-16 border-t-2 border-ink pt-8">
            <h2 className="label">Other policies</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((item) => (
                <li key={item.handle}>
                  <Link
                    href={`/policies/${item.handle}`}
                    className="inline-flex min-h-11 items-center shape-squircle border-2 border-ink px-4 text-[0.95rem] font-semibold transition-colors hover:bg-ink hover:text-paper"
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
      <p className="rounded-md border-2 border-dashed border-ink px-4 py-3 text-[0.95rem] leading-relaxed">
        <span className="label">To confirm: </span>
        {text.replace('TO CONFIRM:', '').trim()}
      </p>
    )
  }
  return <p className="max-w-[62ch] text-[1rem] leading-relaxed">{text}</p>
}
