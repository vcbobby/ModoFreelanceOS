import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// 1. Detección robusta del entorno
const hostname = window.location.hostname;
const pathname = window.location.pathname;

const isLandingDomain =
  hostname === 'modofreelanceos.com' || hostname === 'www.modofreelanceos.com';

const isPortfolioRoute = pathname.startsWith('/p/');

// 2. Función para renderizar la App principal (SaaS)
const renderApp = async () => {
  try {
    const [{ default: App }, { AppProviders }] = await Promise.all([
      import('@/App'),
      import('@context'),
    ]);
    root.render(
      <React.StrictMode>
        <AppProviders>
          <App />
        </AppProviders>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Main: CRITICAL ERROR in renderApp:', err);
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.innerHTML = `<div style="padding: 20px; color: red;"><h1>Error de Inicio</h1><pre>${err}</pre></div>`;
    }
  }
};

// 3. Función para renderizar el Portafolio (Lógica de Slugs)
const renderPortfolio = async (slugOrId: string) => {
  // Renderizamos un estado de carga inicial para evitar pantalla blanca
  root.render(
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        Cargando portafolio...
      </div>
    </div>
  );

  try {
    const [{ PublicPortfolioViewer }, { db }, firestore] = await Promise.all([
      import('@features/public-portfolio'),
      import('@config/firebase'),
      import('firebase/firestore'),
    ]);

    const { doc, getDoc } = firestore;

    let finalUserId = slugOrId;

    try {
      // Intentar buscar si es un SLUG
      const slugRef = doc(db, 'slugs', slugOrId);
      const slugSnap = await getDoc(slugRef);

      if (slugSnap.exists()) {
        finalUserId = slugSnap.data().userId;
      }
    } catch (e) {
      console.error('Error resolviendo slug', e);
      // Continuamos con el slugOrId original como fallback
    }

    // Renderizar con el ID resuelto
    root.render(
      <React.StrictMode>
        <PublicPortfolioViewer userId={finalUserId} />
      </React.StrictMode>
    );
  } catch (e) {
    console.error('Error crítico cargando portafolio:', e);
    root.render(
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Error al cargar</h1>
        <p className="text-gray-400 mb-6">No se pudo cargar el portafolio.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl"
        >
          Reintentar
        </button>
      </div>
    );
  }
};

const bootstrap = async () => {
  // 4. LÓGICA PRINCIPAL (Router manual)
  // Extraemos el slug de la URL: /p/mi-usuario -> 'mi-usuario'
  const portfolioSlug = isPortfolioRoute ? pathname.split('/')[2] : null;

  if (isPortfolioRoute && portfolioSlug) {
    // Caso 1: Es ruta de portafolio (/p/...)
    // IMPORTANTE: Llamamos a la función renderPortfolio, no a root.render directo
    await renderPortfolio(portfolioSlug);
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const isForcedLanding = searchParams.has('landing');

  if (isLandingDomain || isForcedLanding) {
    // Caso 2: Es el dominio principal -> Landing Page
    const { LandingModern } = await import('@features/landing');
    root.render(
      <React.StrictMode>
        <LandingModern />
      </React.StrictMode>
    );
    return;
  }

  // Caso 3: Es app.modofreelanceos.com o localhost -> App SaaS
  await renderApp();
};

void bootstrap();
