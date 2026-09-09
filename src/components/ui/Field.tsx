import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  /** Rendered next to the label, e.g. "Optional". */
  hint?: string
  error?: string | null
}

/** Labelled text input with inline validation messaging wired to aria. */
export function Field({ label, hint, error, className, ...rest }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.8rem] font-medium text-espresso">
        <span>{label}</span>
        {hint && <span className="text-[0.72rem] font-normal text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'min-h-12 rounded-md border bg-cream px-3.5 text-[0.95rem] text-espresso transition-colors duration-150 placeholder:text-muted/60',
          error ? 'border-[#a4442c]' : 'border-sand-deep hover:border-coffee-light/60 focus:border-caramel',
          className,
        )}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-[0.78rem] text-[#a4442c]">
          {error}
        </p>
      )}
    </div>
  )
}
