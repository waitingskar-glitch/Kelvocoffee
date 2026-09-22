import { useId } from 'react'
import type { ProductVariant } from '@/types/shopify'
import { cn } from '@/lib/cn'

/** "50 ml - 5 servings" → "50 ml". Keeps pills readable at 320px. */
export function shortVariantLabel(title: string): string {
  return title.split(/\s+-\s+/)[0]?.trim() || title
}

/** "50 ml - 5 servings" → "5 servings", when present. */
export function variantDetail(title: string): string | null {
  const parts = title.split(/\s+-\s+/)
  return parts.length > 1 ? parts.slice(1).join(' - ').trim() : null
}

interface Props {
  variants: ProductVariant[]
  selectedId: string
  onSelect: (variantId: string) => void
  /** Accessible group name, e.g. "Size for Classic". */
  legend: string
}

/**
 * Size selector built on real radio inputs so keyboard and screen-reader
 * behaviour comes from the platform rather than being reimplemented.
 */
export function ProductVariantSelector({ variants, selectedId, onSelect, legend }: Props) {
  const name = useId()

  if (variants.length < 2) return null

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="flex w-fit flex-wrap gap-px bg-[var(--rule)]">
        {variants.map((variant) => {
          const id = `${name}-${variant.id}`
          const selected = variant.id === selectedId
          const soldOut = !variant.availableForSale

          return (
            <div key={variant.id} className="min-w-0">
              <input
                type="radio"
                id={id}
                name={name}
                value={variant.id}
                checked={selected}
                onChange={() => onSelect(variant.id)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  'label flex min-h-11 cursor-pointer items-center gap-1.5 px-4 transition-colors duration-200 ease-[var(--ease-out-soft)]',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-caramel',
                  selected
                    ? 'bg-espresso text-cream'
                    : 'bg-cream text-espresso/70 hover:text-espresso',
                )}
              >
                {shortVariantLabel(variant.title)}
                {soldOut && (
                  <span className={cn('text-[0.62rem]', selected ? 'text-cream/60' : 'text-muted')}>
                    · sold out
                  </span>
                )}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
