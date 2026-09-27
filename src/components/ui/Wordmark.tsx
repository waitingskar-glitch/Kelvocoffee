import { cn } from '@/lib/cn'

/**
 * The wordmark is drawn, not typed, and it is the only mark: no symbol, no
 * monogram. Ink on Paper for web; the Paper knockout only on Ink.
 * Never below 96px wide on screen.
 */
export function Wordmark({ tone = 'ink', className }: { tone?: 'ink' | 'paper'; className?: string }) {
  return (
    <img
      src={tone === 'paper' ? '/assets/brand/wordmark-paper.webp' : '/assets/brand/wordmark-ink.webp'}
      alt="Kelvo"
      width={964}
      height={356}
      className={cn('h-auto min-w-[96px] select-none', className)}
      draggable={false}
    />
  )
}
