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
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalise(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPath(normalise(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((to: string) => {
    const next = normalise(to)
    if (next === normalise(window.location.pathname)) return
    window.history.pushState({}, '', next)
    setPath(next)
    // A new page always starts at the top, the way a real navigation does.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
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
        navigate(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
