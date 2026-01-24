import React, { useEffect, useState, useRef } from 'react'
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
} from 'framer-motion'
import {
    ArrowRight,
    CheckCircle,
    Zap,
    Shield,
    Smartphone,
    Monitor,
    Globe,
    PlayCircle,
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
    ChevronDown,
    Twitter,
    Facebook,
    MessageCircle,
    Briefcase,
    BarChart,
    Search,
} from 'lucide-react'
import { Button, ConfirmationModal } from '../components/ui'
import { TERMS_AND_CONDITIONS2, PRIVACY_POLICY2 } from '../data/legalTexts' // Asegúrate de tener este archivo (te lo doy abajo)

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
                    placeholder="Ej: victor-castillo"
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

    // Suavizar el movimiento del mouse
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Movemos las esferas en dirección opuesta al mouse para efecto parallax
            mouseX.set(e.clientX / -50)
            mouseY.set(e.clientY / -50)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
            {/* Esfera 1: Verde Marca */}
            <motion.div
                style={{ x: springX, y: springY }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/30 rounded-full blur-[100px]"
            />
            {/* Esfera 2: Azul Contraste */}
            <motion.div
                style={{
                    x: useTransform(springX, (v) => v * -1.5),
                    y: useTransform(springY, (v) => v * -1.5),
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
                className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
            />
            {/* Esfera 3: Centro (Sutil) */}
            <motion.div
                style={{
                    x: useTransform(springX, (v) => v * 0.5),
                    y: useTransform(springY, (v) => v * 0.5),
                }}
                className="absolute bottom-[-20%] left-[30%] w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"
            />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>
    )
}

const FAQItem = ({
    question,
    answer,
}: {
    question: string
    answer: string
}) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border-b border-slate-200 dark:border-slate-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-brand-600 transition-colors group"
            >
                <span className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-brand-600 pr-4">
                    {question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    } shrink-0`}
                />
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                }}
                className="overflow-hidden"
            >
                <p className="pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {answer}
                </p>
            </motion.div>
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
            {legalModal.isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                            <h3 className="font-bold text-lg">
                                {legalModal.title}
                            </h3>
                            <button
                                onClick={() =>
                                    setLegalModal({
                                        ...legalModal,
                                        isOpen: false,
                                    })
                                }
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {legalModal.content}
                        </div>
                    </div>
                </div>
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
                        Nueva Versión 1.3.7
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1] tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
                        Tu carrera freelance,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-400">
                            en Autopiloto.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        La única herramienta que combina{' '}
                        <strong>Inteligencia Artificial</strong> con gestión de
                        negocio. Consigue clientes, crea contratos, gestiona tu
                        dinero y construye tu marca personal.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none mb-24">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogin}
                            className="h-14 px-10 w-full sm:w-auto text-lg bg-brand-600 text-white hover:bg-brand-500 font-bold rounded-full shadow-xl shadow-brand-600/40 flex items-center justify-center gap-2"
                        >
                            Comenzar Gratis <ArrowRight className="w-5 h-5" />
                        </motion.button>
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

            <section className="relative pt-40 pb-32 px-6 text-center overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="absolute bottom-0 w-full border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 py-8 backdrop-blur-sm flex flex-col items-center text-center px-4">
                    {/* Envolvemos el buscador para asegurar que no se estire de más y esté centrado */}
                    <div className="w-full max-w-md mb-8">
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
            <section id="features" className="py-24 px-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <PenTool />,
                                title: 'Redactor IA',
                                desc: 'Genera propuestas persuasivas en segundos.',
                                color: 'text-blue-500',
                                bg: 'bg-blue-100 dark:bg-blue-900/30',
                            },
                            {
                                icon: <DollarSign />,
                                title: 'Finanzas',
                                desc: 'Control total de ingresos y gastos.',
                                color: 'text-green-500',
                                bg: 'bg-green-100 dark:bg-green-900/30',
                            },
                            {
                                icon: <Monitor />,
                                title: 'Web Builder',
                                desc: 'Portafolio profesional con dominio propio.',
                                color: 'text-purple-500',
                                bg: 'bg-purple-100 dark:bg-purple-900/30',
                            },
                            {
                                icon: <Radar />,
                                title: 'Job Hunter',
                                desc: 'Buscador de trabajos remotos en tiempo real.',
                                color: 'text-pink-500',
                                bg: 'bg-pink-100 dark:bg-pink-900/30',
                            },
                            {
                                icon: <GraduationCap />,
                                title: 'Academia IA',
                                desc: 'Cursos personalizados al instante.',
                                color: 'text-orange-500',
                                bg: 'bg-orange-100 dark:bg-orange-900/30',
                            },
                            {
                                icon: <FileText />,
                                title: 'Legal & Briefs',
                                desc: 'Contratos y checklists automáticos.',
                                color: 'text-teal-500',
                                bg: 'bg-teal-100 dark:bg-teal-900/30',
                            },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${f.bg} ${f.color}`}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">
                                    {f.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section
                id="pricing"
                className="py-24 px-6 bg-slate-50 dark:bg-black/50"
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

                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold mb-2">
                                Freelancer Starter
                            </h3>
                            <div className="text-4xl font-black mb-6">
                                $0{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500" />{' '}
                                    3 Créditos IA Semanales
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500" />{' '}
                                    Buscador de Trabajo (Retraso 24h)
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500" />{' '}
                                    Generador de CV Básico
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Crear Cuenta Gratis
                            </Button>
                        </div>

                        <div className="p-8 rounded-3xl border-2 border-brand-500 bg-white dark:bg-slate-900 relative shadow-2xl transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                MÁS POPULAR
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                Freelancer PRO
                            </h3>
                            <div className="text-4xl font-black mb-6">
                                $10{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm font-medium">
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    <strong>Créditos IA ILIMITADOS</strong>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    Ofertas de Trabajo en Tiempo Real
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    Web Builder (Portafolio Online)
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    Asistente Personal 24/7
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold h-12 shadow-lg shadow-brand-500/20"
                            >
                                Comenzar Prueba
                            </Button>
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

            {/* FOOTER */}
            <footer className="py-16 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black text-sm text-slate-500">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
                    <div>
                        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-4">
                            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white">
                                <Zap className="w-4 h-4" />
                            </div>
                            ModoFreelance
                            <span className="text-brand-600">OS</span>
                        </div>
                        <p className="max-w-xs mb-6">
                            Herramientas inteligentes para la nueva generación
                            de trabajadores remotos.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/modofreelance/"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/showcase/modofreelancedev"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.youtube.com/@modo_freelance"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a
                                href="https://x.com/modo_freelance"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.facebook.com/modofreelancedev/"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.twitch.tv/modofreelance"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Zap className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => openLegal('terms')}
                                    className="hover:text-brand-600"
                                >
                                    Términos y Condiciones
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => openLegal('privacy')}
                                    className="hover:text-brand-600"
                                >
                                    Privacidad
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
                    &copy; 2026 ModoFreelanceOS. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}
