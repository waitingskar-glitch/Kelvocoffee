import { useCallback } from 'react'
import { useRouter } from '@/router'
import { smoothScrollToElement } from '@/lib/smoothScroll'

/**
 * Navigates to a section of the home page from anywhere on the site.
 *
 * On the home page it glides there. From another page the home page fades in
 * first (see the router's page transition), then it glides down.
 */
export function useSectionNav() {
  const { path, navigate } = useRouter()

  return useCallback(
    async (hash: string) => {
      const scrollToSection = () => {
        const target = document.querySelector<HTMLElement>(hash)
        if (!target) return
        // Move keyboard focus with the viewport so the jump works for AT too.
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
        void smoothScrollToElement(target)
      }

      if (path === '/') {
        scrollToSection()
        return
      }

      await navigate('/')
      // One frame for layout to settle after the page has swapped in.
      requestAnimationFrame(scrollToSection)
    },
    [path, navigate],
  )
}
