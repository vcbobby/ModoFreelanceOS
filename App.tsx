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
} from 'lucide-react'
import { DashboardTips } from './components/DashboardTips'
import { ProposalTool } from './views/ProposalTool'
import { Landing } from './views/Landing'
import { AuthView } from './views/Auth' // Importamos la nueva vista
import { PricingModal } from './components/ui'
import { AppView, UserState } from './types'

// Firebase
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
const GUMROAD_LINK = 'https://modofreelanceos.gumroad.com/l/pro-plan'
const WORDPRESS_URL = 'https://www.pixelclickdigital.com'

const App = () => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Estado del Usuario
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [userState, setUserState] = useState<UserState>({
        isSubscribed: false,
        credits: 0,
    })
    const [showSuccessMsg, setShowSuccessMsg] = useState(false)

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

    // Función para traer datos (Créditos) de Firebase
    // const fetchUserData = async (uid: string) => {
    //     try {
    //         const docRef = doc(db, 'users', uid)
    //         const docSnap = await getDoc(docRef)

    //         if (docSnap.exists()) {
    //             const data = docSnap.data()
    //             let isSub = data.isSubscribed || false
    //             let credits = data.credits !== undefined ? data.credits : 0

    //             // --- LÓGICA DE VENCIMIENTO ---
    //             if (isSub && data.subscriptionEnd) {
    //                 const now = Date.now()
    //                 // Si la fecha actual es MAYOR que la fecha de fin, venció.
    //                 if (now > data.subscriptionEnd) {
    //                     isSub = false
    //                     credits = 3 // Lo devolvemos al plan gratis

    //                     // Actualizamos la base de datos para quitarle el PRO
    //                     await updateDoc(docRef, {
    //                         isSubscribed: false,
    //                         credits: 3,
    //                     })
    //                     alert(
    //                         'Tu suscripción ha vencido. Por favor renueva tu plan.'
    //                     )
    //                 }
    //             }
    //             // -----------------------------

    //             setUserState({
    //                 isSubscribed: isSub,
    //                 credits: credits,
    //             })
    //         }
    //     } catch (error) {
    //         console.error('Error al cargar datos:', error)
    //     }
    // }

    // Reemplaza tu función fetchUserData por esta mejorada:
    const fetchUserData = async (uid: string) => {
        try {
            const docRef = doc(db, 'users', uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                let isSub = data.isSubscribed || false
                let credits = data.credits !== undefined ? data.credits : 0

                // CÁLCULOS DE FECHAS
                const now = Date.now()

                // 1. Para usuarios FREE: Calculamos renovación (7 días después del último reset)
                // Si no existe lastReset (usuarios viejos), asumimos que es hoy.
                const lastReset = data.lastReset || now
                const nextResetDate = lastReset + 7 * 24 * 60 * 60 * 1000 // Sumamos 7 días

                // 2. Para usuarios PRO: Verificamos vencimiento
                if (isSub && data.subscriptionEnd) {
                    if (now > data.subscriptionEnd) {
                        // Si ya venció, lo degradamos (esto ya lo tenías, lo mantenemos)
                        isSub = false
                        credits = 3
                        await updateDoc(docRef, {
                            isSubscribed: false,
                            credits: 3,
                        })
                        alert('Tu suscripción ha vencido.')
                    }
                }

                setUserState({
                    isSubscribed: isSub,
                    credits: credits,
                    subscriptionEnd: data.subscriptionEnd, // Guardamos fecha fin
                    nextReset: nextResetDate, // Guardamos fecha renovación
                })
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
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
            alert(
                `¡Suscripción activa! Válida hasta el ${expirationDate.toLocaleDateString()}`
            )
            setShowSuccessMsg(true)
            setTimeout(() => setShowSuccessMsg(false), 5000)
        } catch (error) {
            console.error('Error activando plan:', error)
        }
    }

    // Función para gastar créditos en la nube
    // Modificación en src/App.tsx

    // Cambiamos la firma para que devuelva true o false
    const handleFeatureUsage = async (): Promise<boolean> => {
        // 1. Si es PRO, pase usted (True)
        if (userState.isSubscribed) return true

        // 2. Si tiene créditos, cobramos y pase usted (True)
        if (userState.credits > 0 && firebaseUser) {
            const newCredits = userState.credits - 1

            // Actualizar visualmente
            setUserState((prev) => ({ ...prev, credits: newCredits }))

            // Actualizar base de datos
            const docRef = doc(db, 'users', firebaseUser.uid)
            // No necesitamos await aquí para no bloquear la UI, se guarda en fondo
            updateDoc(docRef, { credits: newCredits })

            return true // APROBADO
        }

        // 3. Si no tiene créditos ni es PRO
        else {
            setIsPricingOpen(true) // Abrimos modal
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

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-800">
                                Hola, {firebaseUser?.email?.split('@')[0]} 👋
                            </h2>
                            <p className="text-slate-500 mt-2">
                                Bienvenido a tu centro de mando.
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
                                                    : 'De por vida'}
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

                        {/* Componente de Tips */}
                        <DashboardTips />
                    </div>
                )
        }
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-20 px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    ModoFreelance<span className="text-brand-600">OS</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6">
                        <h1
                            className="text-2xl font-bold text-white tracking-tight cursor-pointer"
                            onClick={() => {
                                setCurrentView(AppView.DASHBOARD)
                                setIsMobileMenuOpen(false)
                            }}
                        >
                            ModoFreelance
                            <span className="text-brand-500">OS</span>
                        </h1>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 mt-4">
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
                                setCurrentView(AppView.DASHBOARD)
                                setIsMobileMenuOpen(false)
                            }}
                        />
                        {/* <NavItem
                            icon={<Code />}
                            label="Plantillas"
                            active={currentView === AppView.TEMPLATES}
                            onClick={() => setCurrentView(AppView.TEMPLATES)}
                        /> */}
                    </nav>

                    <div className="p-4 bg-slate-800 m-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-white">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-xs truncate max-w-[120px]">
                                {firebaseUser?.email}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2 bg-slate-900 p-2 rounded-lg">
                            <span className="text-xs font-bold text-white">
                                {userState.isSubscribed ? 'PRO 🚀' : 'FREE'}
                            </span>
                            {/* Solo mostramos créditos si NO es suscriptor */}
                            {!userState.isSubscribed && (
                                <span className="text-xs text-brand-400 font-bold">
                                    {userState.credits} créditos
                                </span>
                            )}
                        </div>

                        {!userState.isSubscribed && (
                            <button
                                onClick={() => setIsPricingOpen(true)}
                                className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                Ser PRO ($10)
                            </button>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-sm hover:text-white transition-colors w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    {renderContent()}
                </div>
            </main>

            <PricingModal
                isOpen={isPricingOpen}
                onClose={() => setIsPricingOpen(false)}
                onSubscribe={handleSubscribe}
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
