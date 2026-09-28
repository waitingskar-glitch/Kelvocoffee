/**
 * Keeps the graph grid even on every gridded surface (.kv-surface).
 *
 * The grid is a 52px module, but a panel is rarely an exact multiple of 52px
 * wide, which leaves a sliver of a column at its right edge. For each surface
 * this nudges the cell size (a pixel or so either way) so a whole number of
 * squares fits its width exactly, and keeps it fitted as the panel resizes.
 * A small surface can set its own module with data-grid-module.
 */

const MODULE = 52

function fit(element: HTMLElement) {
  const width = element.clientWidth
  if (width <= 0) return
  // Small surfaces can ask for a finer grid: data-grid-module="20".
  const module = Number(element.dataset.gridModule) || MODULE
  const columns = Math.max(1, Math.round(width / module))
  const size = `${(width / columns).toFixed(3)}px`
  // Only touch the style when the size really changes (a write repaints the panel).
  if (element.style.getPropertyValue('--grid') !== size) element.style.setProperty('--grid', size)
}

export function installEvenGrid(): void {
  if (typeof window === 'undefined' || !('ResizeObserver' in window)) return

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) fit(entry.target as HTMLElement)
  })
  const watched = new WeakSet<Element>()

  const watch = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>('.kv-surface').forEach((element) => {
      if (watched.has(element)) return
      watched.add(element)
      resizeObserver.observe(element)
    })
  }

  watch(document)

  // Pages and sections mount later (routes, lazy chunks); pick those up too.
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        if (node.classList.contains('kv-surface') && !watched.has(node)) {
          watched.add(node)
          resizeObserver.observe(node)
        }
        watch(node)
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}
