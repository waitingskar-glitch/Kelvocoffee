import { useEffect } from 'react'
import { flavours } from '@/config/catalog'
import { site } from '@/config/site'
import { useCatalog } from '@/context/catalogContext'

const SCRIPT_ID = 'kelvo-product-schema'

/**
 * Emits Product structured data built from the live catalog.
 *
 * Prices, availability and names all come from the same source as the UI, so
 * the markup can never drift from what shoppers see.
 */
export function StructuredData() {
  const { catalog, status } = useCatalog()

  useEffect(() => {
    if (status !== 'ready' || !catalog) return

    const items = catalog.order.flatMap((key, index) => {
      const product = catalog.byFlavour[key]
      if (!product) return []
      const meta = flavours[key]
      const prices = product.variants.map((variant) => variant.price.amount)
      const currency = product.variants[0]?.price.currencyCode ?? 'INR'

      return [
        {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.title,
            description: product.description,
            image: new URL(meta.image.src, site.url).toString(),
            brand: { '@type': 'Brand', name: site.legalName },
            category: product.productType,
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: currency,
              lowPrice: Math.min(...prices),
              highPrice: Math.max(...prices),
              offerCount: product.variants.length,
              availability: product.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          },
        },
      ]
    })

    if (items.length === 0) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = SCRIPT_ID
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Kelvo coffee concentrates',
      itemListElement: items,
    })

    document.getElementById(SCRIPT_ID)?.remove()
    document.head.appendChild(script)

    return () => script.remove()
  }, [catalog, status])

  return null
}
