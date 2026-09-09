import { cn } from '@/lib/cn'

/** Inline loading indicator. Decorative — announce state in the label text. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'animate-spin-soft inline-block size-3.5 shrink-0 rounded-full border-[1.5px] border-current border-t-transparent',
        className,
      )}
    />
  )
}
