import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { PublicPortfolioViewer } from './views/PublicPortfolioViewer'
import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'
import { LandingModern } from './views/LandingModern'

import { Analytics } from '@vercel/analytics/react'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = ReactDOM.createRoot(rootElement)

const hostname = window.location.hostname
const path = window.location.pathname
const isPortfolioRoute = path.startsWith('/p/')
const isLandingDomain =
    hostname === 'modofreelanceos.com' || hostname === 'www.modofreelanceos.com'

const renderApp = () => {
    root.render(
        <React.StrictMode>
            <ThemeProvider>
                <Analytics />
                <App />
            </ThemeProvider>
        </React.StrictMode>
    )
}
const renderPortfolio = async (slugOrId: string) => {
    let finalUserId = slugOrId

    // 1. Intentar buscar si es un SLUG (apodo)
    try {
        const slugRef = doc(db, 'slugs', slugOrId)
        const slugSnap = await getDoc(slugRef)
        if (slugSnap.exists()) {
            finalUserId = slugSnap.data().userId // "victor" -> "Hj8d..."
        }
    } catch (e) {
        console.error('Error resolviendo slug', e)
    }

    // 2. Renderizar con el ID real
    root.render(
        <React.StrictMode>
            <PublicPortfolioViewer userId={finalUserId} />
        </React.StrictMode>
    )
}

if (isPortfolioRoute) {
    // Caso 1: Viendo un portafolio (Prioridad máxima)
    const param = path.split('/p/')[1]
    if (param) renderPortfolio(param)
    else if (isLandingDomain)
        root.render(<LandingModern />) // Fallback a landing
    else renderApp() // Fallback a app
} else if (isLandingDomain) {
    // Caso 2: Estamos en el dominio principal -> Mostrar Landing de Marketing
    root.render(
        <React.StrictMode>
            <LandingModern />
        </React.StrictMode>
    )
} else {
    // Caso 3: Estamos en 'app.' o localhost -> Mostrar el SaaS
    renderApp()
}
