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
import { CartDrawer } from './components/CartDrawer'
import { NotifyMeModal, type NotifyTarget } from './components/NotifyMeModal'
import { StickyMobileCta } from './components/StickyMobileCta'
import { CartErrorToast } from './components/CartErrorToast'
import { StructuredData } from './components/StructuredData'
import { trialPack } from './config/site'
import { findPolicy } from './config/policies'
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

  const policyMatch = path.match(/^\/policies\/([a-z0-9-]+)$/)
  if (policyMatch) {
    const policy = findPolicy(policyMatch[1])
    if (policy) return <PolicyPage policy={policy} />
  }

  return <NotFoundPage />
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

      <CartDrawer />
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
            // A product that exists but is sold out is a preorder; anything
            // else is early-access interest.
            intent: 'preorder',
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

