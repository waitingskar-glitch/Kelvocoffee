import { useEffect, useState } from 'react'
import { offerState, type OfferState } from '@/config/offer'

/**
 * The offer's current state, re-checked on a timer.
 *
 * Without the timer a tab left open across midnight would keep advertising a
 * code that checkout has already stopped accepting. Half a minute is close
 * enough for a deadline measured in days, and costs nothing.
 */
export function useOffer(): OfferState {
  const [state, setState] = useState<OfferState>(() => offerState())

  useEffect(() => {
    if (state === 'over') return
    const tick = window.setInterval(() => {
      setState((current) => {
        const next = offerState()
        return next === current ? current : next
      })
    }, 30_000)
    return () => window.clearInterval(tick)
  }, [state])

  return state
}
