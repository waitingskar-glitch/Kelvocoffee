/**
 * Runs `task` once the browser is idle (or after `timeout` ms at the latest),
 * so heavy but deferrable work — parsing and drawing a large illustration —
 * happens in a quiet moment instead of in the middle of a scroll. Returns a
 * cancel function.
 */
export function whenIdle(task: () => void, timeout = 3000): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(task, { timeout })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = setTimeout(task, Math.min(timeout, 1500))
  return () => clearTimeout(handle)
}
