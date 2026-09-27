import { useId } from 'react'
import type { ProductVariant } from '@/types/shopify'
import { cn } from '@/lib/cn'

/** "50 ml - 5 servings" → "50 ml". */
export function shortVariantLabel(title: string): string {
  return title.split(/\s+-\s+/)[0]?.trim() || title
}

/** "50 ml - 5 servings" → "5 cups". The pack's own word is cups. */
export function variantDetail(title: string): string | null {
  const parts = title.split(/\s+-\s+/)
  if (parts.length < 2) return null
  return parts.slice(1).join(' - ').trim().replace(/servings?/i, (m) => (m.endsWith('s') ? 'cups' : 'cup'))
}

interface Props {
  variants: ProductVariant[]
  selectedId: string
  onSelect: (variantId: string) => void
  legend: string
}

/** Size pills built on real radio inputs, so keyboard behaviour is native. */
export function ProductVariantSelector({ variants, selectedId, onSelect, legend }: Props) {
  const name = useId()
  if (variants.length < 2) return null

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const id = `${name}-${variant.id}`
          const selected = variant.id === selectedId
          return (
            <div key={variant.id}>
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
                  'flex min-h-11 cursor-pointer items-center gap-1.5 shape-squircle border-2 border-ink px-4 text-[0.92rem] font-bold transition-colors',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
                  selected ? 'bg-ink text-paper' : 'hover:bg-ink/[0.08]',
                  !variant.availableForSale && 'line-through',
                )}
              >
                {shortVariantLabel(variant.title)}
                {!variant.availableForSale && <span className="sr-only">(sold out)</span>}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
