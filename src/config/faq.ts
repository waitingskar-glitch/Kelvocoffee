import { brand, OPEN_WINDOW_DAYS, SHELF_LIFE_MONTHS } from './brand'
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
    // Worded for the FAQ rather than reusing brand.storage/shelfLife, but the
    // figures come from where those do, so this can't drift from the Storage
    // and Shelf life lines on the product pages.
    answer: `No fridge needed — room temperature is fine. It's good for ${SHELF_LIFE_MONTHS} months from when it's made, and once opened, try to finish it within ${OPEN_WINDOW_DAYS} days.`,
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
      `Free if your order is ₹${FREE_DELIVERY_FROM} or more. Below that, it's a flat ₹${DELIVERY_CHARGE}. Simple.`,
  },
  {
    question: 'Do you deliver outside India?',
    answer:
      'Yep, we do. We deliver to select countries outside India. Shipping is calculated at checkout once you add your address.',
  },
  {
    question: "What if something's wrong with my order?",
    answer: `Don't worry, we'll sort it out. If your order arrives damaged or something's missing, call us on ${brand.customerCare} with your order number. We'll replace it or refund it.`,
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
