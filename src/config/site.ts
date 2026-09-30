/**
 * Brand, navigation, and marketing configuration.
 *
 * Copy lives here so it can be edited without touching components.
 */

const env = import.meta.env

export const site = {
  name: 'Kelvo',
  legalName: 'Kelvo Coffee',
  tagline: 'Coffee, but make it your flavour.',
  /** The document title every page restores when it unmounts. */
  defaultTitle: 'Kelvo Coffee | Flavoured Coffee Concentrate, Made in Mumbai',
  /** Set VITE_SITE_URL in production for canonical + Open Graph URLs. */
  url: (typeof env.VITE_SITE_URL === 'string' && env.VITE_SITE_URL.trim()) || 'https://kelvocoffee.in',
  city: 'Mumbai',
} as const

/**
 * The hero's left panel, where the reference runs a video.
 *
 * Until `videoSrc` is set the panel is a plain Caramel ground. To add the
 * video: put an MP4 (H.264, muted, a short loop, under ~5 MB) in
 * `public/assets/hero/` and set its path here, e.g. '/assets/hero/hero.mp4'.
 * A poster (a still from the video, WebP or JPG) shows while it loads and to
 * anyone who has asked for reduced motion.
 */
export const heroMedia = {
  videoSrc: '',
  poster: '',
} as const

export const navLinks = [
  { label: 'Shop', href: '#shop' },
  { label: 'How to Kelvo', href: '#how-to-kelvo' },
  { label: 'FAQ', href: '#faq' },
  // The story section on the landing page ("We're not coffee nerds.").
  { label: 'About', href: '#story' },
] as const

/**
 * Social links. Only channels with a real URL are rendered, so nothing
 * links to a profile that does not exist.
 */
export const socialLinks = [
  { label: 'Instagram', href: (env.VITE_SOCIAL_INSTAGRAM as string | undefined)?.trim() ?? '' },
  { label: 'WhatsApp', href: (env.VITE_SOCIAL_WHATSAPP as string | undefined)?.trim() ?? '' },
].filter((link) => link.href.length > 0)

export const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'Classic', href: '/products/classic-coffee-concentrate' },
      { label: 'Vanilla', href: '/products/vanilla-coffee-concentrate' },
      { label: 'Hazelnut', href: '/products/hazelnut-coffee-concentrate' },
      { label: 'Caramel', href: '/products/caramel-coffee-concentrate' },
      { label: 'Whiskey', href: '/products/whiskey-coffee-concentrate' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'How to Kelvo', href: '#how-to-kelvo' },
      { label: 'FAQ', href: '#faq' },
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
