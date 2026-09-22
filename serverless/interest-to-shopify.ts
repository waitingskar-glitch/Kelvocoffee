/**
 * Kelvo — "Notify me" capture → Shopify customer records.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Shopify Forms is built for Online Store themes. It has no documented public
 * endpoint an external headless site can POST to, and the Shopify Admin API
 * token needed to create a customer must never ship in browser code.
 *
 * So this tiny function is the bridge: the storefront POSTs to it, and it
 * talks to Shopify with the Admin token, which stays server-side. Signups land
 * in Shopify as real customers, tagged with what they asked about — exactly
 * what Shopify Forms would have given you.
 *
 * DEPLOY
 * ------
 * Runs on any platform with Web-standard Request/Response:
 * Vercel, Netlify Edge, Cloudflare Workers, Deno Deploy.
 *
 *   Vercel      → put this file at `api/interest.ts`, run `vercel deploy`
 *   Netlify     → put it at `netlify/edge-functions/interest.ts`
 *   Cloudflare  → `wrangler deploy`
 *
 * ENVIRONMENT (set these on the host, NOT in the Vite app):
 *   SHOPIFY_STORE_DOMAIN      9pqz72-rg.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN       shpat_… (Admin API token — server-side only)
 *   SHOPIFY_API_VERSION       2025-07                      (optional)
 *   ALLOWED_ORIGIN            https://kelvocoffee.com      (your site origin)
 *
 * Then set VITE_PREORDER_ENDPOINT in the storefront's .env to this
 * function's URL. No frontend code changes are needed.
 */

interface InterestPayload {
  name?: string
  email?: string
  phone?: string
  intent?: 'restock' | 'interest'
  productHandle?: string
  productTitle?: string
  variantId?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Shopify only accepts E.164 phone numbers and rejects the whole customer if
 * the format is off. Phone is optional here, so anything unparseable is
 * dropped rather than allowed to fail the signup.
 */
function normalisePhone(raw: string): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : undefined
  }
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`          // Indian mobile
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return undefined
}

function env(key: string, fallback = ''): string {
  // Works across Node (process.env) and Deno/Workers (globalThis env bindings).
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined
  return (fromProcess ?? (globalThis as Record<string, any>)[key] ?? fallback) as string
}

function json(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    },
  })
}

async function adminGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = env('SHOPIFY_STORE_DOMAIN')
  const token = env('SHOPIFY_ADMIN_TOKEN')
  const version = env('SHOPIFY_API_VERSION', '2025-07')

  if (!domain || !token) throw new Error('Shopify Admin credentials are not configured')

  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) throw new Error(`Shopify Admin API responded ${response.status}`)

  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> }
  if (payload.errors?.length) throw new Error(payload.errors.map((e) => e.message).join('; '))
  if (!payload.data) throw new Error('Shopify Admin API returned no data')
  return payload.data
}

const FIND_CUSTOMER = /* GraphQL */ `
  query FindCustomer($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        tags
      }
    }
  }
`

const CREATE_CUSTOMER = /* GraphQL */ `
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`

const UPDATE_CUSTOMER = /* GraphQL */ `
  mutation UpdateCustomer($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`

export default async function handler(request: Request): Promise<Response> {
  const allowedOrigin = env('ALLOWED_ORIGIN', '*')

  if (request.method === 'OPTIONS') {
    return json({}, 204, allowedOrigin)
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, allowedOrigin)
  }

  let body: InterestPayload
  try {
    body = (await request.json()) as InterestPayload
  } catch {
    return json({ error: 'Invalid request' }, 400, allowedOrigin)
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const name = (body.name ?? '').trim()
  const phone = normalisePhone(body.phone ?? '')

  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: 'A valid email address is required' }, 400, allowedOrigin)
  }

  // Tags are how you segment these later in Shopify.
  const tags = ['kelvo-interest']
  if (body.intent) tags.push(`kelvo-${body.intent}`)
  if (body.productHandle) tags.push(`interest:${body.productHandle}`)

  const [firstName, ...rest] = name.split(/\s+/).filter(Boolean)
  const lastName = rest.join(' ')

  try {
    const found = await adminGraphQL<{ customers: { nodes: Array<{ id: string; tags: string[] }> } }>(
      FIND_CUSTOMER,
      { query: `email:${email}` },
    )
    const existing = found.customers.nodes[0]

    if (existing) {
      // Already on the list — just add the new interest tags.
      const merged = Array.from(new Set([...existing.tags, ...tags]))
      const result = await adminGraphQL<{
        customerUpdate: { userErrors: Array<{ message: string }> }
      }>(UPDATE_CUSTOMER, { input: { id: existing.id, tags: merged } })

      if (result.customerUpdate.userErrors.length) {
        throw new Error(result.customerUpdate.userErrors.map((e) => e.message).join('; '))
      }
      return json({ ok: true, status: 'updated' }, 200, allowedOrigin)
    }

    const result = await adminGraphQL<{
      customerCreate: { customer: { id: string } | null; userErrors: Array<{ message: string }> }
    }>(CREATE_CUSTOMER, {
      input: {
        email,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(phone ? { phone } : {}),
        tags,
        emailMarketingConsent: {
          marketingState: 'SUBSCRIBED',
          marketingOptInLevel: 'SINGLE_OPT_IN',
        },
        note: body.productTitle ? `Registered interest in ${body.productTitle}` : undefined,
      },
    })

    if (result.customerCreate.userErrors.length) {
      throw new Error(result.customerCreate.userErrors.map((e) => e.message).join('; '))
    }
    return json({ ok: true, status: 'created' }, 200, allowedOrigin)
  } catch (error) {
    // Log for yourself; never leak Shopify's wording to the shopper.
    console.error('[kelvo] Interest capture failed:', error)
    return json({ error: 'Could not save that right now' }, 502, allowedOrigin)
  }
}
