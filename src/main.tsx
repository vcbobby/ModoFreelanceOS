import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@context/ThemeContext'
import { PomodoroProvider } from '@context/PomodoroContext'
import { AppProvider } from '@context/AppContext'
import { PublicPortfolioViewer } from './views/PublicPortfolioViewer'
import { db } from './config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { LandingModern } from './views/LandingModern'
import { Analytics } from '@vercel/analytics/react'
import * as Sentry from '@sentry/react'
// import './index.css'

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
})
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = ReactDOM.createRoot(rootElement)

// 1. Detección robusta del entorno
const hostname = window.location.hostname
const pathname = window.location.pathname

// 'hostname' NO incluye el puerto (ej: localhost), 'host' sí (ej: localhost:5173)
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

const isAppDomain = hostname === 'app.modofreelanceos.com' || isLocal // Tratamos localhost como si fuera la App

const isLandingDomain =
    hostname === 'modofreelanceos.com' || hostname === 'www.modofreelanceos.com'

const isPortfolioRoute = pathname.startsWith('/p/')

// 2. Función para renderizar la App principal (SaaS)
const renderApp = () => {
    root.render(
        <React.StrictMode>
            <ThemeProvider>
                <PomodoroProvider>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </PomodoroProvider>
            </ThemeProvider>
        </React.StrictMode>,
    )
}

// 3. Función para renderizar el Portafolio (Lógica de Slugs)
const renderPortfolio = async (slugOrId: string) => {
    // Renderizamos un estado de carga inicial para evitar pantalla blanca
    root.render(
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            Cargando portafolio...
        </div>,
    )

    let finalUserId = slugOrId

    try {
        // Intentar buscar si es un SLUG
        const slugRef = doc(db, 'slugs', slugOrId)
        const slugSnap = await getDoc(slugRef)

        if (slugSnap.exists()) {
            finalUserId = slugSnap.data().userId
        }
    } catch (e) {
        console.error('Error resolviendo slug', e)
        // Opcional: Renderizar página de error aquí
    }

    // Renderizar con el ID resuelto
    root.render(
        <React.StrictMode>
            <PublicPortfolioViewer userId={finalUserId} />
        </React.StrictMode>,
    )
}

// 4. LÓGICA PRINCIPAL (Router manual)
// Extraemos el slug de la URL: /p/mi-usuario -> 'mi-usuario'
const portfolioSlug = isPortfolioRoute ? pathname.split('/')[2] : null

if (isPortfolioRoute && portfolioSlug) {
    // Caso 1: Es ruta de portafolio (/p/...)
    // IMPORTANTE: Llamamos a la función renderPortfolio, no a root.render directo
    renderPortfolio(portfolioSlug)
} else if (isLandingDomain) {
    // Caso 2: Es el dominio principal -> Landing Page
    root.render(
        <React.StrictMode>
            <LandingModern />
        </React.StrictMode>,
    )
} else {
    // Caso 3: Es app.modofreelanceos.com o localhost -> App SaaS
    renderApp()
}
