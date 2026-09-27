import { Suspense, useCallback, useEffect, useState } from 'react'
import { CatalogProvider } from './context/CatalogProvider'
import { CartProvider } from './context/CartProvider'
import { useCart } from './context/cartContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductGrid } from './components/ProductGrid'
import { HowItWorks } from './components/HowItWorks'
import { Testimonials } from './components/Testimonials'
import { HamperBuilder } from './components/HamperBuilder'
import { ClaimsStrip } from './components/ClaimsStrip'
import { Statement } from './components/Statement'
import { HotColdBand } from './components/HotColdBand'
import { FaqSection } from './components/FaqSection'
import { Footer } from './components/Footer'
import { NotifyMeModal, type NotifyTarget } from './components/NotifyMeModal'
import { StickyMobileCta } from './components/StickyMobileCta'
import { CartErrorToast } from './components/CartErrorToast'
import { StructuredData } from './components/StructuredData'
import { findPolicy } from './config/policies'
import { findProductByHandle } from './services/products'
import { useCatalog } from './context/catalogContext'
import { RouterProvider, useRouter } from './router'
import { NotFoundPage } from './pages/NotFoundPage'
import type { Product, ProductVariant } from './types/shopify'
import { lazyPage } from './lazyPage'

// Everything but the home page loads as its own chunk, fetched while the
// browser is idle so the first page is lighter but later ones stay instant.
const ProductPage = lazyPage(() => import('./pages/ProductPage').then((m) => m.ProductPage))
const CartPage = lazyPage(() => import('./pages/CartPage').then((m) => m.CartPage))
const AboutPage = lazyPage(() => import('./pages/AboutPage').then((m) => m.AboutPage))
const PolicyPage = lazyPage(() => import('./pages/PolicyPage').then((m) => m.PolicyPage))

function preloadPages() {
  void ProductPage.preload()
  void CartPage.preload()
  void AboutPage.preload()
  void PolicyPage.preload()
}

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
  if (path === '/about') return <AboutPage />

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

  if (status === 'loading') return <PageLoading />

  const found = catalog ? findProductByHandle(catalog, handle) : null
  if (!found) return <NotFoundPage />
  return <ProductPage product={found.product} meta={found.meta} />
}

function PageLoading() {
  return (
    <main id="main" className="pt-[var(--spacing-header)]">
      <div className="container-page flex min-h-[60vh] items-center">
        <p className="label">Loading…</p>
      </div>
    </main>
  )
}

function Storefront() {
  const { announcement } = useCart()
  const { path } = useRouter()
  const isHome = path === '/' || path === ''

  // Fetch the other pages once the browser has nothing better to do.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    idle(preloadPages)
  }, [])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] shape-squircle focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>

      <Header />
      <Suspense fallback={<PageLoading />}>
        <Routes />
      </Suspense>
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

  // A flavour that's sold out gets a restock alert.
  const requestNotify = useCallback((product: Product, variant?: ProductVariant) => {
    setNotifyTarget({ product, variant, title: product.title, handle: product.handle, intent: 'restock' })
  }, [])

  return (
    <>
      <main id="main">
        {/* Desktop: hero, illustrations, then the range. Phones and tablets
            get to the range first; the illustrations follow it. */}
        <div className="flex flex-col">
          <Hero />
          <div className="max-lg:order-last">
            <ClaimsStrip />
          </div>
          <ProductGrid onRequestNotify={requestNotify} />
          <HamperBuilder />
        </div>
        <Statement />
        <HotColdBand />
        <HowItWorks />
        <Testimonials />
        <FaqSection />
      </main>

      <NotifyMeModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
    </>
  )
}

