import type { Money } from '@/types/shopify'

const formatters = new Map<string, Intl.NumberFormat>()

function formatterFor(currencyCode: string): Intl.NumberFormat {
  let formatter = formatters.get(currencyCode)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })
    formatters.set(currencyCode, formatter)
  }
  return formatter
}

/** ₹150 — whole rupees, no trailing zeros, grouped Indian-style. */
export function formatMoney(money: Money): string {
  return formatterFor(money.currencyCode).format(money.amount)
}

/**
 * "about ₹40 a cup": a price spread over the cups in it (10 ml makes a cup),
 * rounded to the rupee. Null if there are no cups to spread it over.
 */
export function perCup(price: Money, cups: number): string | null {
  if (!(cups > 0)) return null
  return `about ${formatterFor(price.currencyCode).format(Math.round(price.amount / cups))} a cup`
}

/** Cups in a pack, from the millilitres in its name ("50 ml - 5 servings" → 5). Ten millilitres makes a cup. */
export function cupsIn(title: string): number {
  const ml = Number(title.match(/(\d+)\s*ml/i)?.[1])
  return Number.isFinite(ml) ? ml / 10 : 0
}

export function formatAmount(amount: number, currencyCode = 'INR'): string {
  return formatterFor(currencyCode).format(amount)
}
