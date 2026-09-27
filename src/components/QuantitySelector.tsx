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
    'grid size-11 place-items-center shape-squircle transition-colors duration-150 hover:bg-ink/[0.08] disabled:cursor-not-allowed disabled:hover:bg-transparent'

  return (
    <div
      className={cn(
        'inline-flex items-center shape-squircle border-2 border-ink bg-paper',
        disabled && 'opacity-60',
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(quantity - 1)}
        disabled={disabled || busy}
        aria-label={quantity === 1 ? `Remove ${itemLabel}` : `Decrease quantity of ${itemLabel}`}
      >
        <MinusIcon className="size-4" />
      </button>

      <span className="index-mark grid min-w-8 place-items-center text-[1rem] font-bold">
        {busy ? <Spinner className="size-3" /> : quantity}
      </span>

      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || busy || quantity >= max}
        aria-label={`Increase quantity of ${itemLabel}`}
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}
