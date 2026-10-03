/**
 * A dated discount code, shown across the site while it is worth showing.
 *
 * The window below MIRRORS the Shopify discount (Discounts → TODAY25). Shopify
 * is what actually accepts or rejects the code at checkout; this only decides
 * what the site says. Change both together, or the site will promise something
 * checkout refuses.
 *
 * Instants are stored in UTC and written with their IST equivalent alongside,
 * because the offer is sold as an Indian calendar day. Storing UTC means a
 * shopper in another timezone sees the same window a Mumbai shopper does,
 * which is the window Shopify enforces.
 */
export const offer = {
  code: 'TODAY25',
  percentOff: 25,
  /** 4 Oct 2026, 00:00:00 IST */
  startsAt: '2026-10-03T18:30:00Z',
  /** 4 Oct 2026, 23:59:59 IST */
  endsAt: '2026-10-04T18:29:59Z',
  /** How the day is named in copy. */
  day: '4 October',
} as const

export type OfferState = 'upcoming' | 'live' | 'over'

export function offerState(now: Date = new Date()): OfferState {
  const time = now.getTime()
  if (time < Date.parse(offer.startsAt)) return 'upcoming'
  if (time > Date.parse(offer.endsAt)) return 'over'
  return 'live'
}

/** True whenever the offer is worth putting in front of someone. */
export function isOfferVisible(state: OfferState): boolean {
  return state === 'upcoming' || state === 'live'
}

/** One line for the announcement strip. */
export function offerLine(state: OfferState): string {
  if (state === 'live') return `Today only · ${offer.percentOff}% off everything with code ${offer.code}`
  if (state === 'upcoming') return `${offer.percentOff}% off everything on ${offer.day} with code ${offer.code}`
  return ''
}

/** Short form, for tight places like a product card. */
export function offerBadge(state: OfferState): string {
  if (state === 'live') return `${offer.percentOff}% off today with ${offer.code}`
  if (state === 'upcoming') return `${offer.percentOff}% off on ${offer.day} with ${offer.code}`
  return ''
}
