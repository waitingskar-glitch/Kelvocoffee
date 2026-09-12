import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The /react entry point — /next is for Next.js apps and this is Vite.
import { Analytics } from '@vercel/analytics/react'
import App from './App'
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
