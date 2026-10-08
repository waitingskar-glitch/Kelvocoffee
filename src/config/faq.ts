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
  // The doubts a first-time buyer has, in the order they come up.
  {
    question: 'Is there alcohol in the Whiskey one?',
    answer: "Nope. Not a drop. It has the taste of whiskey, but there's no alcohol in it.",
  },
  {
    question: 'Is this instant coffee?',
    answer:
      "Not quite. It's coffee concentrate. Just pour it in, add your milk, and you're done. No dissolving, no waiting.",
  },
  {
    question: 'Is it like filter coffee?',
    answer:
      "Yep, pretty much. It's our take on filter coffee, just without the filter and the wait. Classic tastes like your regular filter coffee, while the other flavours add a little something extra.",
  },
  {
    question: 'How do I make a cup?',
    // Spelled out rather than built from brand.ritual: the wording is its own
    // now, so keep the measures here in step if the ritual ever changes.
    answer:
      "Easy. Pour 10 ml of Kelvo, add 150 ml of hot or cold milk, add sugar if you want, and stir. That's it. Now drink.",
  },
  {
    question: 'How many cups is a pack?',
    answer: 'Ten millilitres makes a cup. So 50 ml is five cups and 100 ml is ten. Go stronger or lighter as you like.',
  },
  {
    question: 'How do I store it, and how long does it keep?',
    answer: `${brand.storage} ${brand.shelfLife}`,
  },
  {
    question: 'What goes into the flavours?',
    answer:
      'Nature-identical flavourings. Classic has none: it is just coffee and chicory. Every ingredient is listed on the pack and on each product page.',
  },
  {
    question: 'Which one should I start with?',
    answer:
      'Build a hamper. Pick any two flavours, or any four, for one flat price. It costs less per cup than single packs, and you find your favourite.',
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
  {
    question: "What if something's wrong with my order?",
    answer: `If it arrives damaged, or isn't what you ordered, call us on ${brand.customerCare} with your order number and we'll replace it or refund it.`,
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
    hasWhiskey ? pick('Is there alcohol in the Whiskey one?') : undefined,
    pick('Is this instant coffee?'),
    pick('Is it like filter coffee?'),
    pick('How many cups is a pack?'),
    pick('How do I make a cup?'),
    pick('What goes into the flavours?'),
    pick('How do I store it, and how long does it keep?'),
    pick('Which one should I start with?'),
    pick('What does delivery cost?'),
    pick('Do you deliver outside India?'),
    pick("What if something's wrong with my order?"),
  ].filter((item): item is FaqItem => Boolean(item))
}
