import type { FlavourKey } from './shopify'

/**
 * Brand facts, from Kelvo Brand Guidelines Ed. 01/2026.
 *
 * One source for everything the pack says, so the site can never drift from
 * it. The book is the authority on wording: change it there first.
 */

export const brand = {
  oneLine: 'Coffee, but make it your flavour.',
  descriptor: ['Flavoured coffee', 'concentrate'] as const,

  /** Back-of-pack story. Verbatim on pack; under 45 words anywhere else. */
  story:
    "We're not coffee nerds. We don't care about roast profiles or tasting notes. We just got bored of coffee tasting like… coffee. So we thought, why not add flavours? That's how Kelvo was born: our take on filter coffee, familiar but way more fun.",

  /** Three steps, always three, always in this language. */
  ritual: [
    { step: 'Pour', copy: 'Add 10 ml Kelvo.' },
    { step: 'Mix', copy: 'Add 150 ml hot or cold milk and sugar.' },
    { step: 'Enjoy', copy: 'Stir. Sip. Repeat.' },
  ] as const,

  composition: 'Coffee (80%), Chicory (20%)',
  cupRatio: '10 ml = 1 cup',
  storage: 'Refrigerate after opening.',
  shelfLife: 'Best before 6 months from date of manufacture. Consume within 10 days of opening.',

  customerCare: '+91 91366 26006',
  licence: 'Lic. No. 1151803000241',
} as const

/** kcal per 100 ml, from the spec table in section 12. */
export const kcalPer100ml: Record<FlavourKey, number> = {
  classic: 65.8,
  vanilla: 44.4,
  caramel: 44.4,
  hazelnut: 44.4,
  whiskey: 44.4,
}

/**
 * Ingredients, worded exactly as the book mandates. The bracketed flavour
 * is the only variable, and Classic carries no flavouring bracket at all.
 * The flavourings are nature-identical and must never be called "natural".
 */
export function ingredientsFor(key: FlavourKey, name: string): string {
  const flavouring = key === 'classic' ? '' : ` Nature Identical Flavouring Substance (${name}),`
  return `Coffee (80%), Chicory (20%), Water,${flavouring} Food Grade Preservative (E211).`
}
