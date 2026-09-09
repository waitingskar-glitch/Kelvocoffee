import { shopifyConfig, storefrontEndpoint, isShopifyConfigured } from '@/config/shopify'
import { CommerceError } from '@/types/shopify'

const REQUEST_TIMEOUT_MS = 12_000
const RETRY_DELAY_MS = 700

export interface FetchOptions {
  /**
   * Extra attempts after a transient failure (network blip or a Shopify-side
   * internal error). Safe for reads only — never retry a cart mutation, or a
   * line can be added twice.
   */
  retries?: number
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * Low-level Storefront API caller.
 *
 * Returns typed data or throws a CommerceError carrying a shopper-safe
 * message. Raw GraphQL/network text is logged for developers but never
 * surfaced to the UI.
 */
export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: FetchOptions = {},
): Promise<T> {
  const retries = options.retries ?? 0

  try {
    return await runQuery<T>(query, variables)
  } catch (error) {
    const transient =
      error instanceof CommerceError && (error.kind === 'network' || error.kind === 'api')

    if (retries > 0 && transient) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return storefrontFetch<T>(query, variables, { retries: retries - 1 })
    }
    throw error
  }
}

async function runQuery<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!isShopifyConfigured) {
    throw new CommerceError(
      'config',
      'Our store is being set up. Please check back shortly.',
      'Shopify Storefront credentials are missing. See .env.example.',
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(storefrontEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontToken,
      },
      body: JSON.stringify({
        query,
        variables: {
          country: shopifyConfig.countryCode,
          language: shopifyConfig.languageCode,
          ...variables,
        },
      }),
      signal: controller.signal,
    })
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    throw new CommerceError(
      'network',
      aborted
        ? 'That took longer than expected. Please check your connection and try again.'
        : "We couldn't reach our store just now. Please try again.",
      String(error),
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new CommerceError(
      'api',
      'Something went wrong on our side. Please try again in a moment.',
      `Storefront API responded ${response.status}`,
    )
  }

  const payload = (await response.json()) as GraphQLResponse<T>

  if (payload.errors?.length) {
    // Developer-facing only.
    console.error('[kelvo] Storefront API errors:', payload.errors)
    throw new CommerceError(
      'api',
      'Something went wrong on our side. Please try again in a moment.',
      payload.errors.map((e) => e.message).join('; '),
    )
  }

  if (!payload.data) {
    throw new CommerceError('api', 'Something went wrong on our side. Please try again in a moment.')
  }

  return payload.data
}

/** Turns Storefront user errors into a single shopper-safe CommerceError. */
export function assertNoUserErrors(
  userErrors: Array<{ message: string }> | undefined,
  userMessage: string,
): void {
  if (userErrors?.length) {
    console.error('[kelvo] Storefront user errors:', userErrors)
    throw new CommerceError('api', userMessage, userErrors.map((e) => e.message).join('; '))
  }
}
