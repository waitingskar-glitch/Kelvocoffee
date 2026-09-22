import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkOutline'
type Size = 'sm' | 'md' | 'lg'

/**
 * Squared and solid. The page is otherwise hairlines and text links, so the
 * buy action is the one place that deliberately shouts.
 */
const base =
  'relative inline-flex items-center justify-center gap-2.5 rounded-sm font-medium uppercase tracking-[0.14em] transition-[background-color,color,border-color,opacity] duration-250 ease-[var(--ease-out-soft)] select-none disabled:cursor-not-allowed disabled:opacity-55'

const variants: Record<Variant, string> = {
  primary: 'bg-espresso text-cream hover:bg-coffee disabled:hover:bg-espresso',
  secondary:
    'border border-[color-mix(in_srgb,var(--color-espresso)_28%,transparent)] text-espresso hover:border-espresso',
  ghost: 'text-espresso hover:opacity-60',
  onDark: 'bg-cream text-espresso hover:bg-white',
  onDarkOutline: 'border border-[var(--rule-dark)] text-cream hover:border-cream',
}

const sizes: Record<Size, string> = {
  // 44px+ tap targets throughout, thumb-friendly on mobile.
  sm: 'min-h-11 px-4 text-[0.7rem]',
  md: 'min-h-12 px-6 text-[0.72rem]',
  lg: 'min-h-13 px-7 text-[0.75rem] sm:min-h-14 sm:px-8',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
