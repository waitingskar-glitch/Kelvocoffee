/**
 * A single-day discount code.
 *
 * The window below MIRRORS the Shopify discount (Discounts → TODAY25). Shopify
 * is what actually accepts or rejects the code at checkout; this only decides
 * what the site says. Change both together, or the site will promise something
 * checkout refuses.
 *
 * It is deliberately NEVER announced in advance. The code exists to be handed
 * out on the day, at a market stall, and only works that day — saying so early
 * would invite orders that cannot be filled. So the site is silent until the
 * window opens, then says the offer is ending, never that it is coming.
 *
 * Instants are stored in UTC with their IST equivalent noted, because the
 * offer is sold as an Indian calendar day. Storing UTC means a shopper in any
 * timezone sees the same window Shopify enforces.
 */
export const offer = {
  code: 'TODAY25',
  percentOff: 25,
  /** 4 Oct 2026, 00:00:00 IST */
  startsAt: '2026-10-03T18:30:00Z',
  /** 4 Oct 2026, 23:59:59 IST */
  endsAt: '2026-10-04T18:29:59Z',
} as const

export type OfferState = 'upcoming' | 'live' | 'over'

export function offerState(now: Date = new Date()): OfferState {
  const time = now.getTime()
  if (time < Date.parse(offer.startsAt)) return 'upcoming'
  if (time > Date.parse(offer.endsAt)) return 'over'
  return 'live'
}

/**
 * Only ever true while the code actually works. "Upcoming" shows nothing:
 * the offer is never trailed ahead of the day.
 */
export function isOfferVisible(state: OfferState): boolean {
  return state === 'live'
}

/** One line for the announcement strip. */
export function offerLine(state: OfferState): string {
  return state === 'live' ? `Today only · ${offer.percentOff}% off everything with code ${offer.code}` : ''
}

/** Short form, for tight places like a product card. */
export function offerBadge(state: OfferState): string {
  return state === 'live' ? `${offer.percentOff}% off today with ${offer.code}` : ''
}
