import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkOutline'
type Size = 'sm' | 'md' | 'lg'
type Shape = 'pill' | 'squircle'

/**
 * Buttons in Ink, all one shape: the rounded square of the hero's "Make your
 * coffee today" (a true squircle where the browser supports corner-shape).
 * Ink is the only colour type ever takes on a ground, so one solid style
 * works on paper and on all five flavour grounds.
 */
const base =
  'relative inline-flex items-center justify-center gap-2 font-sans font-bold tracking-[0.01em] select-none transition-[transform,background-color,color,box-shadow] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:shadow-[0_10px_24px_-10px_rgb(27_25_24_/_0.35)]',
  secondary: 'border-2 border-ink text-ink hover:bg-ink hover:text-paper',
  ghost: 'text-ink hover:bg-ink/[0.06]',
  onDark: 'bg-paper text-ink hover:shadow-[0_10px_24px_-10px_rgb(0_0_0_/_0.5)]',
  onDarkOutline: 'border-2 border-paper text-paper hover:bg-paper hover:text-ink',
}

const shapes: Record<Shape, string> = {
  pill: 'rounded-pill',
  // Rounded square; a true squircle where the browser supports corner-shape.
  squircle: 'shape-squircle',
}

const sizes: Record<Size, string> = {
  // 44px+ tap targets throughout.
  sm: 'min-h-11 px-5 text-[0.88rem]',
  md: 'min-h-12 px-6 text-[0.95rem]',
  lg: 'min-h-14 px-8 text-[1.02rem]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  shape?: Shape
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', shape = 'squircle', fullWidth, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], shapes[shape], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
