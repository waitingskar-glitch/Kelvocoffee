import { useCallback, useState } from 'react'
import { CatalogProvider } from './context/CatalogProvider'
import { CartProvider } from './context/CartProvider'
import { useCart } from './context/cartContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { HowItWorks } from './components/HowItWorks'
import { TrialPackSection } from './components/TrialPackSection'
import { BrandSection } from './components/BrandSection'
import { Footer } from './components/Footer'
import { NotifyMeModal, type NotifyTarget } from './components/NotifyMeModal'
import { StickyMobileCta } from './components/StickyMobileCta'
import { CartErrorToast } from './components/CartErrorToast'
import { StructuredData } from './components/StructuredData'
import { trialPack } from './config/site'
import { findPolicy } from './config/policies'
import { findProductByHandle } from './services/products'
import { useCatalog } from './context/catalogContext'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { RouterProvider, useRouter } from './router'
import { PolicyPage } from './pages/PolicyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { Product, ProductVariant } from './types/shopify'

export default function App() {
  return (
    <RouterProvider>
      <CatalogProvider>
        <CartProvider>
          <Storefront />
        </CartProvider>
      </CatalogProvider>
    </RouterProvider>
  )
}

/** Home renders the storefront; every other route renders a content page. */
function Routes() {
  const { path } = useRouter()

  if (path === '/' || path === '') return <HomePage />

  if (path === '/cart') return <CartPage />

  const productMatch = path.match(/^\/products\/([a-z0-9-]+)$/)
  if (productMatch) return <ProductRoute handle={productMatch[1]} />

  const policyMatch = path.match(/^\/policies\/([a-z0-9-]+)$/)
  if (policyMatch) {
    const policy = findPolicy(policyMatch[1])
    if (policy) return <PolicyPage policy={policy} />
  }

  return <NotFoundPage />
}

/**
 * The catalog arrives asynchronously, so a product route can't decide between
 * "this product" and "no such product" until it has loaded.
 */
function ProductRoute({ handle }: { handle: string }) {
  const { catalog, status } = useCatalog()

  if (status === 'loading') {
    return (
      <main id="main" className="pt-[var(--spacing-header)]">
        <div className="container-page flex min-h-[60vh] items-center">
          <p className="label text-muted">Loading…</p>
        </div>
      </main>
    )
  }

  const found = catalog ? findProductByHandle(catalog, handle) : null
  if (!found) return <NotFoundPage />
  return <ProductPage product={found.product} meta={found.meta} />
}

function Storefront() {
  const { announcement } = useCart()
  const { path } = useRouter()
  const isHome = path === '/' || path === ''

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-pill focus:bg-espresso focus:px-5 focus:py-3 focus:text-cream"
      >
        Skip to content
      </a>

      <Header />
      <Routes />
      <Footer />

      {isHome && <StickyMobileCta />}
      <CartErrorToast />
      <StructuredData />

      {/* Single live region for cart changes. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </>
  )
}

function HomePage() {
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null)

  const requestNotify = useCallback((product: Product | null, variant?: ProductVariant) => {
    setNotifyTarget(
      product
        ? {
            product,
            variant,
            title: product.title,
            handle: product.handle,
            // A product that exists but is sold out gets a restock alert;
            // anything else is early-access interest.
            intent: 'restock',
          }
        : {
            product: null,
            title: trialPack.name,
            handle: 'trial-pack',
            intent: 'interest',
          },
    )
  }, [])

  return (
    <>
      <main id="main">
        <Hero />
        <ProductGrid onRequestNotify={requestNotify} />
        <HowItWorks />
        <TrialPackSection onRequestNotify={requestNotify} />
        <BrandSection />
      </main>

      <NotifyMeModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
    </>
  )
}

