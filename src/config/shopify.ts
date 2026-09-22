/**
 * Single source of truth for Shopify configuration.
 *
 * Nothing here is a secret: the Storefront API token is a public, read-only,
 * domain-scoped token designed to ship in client bundles. The Admin API token
 * must NEVER appear in this project.
 *
 * Copy `.env.example` to `.env` and fill these in.
 */

const env = import.meta.env

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const shopifyConfig = {
  /** e.g. "9pqz72-rg.myshopify.com" */
  storeDomain: clean(env.VITE_SHOPIFY_STORE_DOMAIN),
  /** Public Storefront API access token. */
  storefrontToken: clean(env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN),
  apiVersion: clean(env.VITE_SHOPIFY_API_VERSION) || '2025-07',
  /** ISO country code used for market/currency resolution. */
  countryCode: clean(env.VITE_SHOPIFY_COUNTRY_CODE) || 'IN',
  languageCode: clean(env.VITE_SHOPIFY_LANGUAGE_CODE) || 'EN',
} as const

/**
 * Product handles, resolved from Shopify at runtime.
 *
 * Handles are used rather than raw product/variant IDs so the storefront keeps
 * working if a product is recreated. Override any of them via env if the
 * handles change in the Shopify admin.
 */
export const productHandles = {
  classic: clean(env.VITE_HANDLE_CLASSIC) || 'classic-coffee-concentrate',
  vanilla: clean(env.VITE_HANDLE_VANILLA) || 'vanilla-coffee-concentrate',
  hazelnut: clean(env.VITE_HANDLE_HAZELNUT) || 'hazelnut-coffee-concentrate',
  caramel: clean(env.VITE_HANDLE_CARAMEL) || 'caramel-coffee-concentrate',
  whiskey: clean(env.VITE_HANDLE_WHISKEY) || 'whiskey-coffee-concentrate',
  /** Set via VITE_HANDLE_TRIAL_PACK; live in Shopify as `kelvo-trial-pack`. */
  trialPack: clean(env.VITE_HANDLE_TRIAL_PACK),
} as const

/** The order flavours appear in the shop grid. */
export const shopOrder = ['classic', 'vanilla', 'hazelnut', 'caramel', 'whiskey'] as const
export type FlavourKey = (typeof shopOrder)[number]

/**
 * True when a live Storefront connection is configured. When false the site
 * runs in preview mode: it renders the seed catalog and keeps the cart in the
 * browser so the page can be reviewed, but cannot reach Shopify checkout.
 */
export const isShopifyConfigured: boolean = Boolean(
  shopifyConfig.storeDomain && shopifyConfig.storefrontToken,
)

export const storefrontEndpoint = shopifyConfig.storeDomain
  ? `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`
  : ''
