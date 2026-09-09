import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

/** Wraps children in a one-shot scroll reveal. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  /** Seconds. Staggers items within a group. */
  delay?: number
  className?: string
}) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn('reveal', isVisible && 'reveal-in', className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
