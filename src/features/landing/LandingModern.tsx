import React, { useEffect, useState } from 'react'
import { motion, useTransform, useSpring, useMotionValue } from 'framer-motion'
import {
    ArrowRight,
    CheckCircle,
    Zap,
    Smartphone,
    Monitor,
    Globe,
    Menu,
    X,
    Instagram,
    Linkedin,
    Youtube,
    LayoutDashboard,
    PenTool,
    DollarSign,
    GraduationCap,
    Radar,
    FileText,
    Check,
    Twitter,
    Facebook,
    Briefcase,
    Search,
} from 'lucide-react'
import { Button } from '@features/shared/ui'
import { TERMS_AND_CONDITIONS2, PRIVACY_POLICY2 } from '@/data/legalTexts' // Asegúrate de tener este archivo (te lo doy abajo)
import { createPortal } from 'react-dom'

export const PortfolioSearch = () => {
    const [username, setUsername] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return

        // Limpiamos el input para evitar caracteres raros
        const cleanSlug = username.trim().toLowerCase().replace(/\s+/g, '-')

        // Redirigimos al perfil público
        // Esto abrirá: app.modofreelanceos.com/p/nombre-usuario
        window.location.href = `/p/${cleanSlug}`
    }
    return (
        <div className="w-full max-w-md mx-auto mt-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-center text-lg font-bold text-slate-800 dark:text-white mb-2">
                ¿Buscas el portafolio de un freelancer?
            </h3>
            <p className="text-center text-sm text-slate-500 mb-4">
                Ingresa su nombre de usuario o ID para ver su trabajo.
            </p>

            <form
                onSubmit={handleSearch}
                className="relative flex items-center"
            >
                <Search className="absolute left-3 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Ej: user-name"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-2 p-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    )
}
// --- FONDO DINÁMICO (EFECTO MOUSE + SCROLL) ---
const HeroBackground = () => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Reducimos un poco el damping para que la respuesta sea más rápida y menos "arrastrada"
    const springConfig = { stiffness: 50, damping: 30 }
    const springX = useSpring(mouseX, springConfig)
    const springY = useSpring(mouseY, springConfig)

    useEffect(() => {
        // Optimización: Solo agregar el listener si es una pantalla grande (Desktop)
        // En móviles, el cálculo matemático al hacer scroll táctil causa los saltos.
        if (window.innerWidth < 768) return

        const handleMouseMove = (e: MouseEvent) => {
            // Usamos requestAnimationFrame para no sobrecargar el hilo principal
            requestAnimationFrame(() => {
                mouseX.set(e.clientX / -50)
                mouseY.set(e.clientY / -50)
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            {/* Esfera 1: Verde Marca */}
            <motion.div
                style={{ x: springX, y: springY }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }} // Reduje la escala para menos repintado
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear', // 'linear' es más barato de calcular que 'easeInOut'
                }}
                // CLASES CLAVE: will-change-transform y transform-gpu
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/30 rounded-full blur-[80px] will-change-transform transform-gpu"
            />
            {/* Esfera 2: Azul Contraste */}
            <motion.div
                style={{
                    x: useTransform(springX, (v) => v * -1.2), // Reduje el factor de movimiento
                    y: useTransform(springY, (v) => v * -1.2),
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: 1,
                }}
                className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] will-change-transform transform-gpu"
            />
            {/* Esfera 3: Centro (Sutil) */}
            <motion.div
                style={{
                    x: useTransform(springX, (v) => v * 0.5),
                    y: useTransform(springY, (v) => v * 0.5),
                }}
                className="absolute bottom-[-20%] left-[30%] w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] will-change-transform transform-gpu"
            />

            {/* Grid Overlay - Optimizado con translateZ(0) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] transform-gpu"></div>
        </div>
    )
}

// --- LANDING PAGE ---

export const LandingModern: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Estado para el Modal Legal
    const [legalModal, setLegalModal] = useState({
        isOpen: false,
        title: '',
        content: '',
    })

    useEffect(() => {
        document.title = 'ModoFreelanceOS | Tu Oficina Virtual con IA'
    }, [])

    const handleLogin = () =>
        (window.location.href = 'https://app.modofreelanceos.com')
    const ANDROID_LINK =
        'https://github.com/vcbobby/ModoFreelanceOS/releases/download/v1.0.0/app-release.apk'
    const WINDOWS_LINK =
        'https://github.com/vcbobby/ModoFreelanceOS/releases/download/v1.0.0/ModoFreelanceOS.Setup.exe'

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        setMobileMenuOpen(false)
    }

    const openLegal = (type: 'terms' | 'privacy') => {
        setLegalModal({
            isOpen: true,
            title:
                type === 'terms'
                    ? 'Términos y Condiciones'
                    : 'Política de Privacidad',
            content: type === 'terms' ? TERMS_AND_CONDITIONS2 : PRIVACY_POLICY2,
        })
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#05050A] text-slate-900 dark:text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden transition-colors">
            {/* Modal Legal (Reutilizando ConfirmationModal para simplificar o creando uno simple) */}
            {legalModal.isOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] flex justify-center items-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
                            onClick={() =>
                                setLegalModal({ ...legalModal, isOpen: false })
                            }
                        />

                        {/* Contenido */}
                        <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {legalModal.title}
                                </h3>
                                <button
                                    onClick={() =>
                                        setLegalModal({
                                            ...legalModal,
                                            isOpen: false,
                                        })
                                    }
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                                {legalModal.content}
                            </div>
                        </div>
                    </div>,
                    document.body, // <--- Aquí va al body
                )}

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer"
                        onClick={() => window.scrollTo(0, 0)}
                    >
                        <span className="text-slate-900 dark:text-white">
                            ModoFreelance
                            <span className="text-brand-600">OS</span>
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <button
                            onClick={() => scrollTo('features')}
                            className="hover:text-brand-600 dark:hover:text-white transition-colors"
                        >
                            Herramientas
                        </button>
                        <button
                            onClick={() => scrollTo('pricing')}
                            className="hover:text-brand-600 dark:hover:text-white transition-colors"
                        >
                            Precios
                        </button>
                        <button
                            onClick={() => scrollTo('download')}
                            className="hover:text-brand-600 dark:hover:text-white transition-colors"
                        >
                            Descargar
                        </button>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={handleLogin}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-all hover:scale-105 shadow-lg shadow-brand-500/30"
                        >
                            Ingresar
                        </button>
                    </div>
                    <button
                        className="md:hidden text-slate-900 dark:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#05050A] border-b border-slate-200 dark:border-white/10 p-6 flex flex-col gap-4 shadow-2xl h-screen">
                        <button
                            onClick={() => scrollTo('features')}
                            className="text-left text-lg font-medium text-slate-700 dark:text-slate-300"
                        >
                            Herramientas
                        </button>
                        <button
                            onClick={() => scrollTo('pricing')}
                            className="text-left text-lg font-medium text-slate-700 dark:text-slate-300"
                        >
                            Precios
                        </button>
                        <button
                            onClick={() => scrollTo('download')}
                            className="text-left text-lg font-medium text-slate-700 dark:text-slate-300"
                        >
                            Descargar App
                        </button>
                        <hr className="border-slate-200 dark:border-white/10 my-2" />
                        <button
                            onClick={handleLogin}
                            className="w-full py-4 bg-brand-600 rounded-lg font-bold text-white text-lg"
                        >
                            Ingresar
                        </button>
                    </div>
                )}
            </nav>

            {/* HERO SECTION DINÁMICO */}
            <header className="relative pt-40 pb-32 px-6 text-center overflow-hidden min-h-screen flex flex-col justify-center">
                <HeroBackground />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-5xl relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-brand-300 mb-8 uppercase tracking-wide backdrop-blur-md shadow-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Nueva Versión 2.0.0
                    </motion.div>

                    <h1 className="relative z-20 text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1] tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
                        Tu oficina virtual,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">
                            Potenciada por IA.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        La navaja suiza para el freelancer moderno. **ModoFreelanceOS V2** combina gestión de proyectos, finanzas inteligentes e inteligencia artificial para escalar tu carrera al siguiente nivel.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none mb-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogin}
                            className="h-14 px-10 w-full sm:w-auto text-lg bg-brand-600 text-white hover:bg-brand-500 font-bold rounded-full shadow-xl shadow-brand-600/40 flex items-center justify-center gap-2"
                        >
                            Comenzar Ahora - 3 Créditos Gratis <ArrowRight className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => scrollTo('features')}
                            className="h-14 px-10 w-full sm:w-auto text-lg bg-white/10 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-full backdrop-blur-md hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            Ver Funcionalidades
                        </motion.button>
                    </div>


                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-12">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                            {/* Todas las herramientas que necesitas para gestionar tu negocio */}
                        </div>

                    </div>

                    {/* ELEMENTOS FLOTANTES (DECORACIÓN) */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute top-1/4 right-[10%] hidden lg:block p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 rotate-6"
                    >
                        <DollarSign className="w-8 h-8 text-green-500 mb-2" />
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        }}
                        className="absolute top-1/3 left-[5%] hidden lg:block p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 -rotate-6"
                    >
                        <PenTool className="w-8 h-8 text-blue-500 mb-2" />
                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                        <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </motion.div>
                </motion.div>
            </header>
            {/* Social Proof */}

            <section className="relative mt-32 pb-32 px-6 text-center flex flex-col justify-center">
                {/* CORRECCIÓN AQUI: Agregado 'left-0' y 'z-20' */}
                <div className="absolute bottom-0 left-0 w-full border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 py-8 backdrop-blur-[2px] flex flex-col items-center justify-center text-center px-4 z-20 transform-gpu">
                    {/* Agregado 'mx-auto' para asegurar centrado del bloque */}
                    <div className="w-full max-w-md mb-8 mx-auto">
                        <PortfolioSearch />
                    </div>

                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        Funciona para plataformas como
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
                            <Globe className="w-5 h-5 md:w-6 md:h-6" /> Fiverr
                        </div>
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
                            <Briefcase className="w-5 h-5 md:w-6 md:h-6" />{' '}
                            Upwork
                        </div>
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
                            <Monitor className="w-5 h-5 md:w-6 md:h-6" />{' '}
                            Freelancer
                        </div>
                        <div className="flex items-center gap-2 text-lg md:text-xl font-bold">
                            <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />{' '}
                            Workana
                        </div>
                    </div>
                </div>
            </section>
            {/* VIDEO */}
            <section
                id="video"
                className="py-24 bg-slate-900 text-white relative"
            >
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <h2 className="text-3xl font-bold mb-12">
                        Míralo en acción
                    </h2>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                        <iframe
                            loading="lazy"
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/C-zqxKImJG4"
                            title="Demo"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-24 px-6 transform-gpu">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">
                            Características
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Tu navaja suiza digital
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Todas las herramientas que necesitas para escalar tu
                            negocio, en una sola suscripción.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Pilar 1: AI Content Studio */}
                        <div className="lg:col-span-2 p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white">
                                    <PenTool className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">AI Content Studio</h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Persuasión y Redacción Instantánea</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-brand-600" /> Redactor de Propuestas</h4>
                                    <p className="text-sm text-slate-500">Crea propuestas ganadoras para Fiverr o Upwork en segundos usando IA.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><ArrowRight className="w-4 h-4 text-brand-600" /> Optimizador de Mensajes</h4>
                                    <p className="text-sm text-slate-500">Refina tus correos y chats para sonar más profesional y cerrar más tratos.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-brand-600" /> Constructor de CV IA</h4>
                                    <p className="text-sm text-slate-500">Adapta tu perfil profesional según el proyecto al que apliques automáticamente.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-600" /> Analizador de Gigs</h4>
                                    <p className="text-sm text-slate-500">Recibe feedback instantáneo sobre cómo mejorar tus servicios publicados.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pilar 2: Business Engine */}
                        <div className="p-8 rounded-3xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-600 rounded-2xl text-white">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Business Engine</h3>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Gestión Financiera</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="font-bold">Finanzas Inteligentes</h4>
                                    <p className="text-sm text-slate-500">Controla cobros, pagos y estados de cuenta sin hojas de Excel complejas.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold">Generador de Facturas</h4>
                                    <p className="text-sm text-slate-500">Crea invoices profesionales en PDF listas para enviar a tus clientes.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold">Analíticas de Negocio</h4>
                                    <p className="text-sm text-slate-500">Visualiza el crecimiento de tus ingresos y detecta tus mejores meses.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pilar 3: Digital Presence */}
                        <div className="p-8 rounded-3xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-600 rounded-2xl text-white">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Digital Identity</h3>
                                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tu vitrina al mundo</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="font-bold">Portfolio V-Card</h4>
                                    <p className="text-sm text-slate-500">Una tarjeta de presentación digital interactiva con todos tus enlaces.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold">Constructor de Sitios</h4>
                                    <p className="text-sm text-slate-500">Publica tu landing page personal en minutos sin saber programar.</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold">Generador QR Dinámico</h4>
                                    <p className="text-sm text-slate-500">QR personalizados para que los clientes accedan a tu perfil con un tap.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pilar 4: Automation Hub & Growth Academy */}
                        <div className="lg:col-span-2 p-8 rounded-3xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-orange-600 rounded-2xl text-white">
                                            <Radar className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Automation Hub</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-orange-200">
                                            <h4 className="font-bold text-sm">Jobs Radar</h4>
                                            <p className="text-xs text-slate-500">Buscador global de trabajos remotos en tiempo real.</p>
                                        </div>
                                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-orange-200">
                                            <h4 className="font-bold text-sm">Notificaciones Inteligentes</h4>
                                            <p className="text-xs text-slate-500">Alertas de cobros pendientes y recordatorios de tareas.</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-brand-600 rounded-2xl text-white">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Growth Academy</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-brand-200">
                                            <h4 className="font-bold text-sm">Academia IA</h4>
                                            <p className="text-xs text-slate-500">Aprende nuevas habilidades con cursos generados por IA.</p>
                                        </div>
                                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-brand-200">
                                            <h4 className="font-bold text-sm">Knowledge Base</h4>
                                            <p className="text-xs text-slate-500">Tu segundo cerebro para guardar notas y recursos clave.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section
                id="pricing"
                className="py-24 px-6 bg-slate-50 dark:bg-black/50 transform-gpu"
            >
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Precios Transparentes
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Invierte en tu carrera por menos de lo que cuesta un
                            almuerzo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                        >
                            <h3 className="text-xl font-bold mb-2">Freelancer Starter</h3>
                            <p className="text-sm text-slate-500 mb-6">Lo esencial para despegar.</p>
                            <div className="text-4xl font-black mb-6">
                                $0 <span className="text-lg font-normal text-slate-500">gratis por siempre</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-grow">
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>**3 Créditos IA Semanales** (Se renuevan cada lunes)</span>
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Buscador de Trabajo (Lento - 24h de retraso)</span>
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Gestión Financiera Básica</span>
                                </li>
                                <li className="flex gap-2 opacity-40">
                                    <X className="w-5 h-5 text-slate-400 shrink-0" />
                                    <span>Portafolio Publicado</span>
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Empezar Ahora
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col p-8 rounded-3xl border-2 border-brand-500 bg-white dark:bg-slate-900 relative shadow-2xl transform md:scale-105"
                        >
                            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                RECOMENDADO
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-brand-600">Freelancer PRO</h3>
                            <p className="text-sm text-slate-500 mb-6">Tu carrera en esteroides.</p>
                            <div className="text-4xl font-black mb-6">
                                $10 <span className="text-lg font-normal text-slate-500">/ mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm font-medium flex-grow">
                                <li className="flex gap-2">
                                    <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span>**Créditos IA ILIMITADOS**</span>
                                </li>
                                <li className="flex gap-2">
                                    <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span>Jobs Radar en Tiempo Real</span>
                                </li>
                                <li className="flex gap-2">
                                    <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span>**Website Builder Incluido** (Tu propia web)</span>
                                </li>
                                <li className="flex gap-2">
                                    <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span>Generador de Facturas Ilimitado</span>
                                </li>
                                <li className="flex gap-2">
                                    <Zap className="w-5 h-5 text-brand-500 shrink-0" />
                                    <span>Soporte Prioritario</span>
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold h-12 shadow-lg shadow-brand-500/20"
                            >
                                Volverse PRO
                            </Button>
                        </motion.div>
                    </div>

                    {/* Credit Packages Section */}
                    <div className="mt-20 text-center">
                        <div className="inline-block p-1 px-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 rounded-full text-xs font-bold text-brand-600 mb-6 uppercase tracking-widest">
                            ¿Solo necesitas unos pocos?
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Paquetes de Créditos</h3>
                        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
                            Si el plan PRO no es para ti, puedes comprar créditos adicionales que **nunca mueren**.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <div className="text-xl font-bold">10 Créditos</div>
                                <div className="text-brand-600 font-bold">$0.99</div>
                            </div>
                            <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10 border-2 border-brand-200 rounded-2xl scale-105">
                                <div className="text-xl font-bold">30 Créditos</div>
                                <div className="text-brand-600 font-bold">$2.49</div>
                            </div>
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <div className="text-xl font-bold">60 Créditos</div>
                                <div className="text-brand-600 font-bold">$4.99</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DOWNLOAD */}
            <section
                id="download"
                className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden"
            >
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">
                        Lleva tu oficina en el bolsillo
                    </h2>
                    <p className="text-slate-400 mb-12 text-lg">
                        Descarga la aplicación nativa para Android y Windows.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a
                            href={ANDROID_LINK}
                            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl text-left transition-all backdrop-blur-sm"
                        >
                            <div className="bg-green-500 p-3 rounded-xl text-black">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">
                                    Android
                                </div>
                                <div className="text-xl font-bold">
                                    Descargar APK
                                </div>
                            </div>
                        </a>
                        <a
                            href={WINDOWS_LINK}
                            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl text-left transition-all backdrop-blur-sm"
                        >
                            <div className="bg-blue-500 p-3 rounded-xl text-white">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">
                                    Windows
                                </div>
                                <div className="text-xl font-bold">
                                    Descargar .EXE
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">¿Cómo funciona?</h2>
                        <p className="text-slate-400">Escala tu negocio en 4 simples pasos.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Regístrate", desc: "Crea tu cuenta gratis y recibe tus primeros 3 créditos IA." },
                            { step: "02", title: "Configura", desc: "Activa tu portafolio y conecta tus herramientas de finanzas." },
                            { step: "03", title: "Automatiza", desc: "Encuentra trabajos y genera propuestas con nuestra IA." },
                            { step: "04", title: "Escala", desc: "Construye una marca personal sólida y atrae clientes directos." }
                        ].map((s, i) => (
                            <div key={i} className="relative p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="text-4xl font-black text-brand-600/50 mb-4">{s.step}</div>
                                <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                                <p className="text-sm text-slate-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOWNLOAD (Already present, skipping replacement of it if possible but keeping context) */}

            {/* FOOTER */}
            <footer className="py-20 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black text-sm text-slate-500">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white mb-6">
                            <span className="text-brand-600">ModoFreelance</span>OS
                        </div>
                        <p className="max-w-sm mb-8 leading-relaxed">
                            Diseñado por y para freelancers en Latinoamérica. ModoFreelanceOS es tu oficina virtual de nueva generación, simplificando la burocracia para que tú te enfoques en crear.
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Linkedin, Youtube, Twitter, Facebook].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:text-brand-600 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-widest text-xs">Producto</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => scrollTo('features')} className="hover:text-brand-600 transition-colors">Funcionalidades</button></li>
                            <li><button onClick={() => scrollTo('pricing')} className="hover:text-brand-600 transition-colors">Precios</button></li>
                            <li><button onClick={() => scrollTo('download')} className="hover:text-brand-600 transition-colors">Descargar App</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => openLegal('terms')} className="hover:text-brand-600 transition-colors">Términos y Condiciones</button></li>
                            <li><button onClick={() => openLegal('privacy')} className="hover:text-brand-600 transition-colors">Política de Privacidad</button></li>
                            <li><a href="mailto:modofreelancedev@gmail.com" className="hover:text-brand-600 transition-colors">Soporte Tecnico</a></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-16 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2026 ModoFreelanceOS. Hecho con ❤️ para la comunidad de freelancers.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Español (Latam)</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}



