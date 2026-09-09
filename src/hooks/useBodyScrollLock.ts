import { useEffect } from 'react'

let lockCount = 0
let restoreStyles: (() => void) | null = null

/**
 * Locks background scrolling while an overlay is open.
 *
 * Reference-counted so a modal opened on top of the cart drawer does not
 * unlock the page when only one of them closes. Compensates for the
 * scrollbar so the layout does not jump on desktop.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return

    lockCount += 1
    if (lockCount === 1) {
      const { body } = document
      const previousOverflow = body.style.overflow
      const previousPadding = body.style.paddingRight
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

      restoreStyles = () => {
        body.style.overflow = previousOverflow
        body.style.paddingRight = previousPadding
      }
    }

    return () => {
      lockCount -= 1
      if (lockCount === 0 && restoreStyles) {
        restoreStyles()
        restoreStyles = null
      }
    }
  }, [active])
}
