import { useEffect } from 'react'
import { site } from '@/config/site'
import { Link } from '@/router'

export function NotFoundPage() {
  useEffect(() => {
    document.title = `Page not found | ${site.legalName}`
    return () => {
      document.title = site.defaultTitle
    }
  }, [])

  return (
    <main id="main" className="px-3 pt-[calc(var(--spacing-header)+1.25rem)] pb-6 sm:px-4">
      <div className="kv-surface ground-whiskey mx-auto flex min-h-[70svh] max-w-[75rem] flex-col justify-center overflow-hidden rounded-xl px-6 py-16 sm:px-10 lg:px-14">
        <p className="label">404</p>
        <h1 className="mt-5 max-w-[10ch] text-mega">Wrong cup.</h1>
        <p className="mt-6 max-w-[32ch] text-[1.15rem] leading-snug font-medium">
          This page isn&rsquo;t here. The coffee still is.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-13 w-fit items-center shape-squircle bg-ink px-7 text-[1.05rem] font-bold text-paper transition-transform hover:-translate-y-0.5"
        >
          Back to the shop
        </Link>
      </div>
    </main>
  )
}
