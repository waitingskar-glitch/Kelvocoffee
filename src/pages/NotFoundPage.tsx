import { useEffect } from 'react'
import { site } from '@/config/site'
import { Link } from '@/router'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  useEffect(() => {
    document.title = `Page not found — ${site.legalName}`
    return () => {
      document.title = 'Kelvo Coffee — Flavoured Filter Coffee, Reimagined'
    }
  }, [])

  return (
    <main id="main" className="pt-[var(--spacing-header)]">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="label text-caramel">404</p>
        <h1 className="mt-4 max-w-[18ch] text-display-sm text-espresso">
          This page has gone cold.
        </h1>
        <p className="mt-4 max-w-[42ch] text-[0.98rem] leading-relaxed text-muted">
          The link may be out of date, or we may have moved something. The coffee is still where you
          left it.
        </p>
        <Link href="/" className="mt-8">
          <Button size="lg">Back to the shop</Button>
        </Link>
      </div>
    </main>
  )
}
