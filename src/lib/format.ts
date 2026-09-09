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

export function formatAmount(amount: number, currencyCode = 'INR'): string {
  return formatterFor(currencyCode).format(amount)
}
