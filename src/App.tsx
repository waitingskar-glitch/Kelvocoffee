import { useCallback, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
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
import type { Product, ProductVariant } from './types/shopify'

export default function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <Storefront />
        <Analytics />
      </CartProvider>
    </CatalogProvider>
  )
}

function Storefront() {
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null)
  const { announcement } = useCart()

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
      <a
        href="#shop"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-pill focus:bg-espresso focus:px-5 focus:py-3 focus:text-cream"
      >
        Skip to shop
      </a>

      <Header />

      <main id="main">
        <Hero />
        <ProductGrid onRequestNotify={requestNotify} />
        <HowItWorks />
        <TrialPackSection onRequestNotify={requestNotify} />
        <BrandSection />
      </main>

      <Footer />

      <CartDrawer />
      <NotifyMeModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
      <StickyMobileCta />
      <CartErrorToast />
      <StructuredData />

      {/* Single live region for cart changes. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </>
  )
}
