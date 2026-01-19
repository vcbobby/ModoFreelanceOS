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
    Star,
    Facebook,
    Twitch,
    MousePointer2,
    Briefcase,
    Twitter,
    BarChart,
} from 'lucide-react'
import { Button } from '../components/ui'

// --- COMPONENTES UI MEJORADOS (MOCKUPS) ---

const MockProposal = () => (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500 hidden md:block">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="ml-auto text-[10px] text-slate-500 font-mono">
                AI_WRITER.EXE
            </div>
        </div>
        <div className="space-y-3">
            <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse delay-75"></div>
            <div className="bg-green-900/20 border border-green-500/30 rounded p-3 text-xs text-green-200 mt-2">
                <span className="text-green-400 font-bold">
                    ✨ Propuesta Generada:
                </span>
                <br />
                "Hola, analicé tu proyecto y tengo la solución exacta para
                aumentar tus ventas..."
            </div>
            <div className="h-2 bg-slate-800 rounded w-full mt-2"></div>
        </div>
    </div>
)

const MockFinance = () => (
    <div className="bg-white text-slate-900 rounded-xl p-4 shadow-xl w-full relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500 hidden md:block">
        <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-sm">Ingresos</div>
            <div className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                +12%
            </div>
        </div>
        <div className="flex items-end gap-1 h-16 mb-2 justify-between px-1">
            {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
                <div
                    key={i}
                    className="w-full bg-brand-500 rounded-t-sm"
                    style={{ height: `${h}%`, opacity: (i + 4) / 10 }}
                ></div>
            ))}
        </div>
        <div className="flex gap-2">
            <div className="flex-1 bg-slate-100 h-6 rounded"></div>
            <div className="flex-1 bg-brand-600 h-6 rounded text-white flex items-center justify-center text-[10px] font-bold">
                Ver Reporte
            </div>
        </div>
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
        <div className="border-b border-slate-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left hover:text-brand-400 transition-colors"
            >
                <span className="font-bold text-lg pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    } shrink-0`}
                />
            </button>
            {isOpen && (
                <p className="pb-6 text-slate-400 leading-relaxed text-sm">
                    {answer}
                </p>
            )}
        </div>
    )
}

// --- LANDING PAGE PRINCIPAL ---

export const LandingModern: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        document.title = 'ModoFreelanceOS | Tu Oficina Virtual con IA'
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc)
            metaDesc.setAttribute(
                'content',
                'Automatiza tu vida freelance. Genera propuestas, contratos, facturas, portafolios y encuentra trabajo con IA.'
            )
    }, [])

    const handleLogin = () =>
        (window.location.href = 'https://app.modofreelanceos.com')

    // Links de descarga (Asegúrate de que sean los correctos de tu carpeta public en Vercel)
    const ANDROID_LINK = 'https://freelanceos-app.vercel.app/app-android.apk'
    const WINDOWS_LINK = 'https://freelanceos-app.vercel.app/app-windows.exe'

    const scrollTo = (id: string) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
        setMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-[#05050A] text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-[#05050A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-green-400 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Zap
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                            />
                        </div>
                        <span>
                            ModoFreelance
                            <span className="text-brand-500">OS</span>
                        </span>
                    </div>

                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                        <button
                            onClick={() => scrollTo('features')}
                            className="hover:text-white transition-colors"
                        >
                            Herramientas
                        </button>
                        <button
                            onClick={() => scrollTo('pricing')}
                            className="hover:text-white transition-colors"
                        >
                            Precios
                        </button>
                        <button
                            onClick={() => scrollTo('download')}
                            className="hover:text-white transition-colors"
                        >
                            Descargar
                        </button>
                    </div>

                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={handleLogin}
                            className="text-sm font-bold hover:text-brand-400 transition-colors"
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={handleLogin}
                            className="bg-white text-slate-950 px-5 py-2.5 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                        >
                            Comenzar Gratis
                        </button>
                    </div>

                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-[#05050A] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
                        <button
                            onClick={() => scrollTo('features')}
                            className="text-left text-lg font-medium text-slate-300"
                        >
                            Herramientas
                        </button>
                        <button
                            onClick={() => scrollTo('pricing')}
                            className="text-left text-lg font-medium text-slate-300"
                        >
                            Precios
                        </button>
                        <button
                            onClick={() => scrollTo('download')}
                            className="text-left text-lg font-medium text-slate-300"
                        >
                            Descargar App
                        </button>
                        <hr className="border-white/10 my-2" />
                        <button
                            onClick={handleLogin}
                            className="w-full py-3 bg-brand-600 rounded-lg font-bold text-white"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <header className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 text-center">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-brand-300 mb-8 uppercase tracking-wide hover:bg-white/10 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        Nueva Versión 1.3.0 Disponible
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-white">
                        Tu carrera freelance,
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-green-300 to-emerald-500">
                            en Autopiloto.
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Deja de perder horas en tareas administrativas. Usa
                        nuestra <strong>Inteligencia Artificial</strong> para
                        conseguir clientes, crear contratos, gestionar tu dinero
                        y construir tu marca personal.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
                        {/* FIX: Botón con texto explícito negro para legibilidad */}
                        <button
                            onClick={handleLogin}
                            className="h-14 px-8 w-full sm:w-auto text-lg bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all hover:scale-105"
                        >
                            Usar en Web <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                        <a
                            href="#video"
                            className="flex items-center justify-center gap-2 h-14 px-8 w-full sm:w-auto text-lg font-bold border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <PlayCircle className="w-5 h-5" /> Ver Demo
                        </a>
                    </div>
                </motion.div>

                {/* Social Proof */}
                <div className="mt-20 pt-10 border-t border-white/5 container mx-auto max-w-4xl">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">
                        Funciona para plataformas como
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Globe className="w-6 h-6" /> Fiverr
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Briefcase className="w-6 h-6" /> Upwork
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Monitor className="w-6 h-6" /> Freelancer
                        </div>
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <LayoutDashboard className="w-6 h-6" /> Workana
                        </div>
                    </div>
                </div>
            </header>

            {/* PROBLEM / SOLUTION */}
            <section className="py-24 bg-slate-900/50 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-red-500 font-bold tracking-widest text-xs uppercase mb-2 block">
                                El Problema
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                Ser Freelancer es difícil.
                            </h2>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                    <p className="text-slate-400 text-lg">
                                        Pierdes horas escribiendo propuestas que
                                        nadie lee.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                    <p className="text-slate-400 text-lg">
                                        Tus finanzas son un desastre en Excel (o
                                        en tu cabeza).
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                    <p className="text-slate-400 text-lg">
                                        No tienes portafolio y los clientes no
                                        confían en ti.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                    <p className="text-slate-400 text-lg">
                                        No sabes cómo cobrar ni hacer contratos
                                        legales.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-brand-900/20 to-black p-8 rounded-3xl border border-brand-500/20 shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-4 bg-brand-600 text-white text-xs font-bold rounded-bl-xl">
                                SOLUCIÓN
                            </div>
                            <h3 className="text-2xl font-bold text-brand-400 mb-6">
                                El Método ModoFreelance
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-white">
                                            Propuestas con IA
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                            Redacta cartas de venta persuasivas
                                            en 30 segundos.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-white">
                                            Dashboard Financiero
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                            Controla ingresos, gastos y
                                            suscripciones automáticamente.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-white">
                                            Web Builder PRO
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                            Crea tu sitio web profesional sin
                                            saber programar.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-white">
                                            Academia & Jobs
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                            Aprende nuevas habilidades y
                                            encuentra trabajo remoto real.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID (LAS NUEVAS HERRAMIENTAS) */}
            <section id="features" className="py-24 px-6 bg-slate-950">
                <div className="container mx-auto">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-brand-500 font-bold uppercase tracking-widest text-xs">
                            Características
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Tu navaja suiza digital
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Todas las herramientas que necesitas para escalar tu
                            negocio, en una sola suscripción.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px] md:auto-rows-[400px]">
                        {/* FEATURE 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="md:col-span-2 bg-[#0A0A0E] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-brand-500/50 transition-colors"
                        >
                            <div className="relative z-10 max-w-sm">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                                    <PenTool className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">
                                    Redactor IA
                                </h3>
                                <p className="text-slate-400">
                                    Pega la descripción del trabajo y obtén una
                                    carta de presentación persuasiva adaptada a
                                    la plataforma (Upwork, Freelancer,
                                    LinkedIn).
                                </p>
                            </div>
                            <div className="absolute top-20 right-[-50px] md:right-10 w-80 transform group-hover:translate-y-[-10px] transition-transform duration-500 hidden md:block">
                                <MockProposal />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0"></div>
                        </motion.div>

                        {/* FEATURE 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-green-500/50 transition-colors flex flex-col"
                        >
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                Finanzas
                            </h3>
                            <p className="text-slate-400 text-sm mb-auto">
                                Control total de tu flujo de caja. Ve tus
                                ingresos reales vs proyectados.
                            </p>
                            <div className="mt-8 transform group-hover:translate-y-[-10px] transition-transform hidden md:block">
                                <MockFinance />
                            </div>
                        </motion.div>

                        {/* FEATURE 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-colors"
                        >
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                Web Builder
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Tu portafolio online con dominio propio en
                                minutos. 15 diseños profesionales.
                            </p>
                        </motion.div>

                        {/* FEATURE 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-2 bg-gradient-to-br from-[#0A0A0E] to-[#11111a] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                        >
                            <div className="grid md:grid-cols-2 gap-10 items-center">
                                <div>
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
                                            <Radar className="w-6 h-6" />
                                        </div>
                                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">
                                        Aprende y Consigue Trabajo
                                    </h3>
                                    <p className="text-slate-400 mb-6 text-sm">
                                        Un buscador que rastrea 20+ sitios de
                                        empleo remoto en tiempo real, combinado
                                        con una Academia IA que genera cursos
                                        personalizados para ti.
                                    </p>
                                    <ul className="space-y-2 text-slate-300 text-sm">
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-brand-500" />{' '}
                                            Ofertas de WeWorkRemotely, LinkedIn,
                                            etc.
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-brand-500" />{' '}
                                            Cursos generados al instante.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VIDEO SECTION */}
            <section
                id="video"
                className="py-24 bg-black relative border-t border-white/5"
            >
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <h2 className="text-3xl font-bold mb-12">
                        Míralo en acción
                    </h2>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)] border border-slate-800 bg-slate-900 relative">
                        {/* REEMPLAZA EL ID DEL VIDEO AQUÍ */}
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO?rel=0&modestbranding=1"
                            title="Demo"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* PRICING (PRECIOS) */}
            <section id="pricing" className="py-24 px-6 bg-[#05050A]">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Precios Transparentes
                        </h2>
                        <p className="text-slate-400">
                            Invierte en tu carrera por menos de lo que cuesta un
                            almuerzo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
                        {/* PLAN GRATIS */}
                        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                            <h3 className="text-xl font-bold text-slate-300 mb-2">
                                Freelancer Starter
                            </h3>
                            <div className="text-4xl font-black mb-6">
                                $0{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-8">
                                Ideal para probar la herramienta.
                            </p>
                            <ul className="space-y-4 mb-8 text-sm text-slate-300">
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-slate-500" />{' '}
                                    3 Créditos IA Semanales
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-slate-500" />{' '}
                                    Buscador de Trabajo (Retraso 24h)
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-slate-500" />{' '}
                                    Generador de CV Básico
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-5 h-5 text-slate-500" />{' '}
                                    Finanzas (Solo Historial)
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full border-slate-700 hover:bg-slate-800 text-white"
                            >
                                Crear Cuenta Gratis
                            </Button>
                        </div>

                        {/* PLAN PRO */}
                        <div className="p-8 rounded-3xl border-2 border-brand-500 bg-slate-900 relative shadow-[0_0_50px_-20px_rgba(34,197,94,0.4)] transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-brand-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">
                                MÁS POPULAR
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Freelancer PRO
                            </h3>
                            <div className="text-4xl font-black mb-6">
                                $10{' '}
                                <span className="text-lg font-normal text-slate-500">
                                    /mes
                                </span>
                            </div>
                            <p className="text-brand-200 text-sm mb-8">
                                Para quienes viven de esto.
                            </p>
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
                                <li className="flex gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-500" />{' '}
                                    Generador de Briefs & Contratos
                                </li>
                            </ul>
                            <Button
                                onClick={handleLogin}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold h-12 shadow-lg"
                            >
                                Comenzar Prueba
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold mb-12 text-center">
                        Preguntas Frecuentes
                    </h2>
                    <div className="space-y-2">
                        <FAQItem
                            question="¿Realmente es ilimitado el plan PRO?"
                            answer="Sí, puedes generar todas las propuestas, contratos y portafolios que necesites. Solo aplicamos límites de sentido común (anti-abuso) para proteger el servidor."
                        />
                        <FAQItem
                            question="¿Puedo cancelar cuando quiera?"
                            answer="Sí, no hay contratos forzosos. Puedes cancelar desde tu panel de control en cualquier momento."
                        />
                        <FAQItem
                            question="¿Funciona para cualquier país?"
                            answer="Absolutamente. Nuestra pasarela de pagos (Gumroad) acepta tarjetas internacionales y PayPal. La app está optimizada para el mercado global."
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 border-t border-white/10 bg-black text-sm text-slate-500">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
                    <div>
                        <div className="text-white font-bold text-xl mb-4">
                            ModoFreelanceOS
                        </div>
                        <p className="max-w-xs mb-6">
                            Herramientas inteligentes para la nueva generación
                            de trabajadores remotos.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Youtube className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Twitch className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Producto</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#features"
                                    className="hover:text-brand-400"
                                >
                                    Herramientas
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#pricing"
                                    className="hover:text-brand-400"
                                >
                                    Precios
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#download"
                                    className="hover:text-brand-400"
                                >
                                    Descargar App
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-brand-400">
                                    Términos y Condiciones
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-brand-400">
                                    Privacidad
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-white/5">
                    &copy; 2026 ModoFreelanceOS. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}
