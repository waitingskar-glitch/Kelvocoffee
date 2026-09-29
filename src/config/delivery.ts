/**
 * Delivery within India: free at or above this order value (in rupees); below
 * it, Shopify's checkout adds a delivery charge once the address is in. Keep it
 * in step with the shipping rates set in Shopify, which decide what is charged.
 */
export const FREE_DELIVERY_FROM = 699

/** The promise, as the site words it everywhere. */
export const freeDeliveryLine = `Free delivery on orders of ₹${FREE_DELIVERY_FROM} and above`
