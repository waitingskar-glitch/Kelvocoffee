/**
 * Editorial imagery.
 *
 * The hero and statement images are full-bleed, so they want tall lifestyle
 * photography. None exists yet, so both fall back to product shots — which are
 * landscape and crop hard on a phone. Drop replacements in at these paths and
 * the layout picks them up with no code change.
 *
 * Wanted, roughly:
 *   hero      — portrait or square, 2000px+ on the long edge, space at the
 *               lower left for the headline to sit over
 *   statement — landscape, 2400px+, quiet enough for text to sit on top
 */
export const media = {
  hero: {
    src: '/assets/hero/hero.webp',
    fallback: '/assets/products/classic-1100.webp',
    alt: 'A Kelvo coffee concentrate pouch on a dark stone counter',
    /** Pushes the pouch right so the headline sits on empty backdrop. */
    position: '72% 50%',
  },
  statement: {
    src: '/assets/hero/statement.webp',
    fallback: '/assets/products/whiskey-1100.webp',
    alt: 'Kelvo Whiskey coffee concentrate pouch, cask-aged and alcohol-free',
    position: '68% 45%',
  },
} as const
