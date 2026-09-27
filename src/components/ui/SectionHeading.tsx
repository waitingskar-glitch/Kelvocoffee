import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/cn'

interface Props {
  title: ReactNode
  intro?: ReactNode
  id?: string
  className?: string
}

/**
 * Section H2 (80% of the hero H1) and its intro, centred. Below the hero the
 * site reads on one centre line, like the reference.
 */
export function SectionHeading({ title, intro, id, className }: Props) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={cn('reveal text-center', isVisible && 'reveal-in', className)}>
      <h2 id={id} className="text-h2 mx-auto max-w-[14ch]">
        {title}
      </h2>
      {intro && <p className="mx-auto mt-5 max-w-[46ch] text-[1.08rem] leading-relaxed sm:text-[1.15rem]">{intro}</p>}
    </div>
  )
}
