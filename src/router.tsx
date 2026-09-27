import { flushSync } from 'react-dom'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'

/**
 * Tiny history-based router.
 *
 * The site is four content routes and a home page, which does not justify a
 * routing dependency. Anything more complex should graduate to react-router.
 *
 * Direct hits on /policies/* need a server rewrite to index.html — see
 * `vercel.json`, without which those URLs 404 in production.
 */

interface RouterValue {
  path: string
  /** Resolves once the new page is on screen and its entrance has finished. */
  navigate: (to: string) => Promise<void>
}

/**
 * Swaps pages inside a View Transition where the browser has one, so the old
 * page eases out and the new one eases in (styles in index.css). Browsers
 * without it, and anyone who asked for reduced motion, just get the swap.
 */
function withPageTransition(update: () => void): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || typeof document.startViewTransition !== 'function') {
    update()
    return Promise.resolve()
  }
  const transition = document.startViewTransition(() => flushSync(update))
  // A skipped transition (e.g. a background tab) still runs the update; its
  // `ready` promise rejects, which is expected and not worth surfacing.
  transition.ready.catch(() => undefined)
  return transition.finished.catch(() => undefined)
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalise(window.location.pathname))

  useEffect(() => {
    const onPopState = () => {
      void withPageTransition(() => setPath(normalise(window.location.pathname)))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: string) => {
    const next = normalise(to)
    if (next === normalise(window.location.pathname)) return Promise.resolve()
    window.history.pushState({}, '', next)
    return withPageTransition(() => {
      setPath(next)
      // A new page always starts at the top, the way a real navigation does.
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    })
  }, [])

  const value = useMemo(() => ({ path, navigate }), [path, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter(): RouterValue {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter must be used inside <RouterProvider>')
  return context
}

/** Trailing slashes are stripped so /policies/terms/ and /policies/terms match. */
function normalise(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

/**
 * Client-side link. Falls back to a normal navigation for external URLs,
 * new-tab clicks and modified clicks, so browser behaviour is never broken.
 */
export function Link({
  href,
  onClick,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useRouter()

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        const isExternal = !href.startsWith('/')
        const isModified =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
        if (isExternal || isModified || rest.target === '_blank') return

        event.preventDefault()
        void navigate(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
