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
    answer:
      '10 ml makes one cup. So 50 ml gives you 5 cups, and 100 ml gives you 10. Want it stronger? Just pour a little more.',
  },
  {
    question: 'How do I store it, and how long does it keep?',
    // Said in its own words rather than from brand.storage/shelfLife. Those
    // still set the formal line on each product page, so keep the two in step.
    answer:
      "Pop it in the fridge once you open it. It's good for 6 months from when it's made, and once opened, try to finish it within 10 days.",
  },
  {
    question: 'What goes into the flavours?',
    answer:
      'Just the good stuff. Classic is simply coffee and chicory. The other flavours use nature-identical flavouring, and you can find the full ingredient list on every pack.',
  },
  {
    question: 'Which one should I start with?',
    answer:
      "Can't decide? Start with a hamper. Pick any 2 or 4 flavours, mix them up, and find your favourite. You also get more cups for your money.",
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
