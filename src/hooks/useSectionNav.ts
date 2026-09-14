import { useCallback } from 'react'
import { useRouter } from '@/router'

/**
 * Navigates to a section of the home page from anywhere on the site.
 *
 * On the home page it just scrolls. From a policy page the section does not
 * exist yet, so it routes home first and scrolls once the page has mounted.
 */
export function useSectionNav() {
  const { path, navigate } = useRouter()

  return useCallback(
    (hash: string) => {
      const scrollToSection = () => {
        const target = document.querySelector(hash)
        if (!target) return
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Move keyboard focus with the viewport so the jump works for AT too.
        ;(target as HTMLElement).setAttribute('tabindex', '-1')
        ;(target as HTMLElement).focus({ preventScroll: true })
      }

      if (path === '/') {
        scrollToSection()
        return
      }

      navigate('/')
      // Two frames: one for React to commit the home page, one for layout.
      requestAnimationFrame(() => requestAnimationFrame(scrollToSection))
    },
    [path, navigate],
  )
}
