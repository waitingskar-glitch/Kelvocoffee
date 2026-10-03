import { useEffect, useRef, useState } from 'react'
import { offer, offerBadge, isOfferVisible } from '@/config/offer'
import { useOffer } from '@/hooks/useOffer'
import { cn } from '@/lib/cn'

/**
 * The dated discount, said once wherever it is relevant.
 *
 * `inline` is a single line for a product card; `panel` is the fuller note for
 * the cart, where the code is about to be needed. Both state the code as
 * selectable text as well as offering a copy button, so the offer still works
 * if the clipboard is unavailable or refused.
 */
export function OfferNote({ variant = 'inline' }: { variant?: 'inline' | 'panel' }) {
  const state = useOffer()
  // Nothing at all before the day: the code is handed out in person, and
  // trailing it early would take orders that cannot be filled.
  if (!isOfferVisible(state)) return null

  return variant === 'panel' ? <OfferPanel /> : <OfferInline text={offerBadge(state)} />
}

function OfferInline({ text }: { text: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-[0.92rem] leading-snug font-semibold">
      {/* A mark as well as a colour: the note must not read as decoration. */}
      <span aria-hidden="true" className="inline-block size-2 shrink-0 rounded-full bg-caramel" />
      {text}
    </p>
  )
}

function OfferPanel() {
  return (
    <div className="mt-5 rounded-xl border-2 border-ink p-4 shape-squircle">
      <p className="label text-ink/70">Today only</p>
      <p className="mt-1.5 text-[0.98rem] leading-snug font-semibold">
        {offer.percentOff}% off your whole order
      </p>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-ink/70">
        Enter the code at checkout. It expires at midnight tonight.
      </p>
      <CopyCode />
    </div>
  )
}

function CopyCode() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(offer.code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard blocked or unavailable — the code is on screen to type.
      setCopied(false)
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <code className="tnum flex-1 rounded-lg border-2 border-dashed border-ink/35 px-3 py-2 text-center font-display text-[1.1rem] tracking-[0.12em] select-all">
        {offer.code}
      </code>
      <button
        type="button"
        onClick={copy}
        className={cn(
          'min-h-11 shrink-0 rounded-lg border-2 border-ink px-3.5 text-[0.82rem] font-semibold shape-squircle',
          'transition-colors duration-200 hover:bg-ink hover:text-paper',
        )}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {/* Announced rather than relying on the button's label changing colour. */}
      <span aria-live="polite" className="sr-only">
        {copied ? `Discount code ${offer.code} copied` : ''}
      </span>
    </div>
  )
}
