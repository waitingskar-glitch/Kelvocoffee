import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

interface Props {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  id?: string
  align?: 'start' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}

/** Consistent editorial section opener: eyebrow, display heading, standfirst. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = 'start',
  tone = 'light',
  className,
}: Props) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn(
        'reveal',
        isVisible && 'reveal-in',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2.5 text-eyebrow font-semibold uppercase',
          align === 'center' && 'justify-center',
          tone === 'dark' ? 'text-caramel-soft' : 'text-caramel',
        )}
      >
        <span className="h-px w-6 bg-current opacity-50" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          'mt-4 max-w-[19ch] text-display-sm sm:max-w-[22ch]',
          align === 'center' && 'mx-auto',
          tone === 'dark' ? 'text-cream' : 'text-espresso',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-[46ch] text-[0.97rem] leading-relaxed sm:text-[1.03rem]',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-muted-dark' : 'text-muted',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
