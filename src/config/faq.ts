import { brand } from './brand'
import type { FlavourKey } from './shopify'
import { DELIVERY_CHARGE, FREE_DELIVERY_FROM } from './delivery'

/**
 * Frequently asked questions, in brand voice.
 *
 * Every answer is checked against the brand book or the live store's own
 * settings. The book bans "natural", "small-batch", origins and tasting
 * notes, and bans health claims outright, so none appear here.
 */

export interface FaqItem {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: 'Is this instant coffee?',
    answer:
      "No. It's a liquid concentrate: 80% coffee, 20% chicory. You pour it, you don't dissolve it.",
  },
  {
    question: 'How do I make a cup?',
    answer: `${brand.ritual[0].copy} ${brand.ritual[1].copy} ${brand.ritual[2].copy} Hot or cold, your call.`,
  },
  {
    question: 'How many cups is a pack?',
    answer: 'Ten millilitres makes a cup. So 50 ml is five cups and 100 ml is ten. Go stronger or lighter as you like.',
  },
  {
    question: 'How do I store it?',
    answer: `${brand.storage} ${brand.shelfLife}`,
  },
  {
    question: 'Which one should I start with?',
    answer: 'Build a hamper. Pick any two flavours, or any four, for one flat price, and find your favourite.',
  },
  {
    question: 'Is there alcohol in the Whiskey one?',
    answer: 'None at all. It tastes like whiskey. It is not whiskey.',
  },
  {
    question: 'What goes into the flavours?',
    answer:
      'Nature-identical flavourings. Classic has none: it is just coffee and chicory. Every ingredient is listed on the pack and on each product page.',
  },
  {
    question: 'What does delivery cost?',
    answer:
      `Nothing on orders of ₹${FREE_DELIVERY_FROM} and above, anywhere in India. Below that, delivery is a flat ₹${DELIVERY_CHARGE}, added at checkout.`,
  },
  {
    question: 'Do you deliver outside India?',
    answer: "Yes, to a set of countries. It's charged separately and the cost shows at checkout once you add your address.",
  },
]

/**
 * The questions worth answering on a product page, taken from the list above
 * (no new answers). The Whiskey question only appears on the Whiskey page.
 */
export function faqsForProduct(flavour: FlavourKey): FaqItem[] {
  const pick = (question: string) => faqs.find((item) => item.question === question)
  const hasWhiskey = flavour === 'whiskey'
  return [
    pick('Is this instant coffee?'),
    pick('How many cups is a pack?'),
    pick('How do I make a cup?'),
    hasWhiskey ? pick('Is there alcohol in the Whiskey one?') : undefined,
    pick('What goes into the flavours?'),
    pick('How do I store it?'),
    pick('Which one should I start with?'),
    pick('What does delivery cost?'),
    pick('Do you deliver outside India?'),
  ].filter((item): item is FaqItem => Boolean(item))
}
