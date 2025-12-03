import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    PenTool,
    Download,
    Menu,
    X,
    LogOut,
    Code,
    User as UserIcon,
    CheckCircle, // <--- AGREGA ESTO
    Sparkles,
    History,
    Palette,
    FileText,
    StickyNote,
    PenLine,
    Check,
    Bell,
    QrCode,
    Zap,
    FileSearch,
    DollarSign,
} from 'lucide-react'
import { DashboardTips } from './components/DashboardTips'
import { ProposalTool } from './views/ProposalTool'
import { FinanceView } from './views/FinanceView'
import { AuthView } from './views/Auth' // Importamos la nueva vista
import { PricingModal, ConfirmationModal } from './components/ui'
import { AppView, UserState } from './types'
import { HistoryView } from './views/HistoryView'
import { LogoTool } from './views/LogoTool' // <--- Importa la vista nueva
import { InvoiceTool } from './views/InvoiceTool'
import { NotesView } from './views/NotesView'
import { DashboardPinnedNotes } from './components/DashboardPinnedNotes'
import { SupportWidget } from './components/SupportWidget'
import { useAgendaNotifications } from './hooks/useAgendaNotifications'
import { QRTool } from './views/QRTool' // <--- AGREGAR ESTA LÍNEA
import { OptimizerTool } from './views/OptimizerTool'
import { AnalyzerTool } from './views/AnalyzerTool'
import { NotificationModal } from './components/ui/NotificationModal'
import { AIAssistant } from './components/AIAssistant'
import { DashboardUpcomingEvents } from './components/DashboardUpcomingEvents'

// Firebase
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
const GUMROAD_LINK = 'https://modofreelanceos.gumroad.com/l/pro-plan'
const WORDPRESS_URL = 'http://modofreelanceos.com/'

const App = () => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [autoOpenAgenda, setAutoOpenAgenda] = useState(false)
    const [showNoEventsToast, setShowNoEventsToast] = useState(false)
    // Estado del Usuario
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [userState, setUserState] = useState<UserState>({
        isSubscribed: false,
        credits: 0,
    })
    const [showSuccessMsg, setShowSuccessMsg] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const notifications = useAgendaNotifications(firebaseUser?.uid)
    const agendaAlerts = notifications.filter((n) => n.type === 'agenda').length
    const financeAlerts = notifications.filter(
        (n) => n.type === 'finance'
    ).length
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const showAlert = (title: string, message: string) => {
        setAlertModal({ isOpen: true, title, message })
    }
    // 1. Escuchar autenticación al cargar
    // 1. Escuchar autenticación al cargar
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setFirebaseUser(currentUser)

            if (currentUser) {
                // Usuario logueado: Descargar sus datos de la DB
                await fetchUserData(currentUser.uid)

                // --- NUEVO: DETECTAR SI VIENE DE PAGAR EN GUMROAD ---
                const urlParams = new URLSearchParams(window.location.search)
                if (urlParams.get('payment_success') === 'true') {
                    await activateProPlan(currentUser.uid)
                }
                // ----------------------------------------------------

                if (currentView === AppView.LANDING)
                    setCurrentView(AppView.DASHBOARD)
            } else {
                setUserState({ isSubscribed: false, credits: 0 })
            }
            setLoadingAuth(false)
        })
        return () => unsubscribe()
    }, [])
    const handleBellClick = () => {
        setIsNotifOpen(!isNotifOpen)
    }
    const handleNotificationNavigation = (route: string) => {
        if (route === 'NOTES') {
            setAutoOpenAgenda(true)
            setCurrentView(AppView.NOTES)
            // Resetear auto-open
            setTimeout(() => setAutoOpenAgenda(false), 2000)
        } else if (route === 'FINANCES') {
            // Verificamos si es PRO antes de enviar
            if (userState.isSubscribed) {
                setCurrentView(AppView.FINANCES)
            } else {
                setIsPricingOpen(true)
            }
        }
        setIsMobileMenuOpen(false)
    }
    const handleSaveName = async () => {
        if (!firebaseUser || !displayName.trim()) return
        try {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
                displayName: displayName,
            })
            setIsEditingName(false)
        } catch (error) {
            console.error('Error guardando nombre', error)
        }
    }
    // Función MEJORADA para leer datos y auto-reparar usuarios nuevos
    const fetchUserData = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid)
            const docSnap = await getDoc(docRef)

            const now = Date.now()
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000

            if (docSnap.exists()) {
                const data = docSnap.data()

                // 1. RECUPERAR DATOS BÁSICOS
                const nameFromDb = data.displayName || data.email?.split('@')[0]
                setDisplayName(nameFromDb)

                let isSub = data.isSubscribed || false
                let credits = data.credits !== undefined ? data.credits : 0
                let subEnd = data.subscriptionEnd // Puede ser undefined en usuarios viejos

                // 2. LÓGICA FREE: ASEGURAR 'lastReset'
                // Si no existe lastReset, usamos createdAt. Si tampoco existe, usamos ahora.
                // Esto arregla el problema de que la fecha se "mueva" sola.
                let lastReset = data.lastReset

                if (!lastReset) {
                    // Auto-corrección para usuarios como Adriana
                    const createdTime = data.createdAt
                        ? new Date(data.createdAt).getTime()
                        : now
                    lastReset = createdTime
                    // Guardamos la corrección en Firebase para que no vuelva a pasar
                    await updateDoc(docRef, { lastReset: createdTime })
                }

                // 3. VERIFICAR SI TOCA RENOVAR CRÉDITOS (Solo si no es PRO)
                if (!isSub) {
                    const timeDiff = now - lastReset
                    // Si ha pasado más de una semana
                    if (timeDiff > oneWeekMs) {
                        console.log('¡Semana completada! Renovando créditos...')
                        credits = 3 // Reseteamos a 3
                        lastReset = now // Marcamos hoy como el nuevo inicio de semana

                        // Actualizamos en Firebase
                        await updateDoc(docRef, {
                            credits: 3,
                            lastReset: now,
                        })
                    }
                }

                // 4. LÓGICA PRO: VERIFICAR VENCIMIENTO
                if (isSub) {
                    // Si es PRO pero no tiene fecha de fin (ej: cuentas viejas de prueba),
                    // asumimos que venció o le damos un mes de gracia.
                    // Aquí seremos estrictos: Si no hay fecha, se asume vencido (o puedes regalarle 30 días).
                    // Vamos a asumir que si pagó, debe tener fecha. Si no la tiene, lo bajamos a Free para obligar a corregir.

                    const expirationTime = subEnd || 0 // Si no tiene fecha, es 0 (1970)

                    if (now > expirationTime) {
                        console.log('Suscripción vencida. Degradando a Free...')
                        isSub = false
                        credits = 3
                        lastReset = now // Empezamos su ciclo free hoy

                        await updateDoc(docRef, {
                            isSubscribed: false,
                            credits: 3,
                            lastReset: now,
                            subscriptionEnd: null, // Limpiamos
                        })
                        showAlert(
                            'Plan Vencido',
                            'Tu plan PRO ha finalizado. Has vuelto al plan gratuito con 3 créditos semanales.'
                        )
                    }
                }

                // 5. CALCULAR PRÓXIMA FECHA PARA MOSTRAR EN UI
                const nextResetDate = lastReset + oneWeekMs

                // 6. GUARDAR EN ESTADO LOCAL
                setUserState({
                    isSubscribed: isSub,
                    credits: credits,
                    subscriptionEnd: subEnd,
                    nextReset: nextResetDate,
                })
            } else {
                // CASO: Usuario existe en Auth pero no en DB (Error de registro)
                console.log('Creando perfil de emergencia...')
                const initialData = {
                    email: auth.currentUser?.email,
                    credits: 3,
                    isSubscribed: false,
                    createdAt: new Date().toISOString(),
                    lastReset: now,
                    displayName: auth.currentUser?.displayName || '',
                }
                await setDoc(docRef, initialData)
                setUserState({
                    isSubscribed: false,
                    credits: 3,
                    nextReset: now + oneWeekMs,
                })
            }
        } catch (error) {
            console.error('Error fetchUserData:', error)
        }
    }

    // Función para activar el plan PRO en la base de datos
    const activateProPlan = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid)

            // Calculamos: Hoy + 30 días
            const now = new Date()
            const expirationDate = new Date()
            expirationDate.setDate(now.getDate() + 30) // Sumamos 30 días

            await updateDoc(docRef, {
                isSubscribed: true,
                credits: 9999,
                // Guardamos la fecha en formato timestamp (número)
                subscriptionEnd: expirationDate.getTime(),
            })

            setUserState((prev) => ({
                ...prev,
                isSubscribed: true,
                credits: 9999,
            }))
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            )
            showAlert(
                '¡Pago Exitoso!',
                `Suscripción PRO activa. Tu plan es válido hasta el ${expirationDate.toLocaleDateString()}. ¡Disfruta!`
            )
            setShowSuccessMsg(true)
            setTimeout(() => setShowSuccessMsg(false), 5000)
        } catch (error) {
            console.error('Error activando plan:', error)
        }
    }

    const NavItem = ({ icon, label, active, onClick, badge }: any) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                active
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
        >
            <div className="flex items-center space-x-3">
                {React.cloneElement(icon, { size: 20 })}
                <span className="font-medium">{label}</span>
            </div>

            {/* RENDERIZADO DEL BADGE (Puntito rojo con número) */}
            {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                    {badge}
                </span>
            )}
        </button>
    )
    // Función para gastar créditos en la nube
    // Modificación en src/App.tsx

    // Modificamos para aceptar un costo (por defecto 1)
    const handleFeatureUsage = async (cost: number = 1): Promise<boolean> => {
        // Si es PRO, pase usted (Gratis)
        if (userState.isSubscribed) return true

        // Si tiene suficientes créditos para cubrir el costo
        if (userState.credits >= cost && firebaseUser) {
            const newCredits = userState.credits - cost

            // Actualizar visualmente
            setUserState((prev) => ({ ...prev, credits: newCredits }))

            // Actualizar base de datos
            const docRef = doc(db, 'users', firebaseUser.uid)
            updateDoc(docRef, { credits: newCredits })

            return true // APROBADO
        } else {
            setIsPricingOpen(true) // No alcanza
            return false // DENEGADO
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        setCurrentView(AppView.LANDING)
        setIsMobileMenuOpen(false)
    }

    const handleSubscribe = () => {
        if (!firebaseUser) return
        // Abrimos Gumroad en una nueva pestaña o en la misma
        window.location.href = GUMROAD_LINK
    }

    // Lógica de Vistas
    if (loadingAuth) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">
                Cargando ModoFreelanceOS...
            </div>
        )
    }

    // Si no hay usuario y no estamos en landing, mostrar Login
    if (!firebaseUser) {
        return (
            <AuthView
                onLoginSuccess={() => setCurrentView(AppView.DASHBOARD)}
                onBack={() => (window.location.href = WORDPRESS_URL)} // Botón volver
            />
        )
    }

    // CONTENIDO DEL DASHBOARD
    const renderContent = () => {
        switch (currentView) {
            case AppView.PROPOSALS:
                return (
                    <ProposalTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.INVOICES:
                return (
                    <InvoiceTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.TEMPLATES:
                return (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Plantillas & Contratos
                        </h2>
                        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
                            <Code className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">
                                Sección de Plantillas
                            </h3>
                            <p className="text-slate-500">
                                Aquí irán tus documentos descargables.
                            </p>
                        </div>
                    </div>
                )
            case AppView.HISTORY:
                return <HistoryView userId={firebaseUser?.uid} />
            case AppView.LOGOS:
                return (
                    <LogoTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.NOTES:
                return <NotesView userId={firebaseUser?.uid} />
            case AppView.NOTES:
                return (
                    <NotesView
                        userId={firebaseUser?.uid}
                        autoOpenAgenda={autoOpenAgenda}
                    />
                )
            case AppView.QR:
                return (
                    <QRTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.OPTIMIZER:
                return <OptimizerTool onUsage={handleFeatureUsage} />
            case AppView.ANALYZER:
                return (
                    <AnalyzerTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.QR:
                // Agregamos userId
                return (
                    <QRTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )

            case AppView.OPTIMIZER:
                return (
                    <OptimizerTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.FINANCES:
                return <FinanceView userId={firebaseUser?.uid} />
            default:
                return (
                    <div className="max-w-4xl mx-auto py-8">
                        {/* Mensaje de Pago Exitoso (Solo aparece si showSuccessMsg es true) */}
                        {showSuccessMsg && (
                            <div className="mb-6 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce">
                                <CheckCircle className="w-6 h-6" />
                                <span className="font-bold">
                                    ¡Pago recibido! Tu cuenta ahora es PRO.
                                </span>
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h2 className="text-3xl font-bold text-slate-800">
                                    Hola,
                                </h2>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={displayName}
                                            onChange={(e) =>
                                                setDisplayName(e.target.value)
                                            }
                                            className="text-3xl font-bold text-slate-800 border-b-2 border-brand-500 outline-none w-40 bg-transparent"
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            className="bg-brand-100 p-1 rounded-full text-brand-700 hover:bg-brand-200"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group">
                                        <span className="text-3xl font-bold text-slate-800">
                                            {displayName} 👋
                                        </span>
                                        <button
                                            onClick={() =>
                                                setIsEditingName(true)
                                            }
                                            className="opacity-100 md:opacity-70 md:group-hover:opacity-100 text-slate-400 hover:text-brand-600 transition-opacity"
                                        >
                                            <PenLine className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500">
                                Bienvenido a tu Dashboard.
                            </p>
                        </div>

                        {/* Tarjeta de Créditos */}
                        <div className="flex justify-center gap-4 mb-10">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full md:w-64 flex flex-col items-center">
                                <div className="text-3xl font-bold text-brand-600">
                                    {userState.isSubscribed
                                        ? '∞'
                                        : userState.credits}
                                </div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">
                                    {userState.isSubscribed
                                        ? 'Créditos Ilimitados'
                                        : 'Créditos Disponibles'}
                                </div>
                                <div className="w-full border-t border-slate-100 pt-3 text-center">
                                    {userState.isSubscribed ? (
                                        // CASO PRO: Muestra vencimiento del plan
                                        <p className="text-xs text-brand-600 font-medium">
                                            Tu plan vence el: <br />
                                            <span className="font-bold text-slate-700 text-sm">
                                                {userState.subscriptionEnd
                                                    ? new Date(
                                                          userState.subscriptionEnd
                                                      ).toLocaleDateString()
                                                    : '30 Días desde activación'}
                                            </span>
                                        </p>
                                    ) : (
                                        // CASO FREE: Muestra renovación de créditos
                                        <p className="text-xs text-slate-400">
                                            Se renuevan el: <br />
                                            <span className="font-bold text-slate-600 text-sm">
                                                {userState.nextReset
                                                    ? new Date(
                                                          userState.nextReset
                                                      ).toLocaleDateString()
                                                    : 'Próximamente'}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* SECCIÓN DE AGENDA INMEDIATA (NUEVO) */}
                        {firebaseUser && (
                            <DashboardUpcomingEvents
                                userId={firebaseUser.uid}
                                onGoToAgenda={() => {
                                    setAutoOpenAgenda(true) // Abrir agenda en movil
                                    setCurrentView(AppView.NOTES)
                                    setTimeout(
                                        () => setAutoOpenAgenda(false),
                                        2000
                                    )
                                }}
                            />
                        )}
                        {/* SECCIÓN DE NOTAS FIJADAS (NUEVO) */}
                        {firebaseUser && (
                            <DashboardPinnedNotes
                                userId={firebaseUser.uid}
                                onGoToNotes={() =>
                                    setCurrentView(AppView.NOTES)
                                }
                            />
                        )}

                        {/* Componente de Tips */}
                        <DashboardTips />
                    </div>
                )
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center gap-4">
                <span // 1. AGREGAMOS EL EVENTO CLICK AQUÍ
                    onClick={() => {
                        setCurrentView(AppView.DASHBOARD)
                        setIsMobileMenuOpen(false)
                    }}
                    // 2. AGREGAMOS 'cursor-pointer' PARA QUE SE VEA CLICKEABLE
                    className="font-bold text-xl tracking-tight text-slate-900 cursor-pointer"
                >
                    ModoFreelance<span className="text-brand-600">OS</span>
                </span>
                <div className="flex items-center gap-4 relative">
                    {/* TOAST FLOTANTE "NO HAY EVENTOS" */}
                    {showNoEventsToast && (
                        <div className="absolute top-10 right-0 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg shadow-xl z-50 text-center animate-in fade-in slide-in-from-top-2">
                            <span className="block font-bold">
                                Todo tranquilo 😎
                            </span>
                            No hay eventos próximos.
                            {/* Triangulito decorativo */}
                            <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                    )}

                    {/* CAMPANA */}
                    <div className="relative">
                        {' '}
                        {/* Importante: El div relative para posicionar el modal */}
                        <button
                            onClick={handleBellClick}
                            className="relative text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
                        >
                            <Bell className="w-6 h-6" />

                            {/* CORRECCIÓN: Usamos notifications.length */}
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white animate-bounce ring-2 ring-white">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        {/* CORRECCIÓN: Pasamos la variable correcta */}
                        <NotificationModal
                            isOpen={isNotifOpen}
                            onClose={() => setIsNotifOpen(false)}
                            notifications={notifications}
                            onNavigate={handleNotificationNavigation}
                        />
                    </div>
                    {/* BOTÓN MENÚ */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-900"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)} // AQUÍ ESTÁ LA MAGIA
                />
            )}
            {/* Sidebar */}
            <aside
                className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen border-r border-slate-800
      `}
            >
                {/* 1. HEADER (LOGO) - Tamaño Fijo */}
                <div className="p-6 shrink-0">
                    <h1
                        className="text-2xl font-bold text-white tracking-tight cursor-pointer"
                        onClick={() => {
                            setCurrentView(AppView.DASHBOARD)
                            setIsMobileMenuOpen(false)
                        }}
                    >
                        ModoFreelance<span className="text-brand-500">OS</span>
                    </h1>
                </div>

                {/* 2. MENÚ DE NAVEGACIÓN - Flexible (Ocupa el espacio disponible y hace scroll si es necesario) */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Inicio"
                        active={currentView === AppView.DASHBOARD}
                        onClick={() => {
                            setCurrentView(AppView.DASHBOARD)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<PenTool />}
                        label="Propuestas IA"
                        active={currentView === AppView.PROPOSALS}
                        onClick={() => {
                            setCurrentView(AppView.PROPOSALS)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<StickyNote />}
                        label="Agenda & Notas"
                        active={currentView === AppView.NOTES}
                        badge={agendaAlerts} // <--- PASAMOS EL CONTADOR DE AGENDA
                        onClick={() => {
                            setCurrentView(AppView.NOTES)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<DollarSign />}
                        label="Finanzas"
                        active={currentView === AppView.FINANCES}
                        badge={financeAlerts} // <--- PASAMOS EL CONTADOR DE FINANZAS
                        onClick={() => {
                            if (userState.isSubscribed) {
                                setCurrentView(AppView.FINANCES)
                                setIsMobileMenuOpen(false)
                            } else {
                                setIsPricingOpen(true)
                            }
                        }}
                    />
                    <NavItem
                        icon={<Palette />}
                        label="Generador Logos"
                        active={currentView === AppView.LOGOS}
                        onClick={() => {
                            setCurrentView(AppView.LOGOS)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Facturación"
                        active={currentView === AppView.INVOICES}
                        onClick={() => {
                            setCurrentView(AppView.INVOICES)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<QrCode />}
                        label="Generador QR"
                        active={currentView === AppView.QR}
                        onClick={() => {
                            setCurrentView(AppView.QR)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<Zap />}
                        label="Optimizar Img"
                        active={currentView === AppView.OPTIMIZER}
                        onClick={() => {
                            setCurrentView(AppView.OPTIMIZER)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<FileSearch />}
                        label="Analizar Doc"
                        active={currentView === AppView.ANALYZER}
                        onClick={() => {
                            setCurrentView(AppView.ANALYZER)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    {/* <NavItem
                        icon={<Code />}
                        label="Plantillas"
                        active={currentView === AppView.TEMPLATES}
                        onClick={() => {
                            setCurrentView(AppView.TEMPLATES)
                            setIsMobileMenuOpen(false)
                        }}
                    /> */}
                    <NavItem
                        icon={<History />}
                        label="Historial"
                        active={currentView === AppView.HISTORY}
                        onClick={() => {
                            setCurrentView(AppView.HISTORY)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                </nav>

                {/* 3. FOOTER (Usuario + Créditos + Logout) - Tamaño Fijo y Pegado al Fondo */}
                <div className="p-4 bg-slate-900 shrink-0 border-t border-slate-800">
                    {/* Tarjeta de Usuario/Créditos */}
                    <div className="bg-slate-800 p-3 rounded-xl mb-3">
                        <div className="flex items-center gap-2 mb-2 text-white">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-xs truncate max-w-[120px] font-medium">
                                {firebaseUser?.email?.split('@')[0]}
                            </span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                            <span className="text-[10px] font-bold text-white uppercase">
                                {userState.isSubscribed ? 'PLAN PRO' : 'FREE'}
                            </span>
                            {!userState.isSubscribed && (
                                <span className="text-[10px] text-brand-400 font-bold">
                                    {userState.credits} créd.
                                </span>
                            )}
                        </div>

                        {!userState.isSubscribed && (
                            <button
                                onClick={() => setIsPricingOpen(true)}
                                className="w-full mt-2 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide"
                            >
                                Ser PRO ($10)
                            </button>
                        )}
                    </div>

                    {/* Botón Cerrar Sesión */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    {renderContent()}
                </div>
            </main>
            <SupportWidget />
            <AIAssistant
                userId={firebaseUser?.uid}
                onUsage={handleFeatureUsage}
            />

            <PricingModal
                isOpen={isPricingOpen}
                onClose={() => setIsPricingOpen(false)}
                onSubscribe={handleSubscribe}
            />
            <ConfirmationModal
                isOpen={alertModal.isOpen}
                onClose={() =>
                    setAlertModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={() =>
                    setAlertModal((prev) => ({ ...prev, isOpen: false }))
                }
                title={alertModal.title}
                message={alertModal.message}
                confirmText="Entendido"
                cancelText="" // Truco para ocultar botón cancelar
            />
        </div>
    )
}

// Componente auxiliar pequeño
const NavItem = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={() => {
            onClick()
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            active
                ? 'bg-brand-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
        }`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-medium">{label}</span>
    </button>
)

export default App
