import React, { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    PenTool,
    Menu,
    X,
    LogOut,
    User as UserIcon,
    CheckCircle,
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
    Moon,
    Sun,
    Briefcase,
    ClipboardList,
    Globe,
    Timer,
    FileUser,
    Play,
    Pause,
    GraduationCap,
    Radar,
    ShieldAlert,
    Monitor,
} from 'lucide-react'
import { PomodoroProvider, usePomodoro } from './context/PomodoroContext'
import { useTheme } from './context/ThemeContext'
import { DashboardTips } from './components/DashboardTips'
import { ProposalTool } from './views/ProposalTool'
import { FinanceView } from './views/FinanceView'
import { AuthView } from './views/Auth'
import { PricingModal, ConfirmationModal } from './components/ui'
import { AppView, UserState } from './types'
import { HistoryView } from './views/HistoryView'
import { LogoTool } from './views/LogoTool'
import { InvoiceTool } from './views/InvoiceTool'
import { NotesView } from './views/NotesView'
import { DashboardPinnedNotes } from './components/DashboardPinnedNotes'
import { SupportWidget } from './components/SupportWidget'
import { useAgendaNotifications } from './hooks/useAgendaNotifications'
import { QRTool } from './views/QRTool'
import { OptimizerTool } from './views/OptimizerTool'
import { AnalyzerTool } from './views/AnalyzerTool'
import { NotificationModal } from './components/ui/NotificationModal'
import { AIAssistant } from './components/AIAssistant'
import { DashboardUpcomingEvents } from './components/DashboardUpcomingEvents'
import { PortfolioTool } from './views/PortfolioTool'
import { BriefingTool } from './views/BriefingTool'
import { UpdateChecker } from './components/UpdateChecker'
import { FiverrTool } from './views/FiverrTool'
import { PomodoroTool } from './views/PomodoroTool'
import { CVBuilder } from './views/CVBuilder'
import { JobsView } from './views/JobsView'
import { AcademyView } from './views/AcademyView'
import { AdminDashboard } from './views/AdminDashboard'
import { WebsiteBuilder } from './views/WebsiteBuilder'
import { Capacitor } from '@capacitor/core'
// Firebase
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
const GUMROAD_LINK = 'https://modofreelanceos.gumroad.com/l/pro-subs'
const WORDPRESS_URL = 'http://modofreelanceos.com/'
const BACKEND_URL = import.meta.env.PROD
    ? 'https://backend-freelanceos.onrender.com' // Se usa en Vercel, Windows (.exe) y Android (.apk)
    : 'http://localhost:8000' // Se usa solo en tu PC cuando haces "npm run dev"

const ADMIN_EMAILS = ['castillovictor2461@gmail.com']
const DashboardPomodoroWidget = ({
    onGoToPomodoro,
}: {
    onGoToPomodoro: () => void
}) => {
    const { isActive, timeLeft, toggleTimer, mode } = usePomodoro()

    // Solo mostrar si está activo o en pausa (no reseteado)
    const totalTime = mode === 'work' ? 1500 : mode === 'short' ? 300 : 900
    if (timeLeft === totalTime && !isActive) return null

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="mb-6 bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-l-4 border-brand-500 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full animate-pulse ${
                        mode === 'work' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                ></div>
                <div>
                    <p className="text-xs font-bold uppercase opacity-70">
                        {mode === 'work' ? 'Focus Mode' : 'Descanso'}
                    </p>
                    <p className="text-2xl font-mono font-bold tracking-widest">
                        {formatTime(timeLeft)}
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={toggleTimer}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                    {isActive ? (
                        <Pause className="w-5 h-5" />
                    ) : (
                        <Play className="w-5 h-5" />
                    )}
                </button>
                <button
                    onClick={onGoToPomodoro}
                    className="px-3 py-2 bg-brand-600 rounded-lg text-xs font-bold hover:bg-brand-500"
                >
                    Ver
                </button>
            </div>
        </div>
    )
}

const AppContent = () => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [autoOpenAgenda, setAutoOpenAgenda] = useState(false)
    const [showNoEventsToast, setShowNoEventsToast] = useState(false)
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
        (n) => n.type === 'finance',
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
    const { theme, toggleTheme } = useTheme()
    const sendWakeUpPing = async () => {
        try {
            console.log('Sending Wake-Up Ping to backend...')
            // Llamamos al endpoint más ligero (el /) sin esperar la respuesta
            await fetch(BACKEND_URL, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            })
            console.log('Ping sent (status: 200/timeout expected)')
        } catch (error) {
            // Esto es normal si el servidor está dormido (timeout) o si es localhost
            console.log(
                'Ping complete or timed out (Normal behavior for cold start)',
            )
        }
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setFirebaseUser(currentUser)

                // 1. Cargar datos visuales RÁPIDO (Solo Firebase)
                await fetchUserData(currentUser.uid)

                // 2. Despertar al servidor y Sincronizar en SEGUNDO PLANO (Sin await)
                // Esto permite que la interfaz cargue sin esperar al servidor
                sendWakeUpPing()
                syncWithBackend(currentUser.uid)

                // Chequeo de pagos (url params)
                const urlParams = new URLSearchParams(window.location.search)
                if (urlParams.get('payment_success') === 'true') {
                    activateProPlan(currentUser.uid) // Esto no bloquea la carga inicial
                }

                if (currentView === AppView.LANDING)
                    setCurrentView(AppView.DASHBOARD)
            } else {
                setFirebaseUser(null)
                setUserState({ isSubscribed: false, credits: 0 })
                setLoadingAuth(false)
            }
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
            setTimeout(() => setAutoOpenAgenda(false), 2000)
        } else if (route === 'FINANCES') {
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

    // FUSIÓN: Lógica robusta antigua + Sincronización en segundo plano
    const fetchUserData = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid)
            const docSnap = await getDoc(docRef) // Esto tarda milisegundos
            const now = Date.now()
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000

            // Valores por defecto
            let finalIsSubscribed = false
            let finalCredits = 3
            let finalSubEnd = null
            let finalLastReset = now

            if (docSnap.exists()) {
                const data = docSnap.data()
                setDisplayName(
                    data.displayName ||
                        firebaseUser?.email?.split('@')[0] ||
                        'Usuario',
                )

                // Lógica local rápida
                let isSub = data.isSubscribed || false
                let credits = data.credits !== undefined ? data.credits : 0
                let subEnd = data.subscriptionEnd
                let lastReset = data.lastReset || now

                // Verificar caducidad localmente
                if (isSub && subEnd && now > subEnd) {
                    isSub = false
                    credits = 3
                    lastReset = now
                    subEnd = null
                    // Actualizamos Firebase sin bloquear
                    updateDoc(docRef, {
                        isSubscribed: false,
                        credits: 3,
                        lastReset: now,
                        subscriptionEnd: null,
                    })
                    showAlert('Plan Vencido', 'Tu plan PRO ha finalizado.')
                }

                finalIsSubscribed = isSub
                finalCredits = credits
                finalSubEnd = subEnd
                finalLastReset = lastReset
            } else {
                // Crear usuario si no existe (rápido)
                await setDoc(docRef, {
                    email: auth.currentUser?.email,
                    credits: 3,
                    isSubscribed: false,
                    createdAt: new Date().toISOString(),
                    lastReset: now,
                    signupPlatform: Capacitor.isNativePlatform()
                        ? 'Mobile'
                        : 'Web',
                })
            }

            // ACTUALIZAR ESTADO VISUAL DE INMEDIATO
            setUserState({
                isSubscribed: finalIsSubscribed,
                credits: finalCredits,
                subscriptionEnd: finalSubEnd,
                nextReset: finalLastReset + oneWeekMs,
            })
        } catch (error) {
            console.error('Error fetchUserData:', error)
        } finally {
            // IMPORTANTE: Quitamos el loading AQUÍ, pase lo que pase
            setLoadingAuth(false)
        }
    }

    // Nueva función separada para hablar con el Backend
    const syncWithBackend = async (uid: string) => {
        try {
            // Detectar Plataforma
            let currentPlatform = 'Web Browser'
            if (Capacitor.isNativePlatform()) currentPlatform = 'Android App'
            else if (navigator.userAgent.toLowerCase().includes(' electron/'))
                currentPlatform = 'Windows App'
            const formData = new FormData()
            formData.append('platform', currentPlatform)
            formData.append('userId', uid)

            // Esta llamada puede tardar 40s si Render duerme, pero el usuario ya está usando la app
            const response = await fetch(`${BACKEND_URL}/api/check-status`, {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const result = await response.json()
                const data = result.data

                // Si el backend responde, actualizamos la interfaz con los datos "reales" y frescos
                console.log('Backend sincronizado: Datos actualizados.')

                setUserState({
                    isSubscribed: data.isSubscribed || false,
                    credits: data.credits !== undefined ? data.credits : 0,
                    subscriptionEnd: data.subscriptionEnd,
                    nextReset: (data.lastReset || Date.now()) + 604800000,
                })
            }
        } catch (error) {
            // Si falla el backend, no pasa nada grave, el usuario sigue usando los datos locales
            console.log(
                'Backend todavía despertando o error de red (no crítico).',
            )
        }
    }

    const activateProPlan = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid)
            const now = new Date()
            const expirationDate = new Date()
            expirationDate.setDate(now.getDate() + 30)

            await updateDoc(docRef, {
                isSubscribed: true,
                credits: 9999,
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
                window.location.pathname,
            )
            showAlert(
                '¡Pago Exitoso!',
                `Suscripción PRO activa. Tu plan es válido hasta el ${expirationDate.toLocaleDateString()}. ¡Disfruta!`,
            )
            setShowSuccessMsg(true)
            setTimeout(() => setShowSuccessMsg(false), 5000)
        } catch (error) {
            console.error('Error activando plan:', error)
        }
    }

    const NavItem = ({ icon, label, active, onClick, badge }: any) => (
        <button
            onClick={(e) => {
                e.preventDefault() // Prevenir comportamiento default
                onClick()
            }}
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
            {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                    {badge}
                </span>
            )}
        </button>
    )

    const handleFeatureUsage = async (cost: number = 1): Promise<boolean> => {
        if (userState.isSubscribed) return true
        if (userState.credits >= cost && firebaseUser) {
            const newCredits = userState.credits - cost
            setUserState((prev) => ({ ...prev, credits: newCredits }))
            const docRef = doc(db, 'users', firebaseUser.uid)
            updateDoc(docRef, { credits: newCredits })
            return true
        } else {
            setIsPricingOpen(true)
            return false
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        setCurrentView(AppView.LANDING)
        setIsMobileMenuOpen(false)
    }

    const handleSubscribe = () => {
        if (!firebaseUser) return
        window.location.href = GUMROAD_LINK
    }

    if (loadingAuth) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                Cargando ModoFreelanceOS...
            </div>
        )
    }

    if (!firebaseUser) {
        return (
            <AuthView
                onLoginSuccess={() => setCurrentView(AppView.DASHBOARD)}
                onBack={() => (window.location.href = WORDPRESS_URL)}
            />
        )
    }

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
                return (
                    <OptimizerTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.ANALYZER:
                return (
                    <AnalyzerTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.FINANCES:
                return <FinanceView userId={firebaseUser?.uid} />

            case AppView.PORTFOLIO:
                return (
                    <PortfolioTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.BRIEFING:
                return (
                    <BriefingTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.FIVERR:
                return (
                    <FiverrTool
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.POMODORO:
                return <PomodoroTool />
            case AppView.CV_BUILDER:
                return (
                    <CVBuilder
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.JOBS:
                return (
                    <JobsView
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.ACADEMY:
                return (
                    <AcademyView
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            case AppView.ADMIN:
                return <AdminDashboard userId={firebaseUser?.uid} />
            case AppView.WEBSITE_BUILDER:
                // CANDADO PRO: Si no está suscrito, mostramos pantalla de bloqueo
                if (!userState.isSubscribed) {
                    return (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                <Monitor className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                Función Exclusiva PRO
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                                El Constructor de Portafolios Web te permite
                                tener tu propia página web profesional.
                                Actualiza tu plan para acceder.
                            </p>
                            <button
                                onClick={() => setIsPricingOpen(true)}
                                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                            >
                                Desbloquear Ahora
                            </button>
                        </div>
                    )
                }
                // Si es PRO, mostramos la herramienta
                return (
                    <WebsiteBuilder
                        onUsage={handleFeatureUsage}
                        userId={firebaseUser?.uid}
                    />
                )
            default:
                return (
                    <div className="max-w-4xl mx-auto py-8">
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
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
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
                                            className="text-3xl font-bold text-slate-800 dark:text-white border-b-2 border-brand-500 outline-none w-40 bg-transparent"
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
                                        <span className="text-3xl font-bold text-slate-800 dark:text-white">
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
                            <p className="text-slate-500 dark:text-slate-400">
                                Bienvenido a tu Dashboard.
                            </p>
                        </div>

                        <div className="flex justify-center gap-4 mb-10">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-64 flex flex-col items-center">
                                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                                    {userState.isSubscribed
                                        ? '∞'
                                        : userState.credits}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-1">
                                    {userState.isSubscribed
                                        ? 'Créditos Ilimitados'
                                        : 'Créditos Disponibles'}
                                </div>
                                <div className="w-full border-t border-slate-100 dark:border-slate-700 pt-3 text-center">
                                    {userState.isSubscribed ? (
                                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                                            Tu plan vence el: <br />
                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                {userState.subscriptionEnd
                                                    ? new Date(
                                                          userState.subscriptionEnd,
                                                      ).toLocaleDateString()
                                                    : '30 Días desde activación'}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            Se renuevan el: <br />
                                            <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">
                                                {userState.nextReset
                                                    ? new Date(
                                                          userState.nextReset,
                                                      ).toLocaleDateString()
                                                    : 'Próximamente'}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DashboardPomodoroWidget
                            onGoToPomodoro={() =>
                                setCurrentView(AppView.POMODORO)
                            }
                        />
                        {firebaseUser && (
                            <DashboardUpcomingEvents
                                userId={firebaseUser.uid}
                                onGoToAgenda={() => {
                                    setAutoOpenAgenda(true)
                                    setCurrentView(AppView.NOTES)
                                    setTimeout(
                                        () => setAutoOpenAgenda(false),
                                        2000,
                                    )
                                }}
                            />
                        )}
                        {firebaseUser && (
                            <DashboardPinnedNotes
                                userId={firebaseUser.uid}
                                onGoToNotes={() =>
                                    setCurrentView(AppView.NOTES)
                                }
                            />
                        )}
                        <DashboardTips />
                    </div>
                )
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <UpdateChecker />
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-4 py-3 flex justify-between items-center gap-4 transition-colors">
                <span
                    onClick={() => {
                        setCurrentView(AppView.DASHBOARD)
                        setIsMobileMenuOpen(false)
                    }}
                    className="text-slate-900 dark:text-white font-bold text-xl tracking-tight cursor-pointer"
                >
                    ModoFreelance<span className="text-brand-600">OS</span>
                </span>
                <div className="flex items-center gap-4 relative">
                    {showNoEventsToast && (
                        <div className="absolute top-10 right-0 w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs p-2 rounded-lg shadow-xl z-50 text-center animate-in fade-in slide-in-from-top-2">
                            <span className="block font-bold">
                                Todo tranquilo 😎
                            </span>
                            No hay eventos próximos.
                            <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45"></div>
                        </div>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-6 h-6" />
                        ) : (
                            <Moon className="w-6 h-6" />
                        )}
                    </button>
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="text-slate-600 dark:text-slate-300 relative hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-full transition-colors"
                        >
                            <Bell className="w-6 h-6" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white animate-bounce ring-2 ring-white dark:ring-slate-900">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <NotificationModal
                            isOpen={isNotifOpen}
                            onClose={() => setIsNotifOpen(false)}
                            notifications={notifications}
                            onNavigate={handleNotificationNavigation}
                        />
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-900 dark:text-white"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
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

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Inicio"
                        active={currentView === AppView.DASHBOARD}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.DASHBOARD)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<Monitor />}
                        label="Web Builder"
                        active={currentView === AppView.WEBSITE_BUILDER}
                        onClick={() => {
                            setCurrentView(AppView.WEBSITE_BUILDER)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<PenTool />}
                        label="Propuestas IA"
                        active={currentView === AppView.PROPOSALS}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.PROPOSALS)
                            setIsMobileMenuOpen(false)
                        }}
                    />

                    <NavItem
                        icon={<Globe />}
                        label="Generador Fiverr"
                        active={currentView === AppView.FIVERR}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.FIVERR)
                            setIsMobileMenuOpen(false)
                        }}
                    />

                    <NavItem
                        icon={<StickyNote />}
                        label="Agenda & Notas"
                        active={currentView === AppView.NOTES}
                        badge={agendaAlerts}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.NOTES)
                            setIsMobileMenuOpen(false)
                        }}
                    />

                    <NavItem
                        icon={<Timer />}
                        label="Pomodoro Focus"
                        active={currentView === AppView.POMODORO}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.POMODORO)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<DollarSign />}
                        label="Finanzas"
                        active={currentView === AppView.FINANCES}
                        badge={financeAlerts}
                        onClick={() => {
                            event.preventDefault()
                            if (userState.isSubscribed) {
                                setCurrentView(AppView.FINANCES)
                                setIsMobileMenuOpen(false)
                            } else {
                                setIsPricingOpen(true)
                            }
                        }}
                    />
                    <NavItem
                        icon={<Radar />}
                        label="Buscar Trabajo"
                        active={currentView === AppView.JOBS}
                        onClick={() => {
                            setCurrentView(AppView.JOBS)
                            setIsMobileMenuOpen(false)
                        }}
                    />

                    <NavItem
                        icon={<GraduationCap />}
                        label="Academia Freelance"
                        active={currentView === AppView.ACADEMY}
                        onClick={() => {
                            setCurrentView(AppView.ACADEMY)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<Briefcase />}
                        label="Creador Portafolio"
                        active={currentView === AppView.PORTFOLIO}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.PORTFOLIO)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<FileUser />}
                        label="Constructor CV"
                        active={currentView === AppView.CV_BUILDER}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.CV_BUILDER)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<ClipboardList />}
                        label="Briefing & Tareas"
                        active={currentView === AppView.BRIEFING}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.BRIEFING)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<Palette />}
                        label="Generador Logos"
                        active={currentView === AppView.LOGOS}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.LOGOS)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<FileText />}
                        label="Facturación"
                        active={currentView === AppView.INVOICES}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.INVOICES)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<QrCode />}
                        label="Generador QR"
                        active={currentView === AppView.QR}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.QR)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<Zap />}
                        label="Optimizar Img"
                        active={currentView === AppView.OPTIMIZER}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.OPTIMIZER)
                            setIsMobileMenuOpen(false)
                        }}
                    />

                    <NavItem
                        icon={<FileSearch />}
                        label="Analizar Doc"
                        active={currentView === AppView.ANALYZER}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.ANALYZER)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    <NavItem
                        icon={<History />}
                        label="Historial"
                        active={currentView === AppView.HISTORY}
                        onClick={() => {
                            event.preventDefault()
                            setCurrentView(AppView.HISTORY)
                            setIsMobileMenuOpen(false)
                        }}
                    />
                    {/* ZONA ADMIN - SOLO VISIBLE PARA EL DUEÑO */}
                    {firebaseUser?.email &&
                        ADMIN_EMAILS.includes(firebaseUser.email) && (
                            <>
                                <div className="my-2 border-t border-slate-700/50 mx-4"></div>
                                <NavItem
                                    icon={
                                        <ShieldAlert className="text-red-500" />
                                    }
                                    label="Super Admin"
                                    active={currentView === AppView.ADMIN}
                                    onClick={() => {
                                        setCurrentView(AppView.ADMIN)
                                        setIsMobileMenuOpen(false)
                                    }}
                                />
                            </>
                        )}
                </nav>

                <div className="p-4 bg-slate-900 shrink-0 border-t border-slate-800">
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

                        {/* BOTÓN UNIFICADO: CAMBIA SEGÚN EL ESTADO */}
                        <button
                            onClick={() => setIsPricingOpen(true)}
                            className={`w-full mt-2 py-1.5 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wide ${
                                userState.isSubscribed
                                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600' // Estilo para PRO (Discreto)
                                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20' // Estilo para FREE (Llamativo)
                            }`}
                        >
                            {userState.isSubscribed
                                ? 'Gestionar Plan'
                                : 'Ser PRO ($10)'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            <span className="truncate">Cerrar Sesión</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title={
                                theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'
                            }
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
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
                isPro={userState.isSubscribed} //
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
                cancelText=""
            />
        </div>
    )
}

const App = () => {
    return (
        <PomodoroProvider>
            <AppContent />
        </PomodoroProvider>
    )
}

export default App
