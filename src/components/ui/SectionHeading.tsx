import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  id?: string
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Editorial section opener: a tracked uppercase label sitting on a hairline,
 * then the display heading beneath it.
 */
export function SectionHeading({ eyebrow, title, description, id, tone = 'light', className }: Props) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className={cn('reveal', isVisible && 'reveal-in', className)}>
      <p
        className={cn(
          'label border-t pt-4',
          tone === 'dark'
            ? 'border-[var(--rule-dark)] text-caramel-soft'
            : 'border-[var(--rule)] text-caramel',
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          'mt-6 max-w-[18ch] text-display-sm',
          tone === 'dark' ? 'text-cream' : 'text-espresso',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-[44ch] text-[0.97rem] leading-relaxed sm:text-[1.02rem]',
            tone === 'dark' ? 'text-muted-dark' : 'text-muted',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
