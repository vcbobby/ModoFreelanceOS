import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
    Twitch,
    Briefcase,
} from 'lucide-react'
import { Button } from '../components/ui'

// --- COMPONENTES VISUALES ---
const MockApp = () => (
    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mx-auto max-w-5xl">
        {/* Barra superior estilo navegador */}
        <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-200 dark:border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="flex-1 text-center text-[10px] text-slate-400 font-mono">
                app.modofreelanceos.com
            </div>
        </div>
        {/* Contenido simulado del Dashboard */}
        <div className="flex h-[400px] md:h-[600px]">
            {/* Sidebar */}
            <div className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 p-4 hidden md:flex flex-col gap-4">
                <div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>
                <div className="space-y-2 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-8 w-full bg-slate-800/50 rounded"
                        ></div>
                    ))}
                </div>
            </div>
            {/* Main */}
            <div className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"></div>
                    <div className="h-32 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"></div>
                    <div className="h-32 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"></div>
                </div>
            </div>
        </div>
        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-50"></div>
    </div>
)

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
                className="w-full py-6 flex justify-between items-center text-left hover:text-brand-600 transition-colors"
            >
                <span className="font-bold text-lg text-slate-800 dark:text-white pr-4">
                    {question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    } shrink-0`}
                />
            </button>
            {isOpen && (
                <p className="pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {answer}
                </p>
            )}
        </div>
    )
}

export const LandingModern: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        document.title = 'ModoFreelanceOS | Tu Oficina Virtual con IA'
    }, [])

    const handleLogin = () =>
        (window.location.href = 'https://app.modofreelanceos.com')
    const ANDROID_LINK = 'https://freelanceos-app.vercel.app/app-android.apk'
    const WINDOWS_LINK = 'https://freelanceos-app.vercel.app/app-windows.exe'
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        setMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#05050A] text-slate-900 dark:text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden transition-colors">
            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
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
                            className="text-sm font-bold text-slate-700 dark:text-white hover:text-brand-600 transition-colors"
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={handleLogin}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                        >
                            Comenzar Gratis
                        </button>
                    </div>
                    <button
                        className="md:hidden text-slate-900 dark:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {/* Mobile Menu */}
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
                            Comenzar Gratis
                        </button>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-5xl relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 mb-8 uppercase tracking-wide">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Nueva Versión 1.3.0
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                        Tu carrera freelance,
                        <br />
                        <span className="text-brand-600">en Autopiloto.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                        La única herramienta que combina{' '}
                        <strong>Inteligencia Artificial</strong> con gestión de
                        negocio. Consigue clientes, crea contratos, gestiona tu
                        dinero y construye tu marca personal.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none mb-20">
                        {/* BOTÓN PRINCIPAL CORREGIDO (Verde Sólido) */}
                        <button
                            onClick={handleLogin}
                            className="h-14 px-8 w-full sm:w-auto text-lg bg-brand-600 text-white hover:bg-brand-700 font-bold rounded-full shadow-xl shadow-brand-600/30 flex items-center justify-center transition-all hover:scale-105"
                        >
                            Comenzar Gratis{' '}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                        <a
                            href="#video"
                            className="flex items-center justify-center gap-2 h-14 px-8 w-full sm:w-auto text-lg font-bold border border-slate-300 dark:border-white/20 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-white"
                        >
                            <PlayCircle className="w-5 h-5" /> Ver Demo
                        </a>
                    </div>

                    {/* IMAGEN DE LA APP (MOCKUP GIGANTE) */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <MockApp />
                    </motion.div>
                </motion.div>
            </header>

            {/* TRUST SECTION */}
            <div className="py-12 border-y border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/50">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        Compatible con tus plataformas favoritas
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                            <Globe className="w-6 h-6" /> Fiverr
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                            <Briefcase className="w-6 h-6" /> Upwork
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                            <Monitor className="w-6 h-6" /> Freelancer
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
                            <LayoutDashboard className="w-6 h-6" /> Workana
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES GRID */}
            <section
                id="features"
                className="py-24 px-6 bg-white dark:bg-[#05050A]"
            >
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">
                            Características
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-slate-900 dark:text-white">
                            Todo lo que necesitas para escalar
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            No es solo una herramienta, es tu departamento de
                            ventas, legal y finanzas en una sola app.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 transition-colors">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                <PenTool className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Redactor IA
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Pega la descripción del trabajo y obtén una
                                carta de presentación persuasiva adaptada a la
                                plataforma.
                            </p>
                        </div>
                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-green-500 transition-colors">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Finanzas
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Control total de tu flujo de caja. Ve tus
                                ingresos reales vs proyectados.
                            </p>
                        </div>
                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Web Builder
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Tu portafolio online con dominio propio en
                                minutos. 15 diseños profesionales.
                            </p>
                        </div>
                        {/* Feature 4 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500 transition-colors">
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400">
                                <Radar className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Job Hunter
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Buscador global de trabajo remoto en tiempo real
                                (WeWorkRemotely, LinkedIn, etc).
                            </p>
                        </div>
                        {/* Feature 5 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500 transition-colors">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Academia IA
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Genera cursos personalizados para aprender
                                cualquier habilidad técnica al instante.
                            </p>
                        </div>
                        {/* Feature 6 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors">
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-6 text-teal-600 dark:text-teal-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                                Legal & Briefs
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Genera contratos blindados y checklists de
                                proyecto automáticos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section
                id="pricing"
                className="py-24 px-6 bg-slate-50 dark:bg-[#0A0A0E]"
            >
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                            Precios Transparentes
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Invierte en tu carrera por menos de lo que cuesta un
                            almuerzo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                        {/* PLAN GRATIS */}
                        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Freelancer Starter
                            </h3>
                            <div className="text-4xl font-black mb-6 text-slate-900 dark:text-white">
                                $0{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                                Ideal para probar la herramienta.
                            </p>
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
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-green-500" />{' '}
                                    Finanzas (Solo Historial)
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                Crear Cuenta Gratis
                            </Button>
                        </div>

                        {/* PLAN PRO */}
                        <div className="p-8 rounded-3xl border-2 border-brand-500 bg-white dark:bg-slate-900 relative shadow-2xl transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                MÁS POPULAR
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Freelancer PRO
                            </h3>
                            <div className="text-4xl font-black mb-6 text-slate-900 dark:text-white">
                                $10{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <p className="text-brand-600 dark:text-brand-400 text-sm mb-8 font-medium">
                                Para quienes viven de esto.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm font-medium text-slate-700 dark:text-slate-200">
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
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    Generador de Briefs & Contratos
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

            {/* DOWNLOAD SECTION */}
            <section
                id="download"
                className="py-24 px-6 bg-slate-900 dark:bg-black text-white relative overflow-hidden"
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
                            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl text-left transition-all backdrop-blur-sm"
                        >
                            <div className="bg-green-500 p-3 rounded-lg text-black">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">
                                    Descargar para
                                </div>
                                <div className="text-xl font-bold">
                                    Android APK
                                </div>
                            </div>
                        </a>
                        <a
                            href={WINDOWS_LINK}
                            className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl text-left transition-all backdrop-blur-sm"
                        >
                            <div className="bg-blue-500 p-3 rounded-lg text-white">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">
                                    Descargar para
                                </div>
                                <div className="text-xl font-bold">Windows</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-12 text-center text-slate-900 dark:text-white">
                        Preguntas Frecuentes
                    </h2>
                    <div className="space-y-2">
                        <FAQItem
                            question="¿Realmente es ilimitado el plan PRO?"
                            answer="Sí, puedes generar todas las propuestas, contratos y portafolios que necesites. Solo aplicamos límites de sentido común (anti-abuso) para proteger el servidor."
                        />
                        <FAQItem
                            question="¿Puedo cancelar cuando quiera?"
                            answer="Sí, no hay contratos forzosos. Puedes cancelar desde tu panel de control en cualquier momento y mantendrás el acceso hasta el final de tu ciclo de facturación."
                        />
                        <FAQItem
                            question="¿Funciona para cualquier país?"
                            answer="Absolutamente. Nuestra pasarela de pagos (Gumroad) acepta tarjetas internacionales y PayPal. La app está optimizada para el mercado global y latino."
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-sm text-slate-500">
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
                            {/* REDES SOCIALES COMPLETAS */}
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Twitch className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-brand-600 transition-colors"
                            >
                                <Zap className="w-5 h-5" />
                            </a>{' '}
                            {/* Kick */}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-bold mb-4">
                                Producto
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => scrollTo('features')}
                                        className="hover:text-brand-600"
                                    >
                                        Herramientas
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollTo('pricing')}
                                        className="hover:text-brand-600"
                                    >
                                        Precios
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => scrollTo('download')}
                                        className="hover:text-brand-600"
                                    >
                                        Descargar
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-bold mb-4">
                                Legal
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-brand-600"
                                    >
                                        Términos y Condiciones
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-brand-600"
                                    >
                                        Privacidad
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
                    &copy; 2026 ModoFreelanceOS. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}
