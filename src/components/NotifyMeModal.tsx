import { useEffect, useState } from 'react'
import {
  submitInterest,
  validateEmail,
  validateName,
  validatePhone,
  InterestError,
  isInterestEndpointConfigured,
} from '@/services/interest'
import type { Product, ProductVariant } from '@/types/shopify'
import { Overlay } from './ui/Overlay'
import { Button } from './ui/Button'
import { Field } from './ui/Field'
import { Spinner } from './ui/Spinner'
import { CloseIcon, CheckIcon } from './ui/icons'

export interface NotifyTarget {
  /** Null when the product does not exist in Shopify yet (e.g. the trial pack). */
  product: Product | null
  variant?: ProductVariant
  /** Display name used in the copy. */
  title: string
  handle: string
  intent: 'preorder' | 'interest'
}

interface Props {
  target: NotifyTarget | null
  onClose: () => void
}

type Status = 'idle' | 'submitting' | 'done'

/**
 * Reusable preorder / notify-me capture.
 *
 * Used for any product Shopify reports as unavailable, and for products that
 * do not exist in the store yet. Posts to `VITE_PREORDER_ENDPOINT`; see
 * `src/services/interest.ts`.
 */
export function NotifyMeModal({ target, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  // Reset whenever a different product opens the modal.
  useEffect(() => {
    if (target) {
      setName('')
      setEmail('')
      setPhone('')
      setErrors({})
      setStatus('idle')
      setFormError(null)
    }
  }, [target])

  if (!target) return null

  const isPreorder = target.intent === 'preorder'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!target) return

    const nextErrors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validatePhone(phone) ?? undefined,
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email || nextErrors.phone) return

    setStatus('submitting')
    setFormError(null)
    try {
      await submitInterest({
        name,
        email,
        phone: phone || undefined,
        intent: target.intent,
        productHandle: target.handle,
        productTitle: target.title,
        variantId: target.variant?.id,
      })
      setStatus('done')
    } catch (caught) {
      setStatus('idle')
      setFormError(
        caught instanceof InterestError
          ? caught.userMessage
          : "That didn't go through. Please try again in a moment.",
      )
    }
  }

  return (
    <Overlay
      open
      onClose={onClose}
      labelledById="notify-heading"
      describedById="notify-description"
      panelClassName="animate-scale-in inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-xl bg-cream p-6 shadow-lift sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:w-[27rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow font-semibold text-caramel uppercase">
            {isPreorder ? 'Preorder' : 'Early access'}
          </p>
          <h2 id="notify-heading" className="mt-3 font-display text-[1.6rem] leading-tight text-espresso">
            {status === 'done' ? "You're on the list." : `Be first to get ${target.title}.`}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-pill text-espresso transition-colors hover:bg-espresso/[0.06]"
          aria-label="Close"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      {status === 'done' ? (
        <div className="mt-5">
          <p id="notify-description" className="text-[0.95rem] leading-relaxed text-muted">
            We&rsquo;ll let you know the moment it&rsquo;s ready. No newsletter, no noise.
          </p>
          <div className="mt-6 flex items-center gap-2.5 rounded-md border border-gold/40 bg-cream-deep px-4 py-3 text-[0.88rem] text-espresso">
            <CheckIcon className="size-4 shrink-0 text-caramel" />
            Saved against {target.title}.
          </div>
          <Button fullWidth size="lg" className="mt-6" onClick={onClose}>
            Back to shopping
          </Button>
          {!isInterestEndpointConfigured && <DevNotice />}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5">
          <p id="notify-description" className="text-[0.93rem] leading-relaxed text-muted">
            {isPreorder
              ? `${target.title} is not in stock right now. Leave your details and we'll reserve you one when it's back.`
              : `${target.title} isn't out yet. Leave your details and you'll hear before anyone else.`}
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <Field
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              autoComplete="name"
              placeholder="Your name"
              required
            />
            <Field
              label="Email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <Field
              label="Phone"
              hint="Optional"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              error={errors.phone}
              autoComplete="tel"
              placeholder="For delivery updates"
            />
          </div>

          {formError && (
            <p role="alert" className="mt-4 text-[0.85rem] text-[#a4442c]">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" className="mt-6" disabled={status === 'submitting'}>
            {status === 'submitting' ? (
              <>
                <Spinner />
                Adding you…
              </>
            ) : (
              'Notify me'
            )}
          </Button>

          <p className="mt-3 text-center text-[0.74rem] text-muted">
            We only use this to tell you about {target.title}.
          </p>

          {!isInterestEndpointConfigured && <DevNotice />}
        </form>
      )}
    </Overlay>
  )
}

/** Visible only in development, so nobody ships this thinking it's connected. */
function DevNotice() {
  if (!import.meta.env.DEV) return null
  return (
    <p className="mt-5 rounded-md border border-dashed border-caramel/50 px-3 py-2 text-[0.72rem] leading-relaxed text-caramel">
      Development mode: no <code>VITE_PREORDER_ENDPOINT</code> configured, so this submission was
      logged to the console instead of being sent.
    </p>
  )
}
