import { Spinner } from './ui/Spinner'
import { MinusIcon, PlusIcon } from './ui/icons'
import { cn } from '@/lib/cn'

interface Props {
  quantity: number
  onChange: (quantity: number) => void
  disabled?: boolean
  busy?: boolean
  /** Used to build accessible labels, e.g. "Classic, 50 ml". */
  itemLabel: string
  max?: number
}

/** Stepper with 40px targets and a live-updating readout. */
export function QuantitySelector({
  quantity,
  onChange,
  disabled,
  busy,
  itemLabel,
  max = 99,
}: Props) {
  const buttonClass =
    'grid size-10 place-items-center text-espresso transition-colors duration-150 hover:bg-espresso/[0.06] disabled:opacity-35 disabled:hover:bg-transparent'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-pill border border-sand-deep bg-cream',
        disabled && 'opacity-60',
      )}
    >
      <button
        type="button"
        className={cn(buttonClass, 'rounded-l-pill')}
        onClick={() => onChange(quantity - 1)}
        disabled={disabled || busy}
        aria-label={quantity === 1 ? `Remove ${itemLabel}` : `Decrease quantity of ${itemLabel}`}
      >
        <MinusIcon className="size-4" />
      </button>

      <span className="tnum grid min-w-8 place-items-center text-[0.88rem] font-medium text-espresso">
        {busy ? <Spinner className="size-3" /> : quantity}
      </span>

      <button
        type="button"
        className={cn(buttonClass, 'rounded-r-pill')}
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || busy || quantity >= max}
        aria-label={`Increase quantity of ${itemLabel}`}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}
