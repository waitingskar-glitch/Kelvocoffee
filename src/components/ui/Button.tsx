import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkOutline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-[-0.005em] transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-[var(--ease-out-soft)] select-none disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px'

const variants: Record<Variant, string> = {
  primary:
    'bg-espresso text-cream shadow-subtle hover:bg-coffee hover:shadow-card disabled:hover:bg-espresso',
  secondary:
    'border border-espresso/20 bg-transparent text-espresso hover:border-espresso/45 hover:bg-espresso/[0.04]',
  ghost: 'text-espresso hover:bg-espresso/[0.06]',
  onDark: 'bg-cream text-espresso shadow-subtle hover:bg-white',
  onDarkOutline: 'border border-cream/30 text-cream hover:border-cream/60 hover:bg-cream/10',
}

const sizes: Record<Size, string> = {
  // 44px+ tap targets on every size — thumb-friendly on mobile.
  sm: 'min-h-11 px-4 text-[0.85rem]',
  md: 'min-h-12 px-6 text-[0.925rem]',
  lg: 'min-h-13 px-7 text-[0.975rem] sm:min-h-14 sm:px-8 sm:text-base',
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
