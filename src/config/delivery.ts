/**
 * Delivery within India: free at or above FREE_DELIVERY_FROM (in rupees), a
 * flat DELIVERY_CHARGE below it. These mirror the shipping rates in Shopify
 * (General profile → Domestic: "Free delivery" from ₹399, "Standard delivery"
 * ₹20 up to ₹398.99), which decide what checkout actually charges: change
 * both together.
 */
export const FREE_DELIVERY_FROM = 399
export const DELIVERY_CHARGE = 20

/** The promise, as the site words it everywhere. */
export const freeDeliveryLine = `Free delivery on orders of ₹${FREE_DELIVERY_FROM} and above`
