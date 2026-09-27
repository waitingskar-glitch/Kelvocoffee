/**
 * Eased window scrolling, used for in-page navigation.
 *
 * The browser's own `behavior: 'smooth'` is quick and linear and can't be
 * tuned, so this runs its own ease-in-out over a duration that grows with
 * the distance. Any wheel, touch or key input hands control straight back
 * to the visitor. Reduced motion jumps instead.
 */

let cancelActive: (() => void) | null = null

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Scrolls the window to `targetY`. Resolves when the scroll ends or is interrupted. */
export function smoothScrollTo(targetY: number): Promise<void> {
  cancelActive?.()

  const maxY = document.documentElement.scrollHeight - window.innerHeight
  const endY = Math.max(0, Math.min(targetY, maxY))
  const startY = window.scrollY
  const distance = endY - startY

  if (Math.abs(distance) < 2 || prefersReducedMotion()) {
    window.scrollTo({ top: endY, behavior: 'instant' as ScrollBehavior })
    return Promise.resolve()
  }

  // ~0.5s for a short hop, up to ~1.3s across the whole page.
  const duration = Math.min(1300, 450 + Math.abs(distance) * 0.22)

  return new Promise((resolve) => {
    let frame = 0
    const start = performance.now()

    const stop = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
      cancelActive = null
      resolve()
    }

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      // 'instant' so the stylesheet's `scroll-behavior: smooth` doesn't smooth each frame again.
      window.scrollTo({ top: startY + distance * easeInOutCubic(progress), behavior: 'instant' as ScrollBehavior })
      if (progress < 1) frame = requestAnimationFrame(step)
      else stop()
    }

    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)
    cancelActive = stop
    frame = requestAnimationFrame(step)
  })
}

/** Scrolls to an element, honouring its `scroll-margin-top` so it clears the fixed header. */
export function smoothScrollToElement(element: Element): Promise<void> {
  const margin =
    parseFloat(getComputedStyle(element).scrollMarginTop) ||
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0
  const top = element.getBoundingClientRect().top + window.scrollY - margin
  return smoothScrollTo(top)
}
