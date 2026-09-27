import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string | null
}

export function Field({ label, hint, error, className, ...rest }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label flex items-baseline justify-between gap-3">
        <span>{label}</span>
        {hint && <span className="font-medium tracking-normal">{hint}</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-12 shape-squircle border-2 bg-paper px-4 text-[1rem] text-ink transition-colors placeholder:text-ink/45',
          error ? 'border-whiskey' : 'border-ink',
          className,
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-[0.85rem] font-semibold">
          {error}
        </p>
      )}
    </div>
  )
}
