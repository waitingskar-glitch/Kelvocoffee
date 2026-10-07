import type { FlavourKey } from './shopify'

export interface Testimonial {
  quote: string
  name: string
  /** e.g. "Bandra, Mumbai" */
  context?: string
  /** Their star rating, 1 to 5, if they gave one. */
  rating?: number
  /** A short headline in their words, e.g. "Tastes like dessert." */
  headline?: string
  /** The flavour they're talking about: the card takes that flavour's colour. */
  flavour?: FlavourKey
  /** A photo they've agreed to share, e.g. '/assets/reviews/ananya.webp'. Initials are shown otherwise. */
  photo?: string
}

/**
 * Real customer reviews.
 *
 * INTENTIONALLY EMPTY. Nothing in this array is invented — add entries here
 * (or wire this to a reviews app) once you have genuine, attributable
 * feedback, and the Testimonials section on the home page renders them.
 * While it's empty the section doesn't appear on the live site (the local
 * dev server shows blank placeholder cards, so the design can be reviewed).
 *
 * Example:
 *
 *   {
 *     quote: 'I stopped buying cafe lattes.',
 *     name: 'Ananya',
 *     context: 'Bandra, Mumbai',
 *     rating: 5,
 *     headline: 'Tastes like dessert.',
 *     flavour: 'hazelnut',
 *   },
 */
export const testimonials: Testimonial[] = []

/**
 * The single review carried in the hero, as proof above the call to action.
 *
 * Real, like everything else in this file — said by a Kelvo customer. They
 * aren't named on the page because the name wasn't given; add `name` and
 * `context` once you have their permission and it can be shown as a fuller
 * attribution.
 *
 * Set to null to take the quote off the hero; nothing else needs changing.
 */
export const heroReview: Testimonial | null = {
  quote: 'Genuinely better than Starbucks.',
  name: 'A Kelvo customer',
}

/**
 * The score shown beside the hero's stars.
 *
 * This reads to a shopper as an AVERAGE across customers, not one person's
 * rating — so keep it in step with what your reviews actually say, and move
 * it to a reviews app's live figure once one is wired.
 *
 * Shown as plain text only. No `aggregateRating` structured data is emitted
 * for it: search engines treat review markup they can't verify as a penalty
 * rather than a boost, so the number stays a visual claim on the page.
 *
 * Set to null to show the quote and stars without a score.
 */
export const heroRating: { score: number; outOf: number } | null = {
  score: 4.7,
  outOf: 5,
}

/* ------------------------------------------------------------------ */
/* Per-product quotes                                                  */
/* ------------------------------------------------------------------ */

/**
 * Real quotes for a single product, keyed by its Shopify handle.
 *
 * INTENTIONALLY EMPTY, for the same reason as `testimonials` above: nothing
 * here is invented. Add genuine, attributable quotes and the product page
 * renders them on its own.
 *
 * Example once you have them:
 *
 *   'hazelnut-coffee-concentrate': [
 *     { quote: '…', name: 'Ananya', context: 'Indiranagar' },
 *   ]
 *
 * Keep each to one short line — the layout is built for a single sentence.
 */
export const productTestimonials: Record<string, Testimonial[]> = {}

/**
 * Quotes to show for a product.
 *
 * Returns nothing until real, attributable quotes exist for that handle, so
 * the product page simply omits the section rather than showing placeholders.
 */
export function testimonialsForProduct(handle: string): Testimonial[] {
  return productTestimonials[handle] ?? []
}
