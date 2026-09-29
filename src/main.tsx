import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The /react entry point — /next is for Next.js apps and this is Vite.
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { installEvenGrid } from './lib/evenGrid'
import { installMetaPixel } from './lib/metaPixel'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <App />
    {/* Cookieless visitor analytics. Inert outside Vercel, so local and
        preview runs never pollute production numbers. */}
    <Analytics />
  </StrictMode>,
)

// Fit the graph grid to whole squares on every gridded panel.
installEvenGrid()

// Meta Pixel for ad measurement (live domain only; see lib/metaPixel).
installMetaPixel()

// Images can't be dragged off the page. CSS covers Chrome and Safari
// (-webkit-user-drag in index.css); this covers Firefox too.
document.addEventListener('dragstart', (event) => {
  if (event.target instanceof HTMLImageElement || event.target instanceof SVGElement) event.preventDefault()
})
