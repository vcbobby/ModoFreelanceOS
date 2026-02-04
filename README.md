# ModoFreelanceOS v2.0.0

🚀 **El Sistema Operativo definitivo para Freelancers**

Plataforma all-in-one con IA integrada para gestionar todos los aspectos de tu negocio freelance: propuestas, logos, facturas, CV, portfolios y mucho más.

## ✨ Nuevas Características v2.0

-   🎨 **Nueva Landing Page Moderna** con animaciones y diseño profesional
-   🤖 **Asistente IA Mejorado** con Google Gemini 2.0
-   📊 **Dashboard de Analíticas** para trackear tu productividad
-   🎯 **Generación de Propuestas Optimizadas** por plataforma (Upwork, Freelancer, Workana)
-   🖼️ **Generador de Logos con IA** usando modelos Flux
-   📄 **Creador de CV Profesionales** con múltiples plantillas
-   💰 **Gestión Financiera Completa** con gráficas y reportes
-   📱 **PWA con Soporte Offline** funciona sin internet
-   🌙 **Modo Oscuro Nativo** con persistencia
-   🔔 **Notificaciones Inteligentes** para deadlines y eventos
-   📧 **Sistema de Email Integrado** para clientes
-   🎓 **Academia Freelance** con recursos y tips
-   🔍 **Buscador de Trabajos** en múltiples plataformas

## 🚀 Quick Start

### Prerrequisitos

-   **Node.js** 18 o superior
-   **npm** o **pnpm** (recomendado)
-   Proyecto de **Firebase** configurado
-   Cuenta de **Google Gemini** para funciones de IA

### Instalación

1. **Clonar y navegar al proyecto:**

```bash
cd ModoFreelanceOS-feature-frontend-v2-structure
```

2. **Instalar dependencias:**

```bash
# Con npm
npm install

# Con pnpm (recomendado por velocidad)
pnpm install
```

3. **Configurar Firebase:**

Editar `src/config/firebase.ts` con tus credenciales de Firebase:

```typescript
const firebaseConfig = {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_AUTH_DOMAIN',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_STORAGE_BUCKET',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID',
    measurementId: 'TU_MEASUREMENT_ID',
}
```

Obtén estas credenciales en:

-   Firebase Console → Configuración del Proyecto → Tus apps → SDK Setup

4. **Configurar variables de entorno (opcional):**

Crear archivo `.env.local`:

```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=tu_gemini_key
VITE_SENTRY_DSN=tu_sentry_dsn
```

5. **Ejecutar en desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## 📱 Build para Producción

### Web (Vercel/Netlify)

```bash
# Build de producción
npm run build

# Preview del build localmente
npm run preview
```

Los archivos se generarán en `dist/`

### Deployar en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

O conecta tu repo en [vercel.com](https://vercel.com)

### Android (APK)

```bash
# 1. Build del proyecto
npm run build

# 2. Sincronizar con Capacitor
npx cap sync

# 3. Abrir Android Studio
npx cap open android

# 4. En Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Requisitos:**

-   Android Studio instalado
-   JDK 11+
-   Android SDK configurado

### iOS (Solo en Mac)

```bash
npm run build
npx cap sync
npx cap open ios

# En Xcode: Product → Archive
```

**Requisitos:**

-   Xcode 14+
-   Cuenta de Apple Developer

### Desktop (Electron)

```bash
# Build para Windows
npm run electron:build

# El instalador se generará en dist/
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # UI components base
│   │   ├── BaseModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   ├── LegalModal.tsx
│   │   └── NotificationModal.tsx
│   ├── AIAssistant.tsx
│   ├── SupportWidget.tsx
│   ├── UpdateChecker.tsx
│   └── Dashboard*.tsx   # Componentes del dashboard
│
├── views/               # Páginas/vistas principales
│   ├── LandingModern.tsx      # Nueva landing v2.0
│   ├── Auth.tsx               # Login/Register
│   ├── ProposalTool.tsx       # Generador de propuestas
│   ├── LogoTool.tsx           # Generador de logos
│   ├── CVBuilder.tsx          # Creador de CVs
│   ├── InvoiceTool.tsx        # Generador de facturas
│   ├── BriefingTool.tsx       # Creador de briefings
│   ├── PortfolioTool.tsx      # Gestor de portafolios
│   ├── WebsiteBuilder.tsx     # Constructor de sitios
│   ├── QRTool.tsx             # Generador de QR codes
│   ├── FiverrTool.tsx         # Optimizador de Fiverr
│   ├── AnalyzerTool.tsx       # Analizador de imágenes
│   ├── OptimizerTool.tsx      # Optimizador de contenido
│   ├── PomodoroTool.tsx       # Timer Pomodoro
│   ├── FinanceView.tsx        # Gestión financiera
│   ├── NotesView.tsx          # Notas y recordatorios
│   ├── JobsView.tsx           # Búsqueda de trabajos
│   ├── AcademyView.tsx        # Academia/recursos
│   ├── HistoryView.tsx        # Historial
│   ├── AdminDashboard.tsx     # Panel admin
│   └── PublicPortfolioViewer.tsx
│
├── context/             # Context API para estado global
│   ├── AppContext.tsx
│   ├── ThemeContext.tsx
│   └── PomodoroContext.tsx
│
├── hooks/               # Custom React hooks
│   └── useAgendaNotifications.ts
│
├── services/            # Servicios externos
│   └── geminiService.ts
│
├── utils/               # Funciones auxiliares
│   ├── downloadUtils.ts
│   ├── filesystem.ts
│   ├── notifications.ts
│   ├── pdfUtils.ts
│   └── platform.ts
│
├── lib/                 # Librerías y configuraciones
│   └── api/
│       └── client.ts    # Cliente API
│
├── config/              # Configuraciones
│   ├── firebase.ts
│   └── features.ts
│
├── types/               # TypeScript types
│   └── index.ts
│
├── data/                # Data estática
│   ├── tips.ts
│   └── legalTexts.ts
│
├── App.tsx              # Componente raíz
└── main.tsx             # Entry point
```

## 🛠️ Stack Tecnológico

### Core

-   **React 19** - Framework UI
-   **TypeScript** - Type safety
-   **Vite** - Build tool ultra-rápido

### Librerías UI

-   **Lucide React** - Iconos modernos
-   **Framer Motion** - Animaciones fluidas
-   **React Markdown** - Renderizado de markdown
-   **React QR Code** - Generación de códigos QR

### Backend & Storage

-   **Firebase** - Authentication, Firestore, Storage
-   **Google Gemini** - Generación de contenido con IA

### Utilidades

-   **html2pdf.js** - Exportar a PDF
-   **pdfjs-dist** - Leer PDFs
-   **browser-image-compression** - Compresión de imágenes
-   **Capacitor** - Build nativo (Android/iOS)

### Mobile

-   **Capacitor 8** - Framework híbrido
    -   App
    -   Filesystem
    -   Local Notifications
    -   Google Auth
    -   Toast

### Monitoreo

-   **Sentry** - Error tracking
-   **Vercel Analytics** - Analytics

## 🎮 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 5173)

# Build
npm run build            # Build de producción
npm run preview          # Preview del build

# Electron (Desktop)
npm run electron:dev     # Desarrollo con Electron
npm run electron:build   # Build instalador Windows

# Capacitor (Mobile)
npx cap sync             # Sincronizar código con apps nativas
npx cap open android     # Abrir en Android Studio
npx cap open ios         # Abrir en Xcode
```

## 🧪 Testing (En desarrollo)

```bash
# Correr tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch
```

## 🎨 Personalización

### Temas

Editar colores en `src/context/ThemeContext.tsx`:

```typescript
const lightTheme = {
    background: '#ffffff',
    text: '#1a1a1a',
    primary: '#10b981',
    // ...
}
```

### Features Flags

Activar/desactivar características en `src/config/features.ts`:

```typescript
export const features = {
    aiAssistant: true,
    logoGenerator: true,
    cvBuilder: true,
    // ...
}
```

## 🔐 Autenticación y Seguridad

### Firebase Auth

Métodos soportados:

-   ✅ Email/Password
-   ✅ Google OAuth
-   🚧 GitHub OAuth (próximamente)

### Reglas de Seguridad Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /history/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /portfolios/{document=**} {
        allow read: if true;  // Públicos
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 📊 Analíticas y Monitoreo

### Vercel Analytics

Instalado automáticamente. Ver métricas en:

-   Dashboard de Vercel → Analytics

### Sentry (Error Tracking)

Configurar DSN en `.env.local`:

```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🌐 Internacionalización (i18n)

**Estado:** 🚧 En desarrollo

Idiomas planeados:

-   Español (ES) - Actual
-   English (EN)
-   Português (PT)

## ♿ Accesibilidad

-   ✅ Navegación por teclado
-   ✅ ARIA labels
-   ✅ Alto contraste
-   ✅ Screen reader friendly
-   ⚠️ Mejoras continuas

## 🐛 Troubleshooting

### Build falla con "out of memory"

**Solución:**

```bash
# Aumentar memoria de Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Capacitor no sincroniza archivos

**Solución:**

```bash
# Limpiar y reconstruir
rm -rf android/app/src/main/assets/public
npm run build
npx cap sync
```

### Firebase Auth no funciona en localhost

**Solución:**

1. Firebase Console → Authentication → Settings
2. Añadir `localhost` a los dominios autorizados

### Errores de CORS con la API

**Solución:**
Verificar que `http://localhost:5173` esté en ALLOWED_ORIGINS del backend

### PWA no se instala en móvil

**Solución:**

1. Verificar que `manifest.json` esté correcto
2. Servir con HTTPS (usa ngrok en desarrollo)
3. Asegurar que todas las imágenes del manifest existan

## 📚 Recursos y Documentación

### Documentación Oficial

-   [React 19 Docs](https://react.dev/)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [Vite Guide](https://vitejs.dev/guide/)
-   [Firebase Docs](https://firebase.google.com/docs)
-   [Capacitor Docs](https://capacitorjs.com/docs)

### Tutoriales Internos

-   📝 Cómo crear una nueva herramienta
-   📝 Guía de contribución al proyecto
-   📝 Mejores prácticas de código

## 🤝 Contribuir

Este es un proyecto privado. Para colaborar:

1. Clonar el repositorio
2. Crear una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commitear cambios: `git commit -am 'Añade nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Guía de Estilo

-   Usar TypeScript estricto
-   Componentes funcionales con hooks
-   Nombres descriptivos en inglés
-   Comentarios en español cuando sean necesarios
-   Formatear con Prettier antes de commit

## 🗺️ Roadmap

### Q1 2025

-   ✅ Lanzamiento v2.0.0
-   ⏳ Tests E2E con Playwright
-   ⏳ Modo colaborativo (múltiples usuarios)

### Q2 2025

-   ⏳ Internacionalización completa
-   ⏳ Marketplace de plantillas
-   ⏳ Integración con Stripe para pagos

### Q3 2025

-   ⏳ App móvil nativa (React Native)
-   ⏳ Extensión de Chrome
-   ⏳ API pública para integraciones

## 📝 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo de cambios.

## 📄 Licencia

**Propietario** - © 2025 ModoFreelance. Todos los derechos reservados.

Este software es propietario y confidencial. No se permite la distribución, modificación o uso comercial sin autorización explícita.

## 📧 Contacto y Soporte

-   **Email:** castillovictor2461@gmail.com
-   **Website:** [modofreelanceos.vercel.app](https://modofreelanceos.com)

## 👨‍💻 Equipo de Desarrollo

-   **Víctor Castillo** - Fundador & Lead Developer

---

**Versión:** 2.0.0  
**Última actualización:** Febrero 2025  
**Build:** Stable

¡Gracias por usar ModoFreelanceOS! 🚀
