export interface Testimonial {
  quote: string
  name: string
  /** e.g. "Indiranagar, Bengaluru" */
  context: string
}

/**
 * Real customer reviews.
 *
 * INTENTIONALLY EMPTY. Nothing in this array is invented — add entries here
 * (or wire this to a reviews app) once you have genuine, attributable
 * feedback, and the section renders them automatically.
 */
export const testimonials: Testimonial[] = []

/**
 * Sample entries used to preview the layout during development only.
 *
 * These are clearly labelled as samples in the UI and are never rendered in a
 * production build. Delete this array once `testimonials` is populated.
 */
export const sampleTestimonials: Testimonial[] = [
  {
    quote: 'Replace this with a real quote from a real customer. Keep it to a sentence or two.',
    name: 'Customer name',
    context: 'Neighbourhood, city',
  },
  {
    quote: 'Second sample quote. Short, specific and in the customer’s own words works best.',
    name: 'Customer name',
    context: 'Neighbourhood, city',
  },
  {
    quote: 'Third sample quote. Swap all three before this page goes live.',
    name: 'Customer name',
    context: 'Neighbourhood, city',
  },
]
