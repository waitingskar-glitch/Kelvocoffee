/**
 * Brand, navigation, and marketing configuration.
 *
 * Copy lives here so it can be edited without touching components.
 */

const env = import.meta.env

export const site = {
  name: 'Kelvo',
  legalName: 'Kelvo Coffee',
  tagline: 'Flavoured filter coffee, reimagined',
  /** Set VITE_SITE_URL in production for canonical + Open Graph URLs. */
  url: (typeof env.VITE_SITE_URL === 'string' && env.VITE_SITE_URL.trim()) || 'https://kelvocoffee.com',
  city: 'Bengaluru',
  email: (typeof env.VITE_CONTACT_EMAIL === 'string' && env.VITE_CONTACT_EMAIL.trim()) || 'hello@kelvocoffee.com',
} as const

export const navLinks = [
  { label: 'Shop', href: '#shop' },
  { label: 'Flavours', href: '#shop' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Our story', href: '#story' },
] as const

/**
 * Social links. Only channels with a real URL are rendered, so nothing
 * links to a profile that does not exist.
 */
export const socialLinks = [
  { label: 'Instagram', href: (env.VITE_SOCIAL_INSTAGRAM as string | undefined)?.trim() ?? '' },
  { label: 'WhatsApp', href: (env.VITE_SOCIAL_WHATSAPP as string | undefined)?.trim() ?? '' },
].filter((link) => link.href.length > 0)

/**
 * Trial Pack presentation.
 *
 * The product is live in Shopify as `kelvo-trial-pack`, so price and
 * availability come from there. Only the flavour chips and copy live here.
 */
export const trialPack = {
  name: 'The Kelvo Trial Pack',
  pouches: 4,
  volumeMl: 50,
  /** Fallback display price used only until the Shopify product is connected. */
  fallbackPrice: 400,
  currency: 'INR',
  /** Must match what's physically in the box — and the pack photography. */
  flavourKeys: ['vanilla', 'whiskey', 'hazelnut', 'caramel'] as const,
} as const

/**
 * Preorder disclosure.
 *
 * When Shopify reports a variant as purchasable but out of stock, the site
 * sells it as a preorder — and says so, everywhere the shopper can see:
 * on the button, on the card, in the cart, and on the order line itself.
 *
 * Set VITE_PREORDER_SHIP_ESTIMATE to a real dispatch window (e.g.
 * "mid-November") as soon as you have one. Taking payment is only fair if the
 * customer knows what they are waiting for.
 */
export const preorder = {
  shipEstimate: ((env.VITE_PREORDER_SHIP_ESTIMATE as string | undefined) ?? '').trim(),
} as const

export function preorderNote(): string {
  return preorder.shipEstimate
    ? `Preorder · ships ${preorder.shipEstimate}`
    : "Preorder · we'll email your dispatch date"
}

export const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'All coffee', href: '#shop' },
      { label: 'Trial pack', href: '#trial-pack' },
      { label: 'Bundles', href: '#trial-pack' },
      { label: 'Gift hampers', href: '#trial-pack' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Our story', href: '#story' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'FAQ', href: '#how-it-works' },
      { label: 'Contact', href: `mailto:${site.email}` },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/policies/privacy-policy' },
      { label: 'Terms of service', href: '/policies/terms-of-service' },
      { label: 'Shipping policy', href: '/policies/shipping-policy' },
      { label: 'Refund policy', href: '/policies/refund-policy' },
    ],
  },
] as const
