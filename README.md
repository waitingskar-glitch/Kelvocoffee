# Kelvo Coffee — storefront

A single-page, conversion-focused storefront for Kelvo, built on **React + TypeScript + Vite + Tailwind CSS v4**.

Commerce is Shopify's job. This app renders the brand and hands off product data,
cart and checkout to the Shopify Storefront API — it does not reimplement
inventory, payments or orders.

---

## 1. Install

```bash
npm install
```

Node 20.19+ or 22.12+ is required (Vite 7).

## 2. Run locally

```bash
npm run dev
```

The site runs at `http://localhost:5180`.

**Preview mode.** Without Storefront credentials the site starts in preview
mode: it renders a seed catalog that mirrors the live Shopify products, keeps
the cart in `localStorage` so every state can be reviewed, and disables the
checkout button. Nothing is faked at checkout — payments only ever happen on
Shopify.

## 3. Configure Shopify

```bash
cp .env.example .env
```

Fill in two values and restart the dev server:

| Variable | Where to find it |
| --- | --- |
| `VITE_SHOPIFY_STORE_DOMAIN` | Your `*.myshopify.com` domain |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify admin → **Settings → Apps and sales channels → Develop apps** → your app → **Storefront API** |

Required Storefront API scopes:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

The Storefront token is public, read-only and domain-scoped — it is designed to
ship in a client bundle. **The Admin API token must never be added to this
project**; every `VITE_*` value ends up in the browser.

Once the token is set, the seed catalog is ignored entirely and titles,
descriptions, images, prices, variants and availability all come from Shopify.

## 4. Product and variant IDs

Products are resolved by **handle**, not by hard-coded product/variant IDs, so
the storefront survives a product being recreated. Variant IDs are read from
Shopify at runtime and passed straight to the cart.

Defaults live in [`src/config/shopify.ts`](src/config/shopify.ts):

| Flavour | Shopify title | Handle |
| --- | --- | --- |
| Classic | Classic Coffee Concentrate | `classic-coffee-concentrate` |
| Vanilla | Vanilla Coffee Concentrate | `vanilla-coffee-concentrate` |
| Hazelnut | Hazelnut Coffee Concentrate | `hazelnut-coffee-concentrate` |
| Caramel | Caramel Coffee Concentrate | `caramel-coffee-concentrate` |
| Whiskey | Whiskey Coffee Concentrate | `whiskey-coffee-concentrate` |

If a handle changes in the admin, override it with the matching
`VITE_HANDLE_*` variable rather than editing code. A handle that no longer
resolves is skipped with a console warning; the rest of the grid still renders.

### The trial pack

Live in Shopify as **`kelvo-trial-pack`** (₹400, one variant: 4 × 50ml). Price,
availability and the per-flavour maths all come from Shopify.

Contents are **Vanilla, Whiskey, Hazelnut and Caramel** — no Classic. The
flavour chips on the page come from `trialPack.flavourKeys` in
[`src/config/site.ts`](src/config/site.ts); keep that list, the Shopify
description and the pack photograph in agreement.

> **Add a pack photo in Shopify and the site picks it up on its own.** Until
> then the section composes a grid from the four individual pouch shots and the
> cart line shows a brand mark. No code change is needed either way.

`trialPack.fallbackPrice` in [`src/config/site.ts`](src/config/site.ts) is only
used if the Shopify product ever stops resolving.

## 5. Preorder / notify-me endpoint

Any variant Shopify reports as unavailable swaps **Add to cart** for **Notify
me**, which opens a reusable capture modal. There is deliberately no backend
here. Point it at your provider:

```
VITE_PREORDER_ENDPOINT=https://…
```

Submissions are `POST`ed as JSON:

```json
{
  "name": "Asha",
  "email": "asha@example.com",
  "phone": "+91 98765 43210",
  "intent": "preorder",
  "productHandle": "whiskey-coffee-concentrate",
  "productTitle": "Whiskey Concentrate",
  "variantId": "gid://shopify/ProductVariant/…",
  "source": "kelvo-storefront",
  "submittedAt": "2026-09-07T10:00:00.000Z"
}
```

#### Getting signups into Shopify

Shopify Forms is built for Online Store themes — it has no public endpoint an
external headless site can POST to, and the Admin API token needed to create a
customer must never ship in browser code.

So [`serverless/interest-to-shopify.ts`](serverless/interest-to-shopify.ts)
bridges the gap. Deploy it to Vercel, Netlify, Cloudflare Workers or Deno
Deploy, set `VITE_PREORDER_ENDPOINT` to its URL, and signups land in Shopify as
customers tagged `kelvo-interest` and `interest:<product-handle>`, with email
marketing consent recorded. Someone who signs up twice gets their tags merged
rather than duplicated.

The function needs these variables **on the host, never in the Vite app**:

| Variable | Value |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | `9pqz72-rg.myshopify.com` |
| `SHOPIFY_ADMIN_TOKEN` | Admin API token (`shpat_…`) |
| `ALLOWED_ORIGIN` | Your site's origin, for CORS |

Formspree, Klaviyo, Brevo and custom APIs accept the same payload directly — no
proxy needed. To reshape it for one of them, edit `submitInterest` in
[`src/services/interest.ts`](src/services/interest.ts); it is the only function
that touches the network.

With no endpoint configured the modal validates, logs the payload to the
console and shows the success state, and a development-only notice makes clear
that nothing was sent.

## Legal pages

Four routes render in the site's own design, not Shopify's:

```
/policies/privacy-policy
/policies/terms-of-service
/policies/shipping-policy
/policies/refund-policy
```

Content lives in [`src/config/policies.ts`](src/config/policies.ts) as plain
headings and paragraphs — no HTML to fight with. **All four are drafts.**
Anything still undecided is written as `TO CONFIRM:` and renders as a marked
callout, so scaffolding can never be mistaken for finished policy. A visitor
also sees a "not final yet" banner while `isDraft` is true; set it to `false`
per policy once the text is signed off.

> **Why these are not pulled from Shopify.** The Storefront API returns policy
> bodies with their Liquid unrendered — `{{ shop_name }}`, and conditionals
> like `{% if selling_to_europe %}` that depend on flags the API does not
> expose. Rendering that here would mean guessing whether clauses granting or
> removing legal rights should appear. Shopify admin → Settings → Policies
> generates correct full text for free; paste the finished wording into
> `policies.ts`.

Routing is a ~90-line history router in [`src/router.tsx`](src/router.tsx) —
five routes did not justify a dependency. `vercel.json` rewrites unknown paths
to `index.html`; **without it, a direct hit on `/policies/*` 404s in
production**.


## 6. Build for production

```bash
npm run build     # typecheck + bundle to dist/
npm run preview   # serve the built output
```

Before launch, update in [`index.html`](index.html): the canonical URL, the
Open Graph / Twitter URLs and images, and `VITE_SITE_URL` in `.env`.

---

## Project structure

```
src/
├── config/          shopify.ts · site.ts · catalog.ts · testimonials.ts
├── services/        storefront.ts · queries.ts · products.ts · cart.ts
│                    previewCart.ts · interest.ts
├── context/         catalogContext.ts + CatalogProvider.tsx
│                    cartContext.ts + CartProvider.tsx
├── components/      sections, product UI, cart, modals
│   └── ui/          Button · Field · Overlay · Spinner · icons …
├── hooks/           useReveal · useScrolled · useBodyScrollLock
├── lib/             format.ts · cn.ts
├── types/           shopify.ts (normalised commerce types)
└── styles/          index.css (all design tokens)
```

Two rules keep this maintainable:

1. **No GraphQL in components.** Every query lives in `services/queries.ts`;
   components only ever see the normalised types in `types/shopify.ts`.
2. **No raw values in components.** Colour, type scale, radius, shadow and
   easing are all tokens in `styles/index.css`.

## Content that still needs real data

| What | Where | Status |
| --- | --- | --- |
| Customer reviews | `src/config/testimonials.ts` | Empty on purpose. Samples render in dev only, clearly labelled, and never in a production build. |
| Brand origin story | `src/components/BrandSection.tsx` | Draft copy — confirm with the founders. |
| Social links | `VITE_SOCIAL_*` | Footer renders only channels that have a URL. |
| Legal pages | `src/config/site.ts` | Point at your Shopify policy URLs. |
| Product photography | `public/assets/products/` | The store's own images, resized to 640/1100 WebP. Drop in replacements with the same filenames. |
| Trial pack photo | Shopify admin | Missing. Cart shows a brand mark until one is added. |

Nothing here invents ratings, customer counts, awards, press mentions or
scarcity messaging.

## Accessibility & performance notes

- Modals and the cart drawer trap focus, close on Escape and on backdrop click,
  and restore focus to whatever opened them.
- Size selectors are real radio inputs; all controls are at least 44px tall.
- Cart changes are announced through a single polite live region.
- Motion is opacity/transform only and is disabled under
  `prefers-reduced-motion`.
- Images carry explicit `width`/`height` and responsive `srcset`; below-the-fold
  images lazy-load, so there is no layout shift.
- Runtime dependencies: React, React DOM, `@vercel/analytics` and `animejs`.
- The How it works illustration is an anime.js timeline in
  [`src/components/HowItWorks.tsx`](src/components/HowItWorks.tsx), drawing
  the layered SVG scene in [`src/components/PourSequence.tsx`](src/components/PourSequence.tsx).
  The dark panel locks to the screen as its top reaches the header, and scroll
  scrubs the animation while it is held — half a viewport — before the page
  carries on, playing in reverse on the way back up. The scene is three depth
  layers tilted in 3D, swinging round to face the reader as the cup is
  finished. Visitors who prefer reduced motion get the finished cup, facing
  forward, with no movement and no lock.
