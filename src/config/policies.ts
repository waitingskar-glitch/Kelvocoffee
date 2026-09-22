import { site } from './site'

/**
 * Legal pages.
 *
 * THESE ARE SCAFFOLDS, NOT LEGAL ADVICE. The headings are the ones an Indian
 * D2C store is normally expected to cover, and anything describing Kelvo's own
 * stated practice (dispatch, the cancellation promise) is real.
 * Everything marked TO CONFIRM is a decision only you can make.
 *
 * Two ways to finish these:
 *
 * 1. Shopify admin -> Settings -> Policies generates full templates for free.
 *    Paste the rendered text from there into the sections below.
 * 2. Have a lawyer review, then paste the final text here.
 *
 * Set `isDraft: false` on a policy once its text is final. That removes the
 * warning banner from the page.
 */

export interface PolicySection {
  heading: string
  /** Each string is a paragraph. Items starting with "- " render as a list. */
  body: string[]
}

export interface Policy {
  handle: string
  title: string
  /** One line under the title. */
  summary: string
  /** Shows the draft warning to visitors while true. */
  isDraft: boolean
  lastUpdated: string
  sections: PolicySection[]
}

const CONTACT: PolicySection = {
  heading: 'Contact us',
  body: [
    `Questions about this policy can go to ${site.email}, and we aim to reply within two working days.`,
    'TO CONFIRM: add your registered business name, full postal address and a contact phone number. Indian e-commerce rules require these to be clearly published.',
  ],
}

export const policies: Policy[] = [
  {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'What we collect when you shop with us, and what we do with it.',
    isDraft: true,
    lastUpdated: 'Not yet published',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you place an order we collect your name, email address, delivery address, phone number and order details.',
          'Payment is handled by Shopify and its payment providers. We never see or store your full card details.',
          'If you join a notify-me list we store the email address and the product you asked about, and nothing else.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To process and deliver your order, to contact you about that order, and to answer your questions.',
          'To send marketing email only where you have opted in. Every marketing email carries an unsubscribe link.',
          'TO CONFIRM: list any analytics or advertising tools you use and what they collect. This site currently uses cookieless visitor analytics that does not identify individuals.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Shopify, which runs our store, checkout and payments.',
          'TO CONFIRM: name your delivery partners, email provider and any other processor that touches customer data.',
          'We do not sell your personal information.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'TO CONFIRM: state your retention period. Order records usually need keeping for a set number of years for tax purposes; marketing contacts should be kept only while consent stands.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask us for a copy of the personal data we hold about you, ask us to correct it, or ask us to delete it.',
          `Write to ${site.email} and we will respond within the period required by law.`,
          'TO CONFIRM: India’s Digital Personal Data Protection Act sets specific obligations, including naming a contact for grievances. Confirm your obligations before publishing.',
        ],
      },
      { heading: 'Cookies', body: ['TO CONFIRM: describe the cookies your store sets, including any set by Shopify checkout, and how a visitor can refuse non-essential ones.'] },
      CONTACT,
    ],
  },

  {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    summary: 'The agreement between you and Kelvo when you buy from us.',
    isDraft: true,
    lastUpdated: 'Not yet published',
    sections: [
      {
        heading: 'About these terms',
        body: [
          `These terms apply when you buy from ${site.legalName}. By placing an order you accept them.`,
          'TO CONFIRM: add your registered entity name, GSTIN and registered address.',
        ],
      },
      {
        heading: 'Orders',
        body: [
          'An order is an offer to buy. A contract forms when we confirm your order by email.',
          'We may decline or cancel an order, refunding you in full, if a product is unavailable or if there has been a pricing error.',
        ],
      },
      {
        heading: 'Prices and payment',
        body: [
          'Prices are shown in Indian rupees. TO CONFIRM: state whether prices include GST, and how shipping is charged.',
          'Payment is taken through Shopify at checkout.',
        ],
      },
      {
        heading: 'Using this site',
        body: [
          'Do not misuse this site, attempt to disrupt it, or use its content commercially without our permission.',
          'The Kelvo name, branding, photography and copy belong to us.',
        ],
      },
      {
        heading: 'Our responsibility to you',
        body: [
          'TO CONFIRM: this clause limits your liability and must be drafted or reviewed by a lawyer. Do not publish generic wording here.',
        ],
      },
      {
        heading: 'Governing law',
        body: ['TO CONFIRM: name the governing law and the courts that have jurisdiction.'],
      },
      CONTACT,
    ],
  },

  {
    handle: 'shipping-policy',
    title: 'Shipping Policy',
    summary: 'Where we deliver, how long it takes, and what it costs.',
    isDraft: true,
    lastUpdated: 'Not yet published',
    sections: [
      {
        heading: 'Where we deliver',
        body: ['TO CONFIRM: state the cities, states or countries you deliver to, and anywhere you do not.'],
      },
      {
        heading: 'Dispatch',
        body: [
          'TO CONFIRM: state how quickly you dispatch an order once it is placed.',
          'We will email you when your order leaves us.',
        ],
      },
      {
        heading: 'Delivery times',
        body: ['TO CONFIRM: give an expected transit time once an order has been dispatched, and note that it is an estimate rather than a guarantee.'],
      },
      {
        heading: 'Shipping charges',
        body: ['TO CONFIRM: state your shipping rates and any order value that qualifies for free delivery. Charges are calculated at checkout.'],
      },
      {
        heading: 'Delays',
        body: [
          'If something delays your order beyond the times above, we will contact you with a revised date, and you may cancel for a full refund instead of waiting.',
        ],
      },
      {
        heading: 'Wrong or incomplete addresses',
        body: ['TO CONFIRM: explain what happens when a parcel is returned because an address was wrong or nobody was available.'],
      },
      CONTACT,
    ],
  },

  {
    handle: 'refund-policy',
    title: 'Refund Policy',
    summary: 'Cancellations, returns and how refunds are paid back.',
    isDraft: true,
    lastUpdated: 'Not yet published',
    sections: [
      {
        heading: 'Cancelling an order',
        body: [
          'TO CONFIRM: state how long a customer has to cancel before an order is dispatched.',
          `Email ${site.email} with your order number and we will process it.`,
        ],
      },
      {
        heading: 'Damaged, faulty or wrong items',
        body: [
          'If your order arrives damaged, or is not what you ordered, tell us and we will replace it or refund it.',
          'TO CONFIRM: state the window for reporting this and whether you need a photograph.',
        ],
      },
      {
        heading: 'Change of mind',
        body: [
          'TO CONFIRM: food and drink is often non-returnable once opened for hygiene and safety reasons. Decide and state your position clearly, including whether unopened pouches can be returned.',
        ],
      },
      {
        heading: 'How to request a refund',
        body: [
          `Email ${site.email} with your order number and what went wrong.`,
          'TO CONFIRM: state who pays return postage where a return is required.',
        ],
      },
      {
        heading: 'How refunds are paid',
        body: [
          'Approved refunds go back to your original payment method through Shopify.',
          'TO CONFIRM: state how long your payment provider usually takes to show the money back.',
        ],
      },
      CONTACT,
    ],
  },
]

export function findPolicy(handle: string): Policy | undefined {
  return policies.find((policy) => policy.handle === handle)
}
