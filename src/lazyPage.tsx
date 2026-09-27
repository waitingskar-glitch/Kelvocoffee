import { lazy, type ComponentType } from 'react'

/**
 * A route page split into its own chunk, with a `preload()` that fetches it
 * ahead of time. Once preloaded it renders straight away with no Suspense
 * fallback, so page transitions stay one clean swap.
 */
export function lazyPage<P extends object>(loader: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<ComponentType<P>> | null = null

  const preload = () => {
    pending ??= loader().then((component) => (loaded = component))
    return pending
  }

  const Lazy = lazy(() => preload().then((component) => ({ default: component })))

  function Page(props: P) {
    const Loaded = loaded
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />
  }

  return Object.assign(Page, { preload })
}
