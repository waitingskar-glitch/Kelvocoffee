/**
 * Notify-me submissions.
 *
 * Submissions are POSTed as JSON to `VITE_PREORDER_ENDPOINT`. The shape is
 * provider-agnostic and works with Formspree, Klaviyo, Brevo, a custom API, or
 * the Shopify capture function in `serverless/interest-to-shopify.ts`, which
 * writes signups into Shopify customer records.
 *
 * With no endpoint configured the form runs in development mode: it validates,
 * logs the payload, and shows the success state so the flow can be reviewed.
 */

const endpoint = ((import.meta.env.VITE_PREORDER_ENDPOINT as string | undefined) ?? '').trim()

export const isInterestEndpointConfigured = endpoint.length > 0

export interface InterestSubmission {
  name: string
  email: string
  phone?: string
  /** "restock" for a sold-out product, "interest" for something not launched. */
  intent: 'restock' | 'interest'
  productHandle: string
  productTitle: string
  variantId?: string
}

export class InterestError extends Error {
  readonly userMessage: string
  constructor(userMessage: string, technical?: string) {
    super(technical ?? userMessage)
    this.name = 'InterestError'
    this.userMessage = userMessage
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'Please enter your email address.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'That email address does not look right.'
  return null
}

export function validateName(name: string): string | null {
  return name.trim().length ? null : 'Please tell us your name.'
}

export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null // optional
  const digits = trimmed.replace(/[\s\-()+]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return 'That phone number does not look right.'
  return null
}

export async function submitInterest(submission: InterestSubmission): Promise<void> {
  const payload = {
    ...submission,
    name: submission.name.trim(),
    email: submission.email.trim(),
    phone: submission.phone?.trim() || undefined,
    source: 'kelvo-storefront',
    submittedAt: new Date().toISOString(),
  }

  if (!isInterestEndpointConfigured) {
    // Development mode. Replace by setting VITE_PREORDER_ENDPOINT.
    console.info('[kelvo] Interest submission (no endpoint configured):', payload)
    await new Promise((resolve) => setTimeout(resolve, 550))
    return
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    throw new InterestError(
      "We couldn't reach us just then. Please check your connection and try again.",
      String(error),
    )
  }

  if (!response.ok) {
    throw new InterestError(
      "That didn't go through. Please try again in a moment.",
      `Interest endpoint responded ${response.status}`,
    )
  }
}
