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
    Briefcase,
} from 'lucide-react'
import { Button } from '../components/ui'

// --- MOCKUPS VISUALES (COMPONENTES DE ADORNO) ---
const MockProposal = () => (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="ml-auto text-[10px] text-slate-500">AI Writer</div>
        </div>
        <div className="space-y-3">
            <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse delay-75"></div>
            <div className="bg-brand-900/20 border border-brand-500/30 rounded p-3 text-xs text-brand-200 mt-2">
                <span className="text-brand-400 font-bold">
                    ✨ Propuesta Generada:
                </span>
                <br />
                "Hola, he analizado tu proyecto de e-commerce y tengo la
                solución exacta..."
            </div>
            <div className="h-2 bg-slate-800 rounded w-full mt-2"></div>
            <div className="h-2 bg-slate-800 rounded w-5/6"></div>
        </div>
    </div>
)

const MockFinance = () => (
    <div className="bg-white text-slate-900 rounded-xl p-4 shadow-xl w-full relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-base">Ingresos</div>
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
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Lun</span>
            <span>Dom</span>
        </div>
    </div>
)

// --- COMPONENTE FAQ ---
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
                <span className="font-bold text-lg">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && (
                <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
            )}
        </div>
    )
}

// --- LANDING PAGE PRINCIPAL ---

export const LandingModern: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        document.title = 'ModoFreelanceOS | Tu Oficina Virtual con IA'
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
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
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

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
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

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
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
                {/* Glow Effects */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-brand-300 mb-8 uppercase tracking-wide">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        Nueva Versión 1.3.0
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-white">
                        Tu carrera freelance,
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-green-300 to-emerald-500">
                            en Autopiloto.
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        La única herramienta que combina{' '}
                        <strong>Inteligencia Artificial</strong> con gestión de
                        negocio. Consigue clientes, crea contratos y cobra más
                        rápido.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
                        <Button
                            onClick={handleLogin}
                            className="h-14 px-8 w-full sm:w-auto text-lg bg-white text-black hover:bg-slate-200 font-bold rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
                        >
                            Probar Gratis en Web{' '}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <a
                            href="#video"
                            className="flex items-center justify-center gap-2 h-14 px-8 w-full sm:w-auto text-lg font-bold border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <PlayCircle className="w-5 h-5" /> Ver Demo (1 min)
                        </a>
                    </div>
                </motion.div>

                {/* Social Proof */}
                <div className="mt-20 pt-10 border-t border-white/5 container mx-auto max-w-4xl">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-6">
                        Optimizado para plataformas como
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
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                El problema del Freelancer promedio
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
                                        Empiezas trabajos sin contrato y el
                                        cliente no paga.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-brand-900/20 to-black p-8 rounded-3xl border border-brand-500/20 shadow-2xl">
                            <h3 className="text-2xl font-bold text-brand-400 mb-6">
                                La Solución ModoFreelance
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <p className="text-slate-300 text-lg">
                                        Propuestas generadas por IA en 30
                                        segundos.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <p className="text-slate-300 text-lg">
                                        Dashboard financiero automático.
                                    </p>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                    <p className="text-slate-300 text-lg">
                                        Generador de Contratos y Briefs legales
                                        al instante.
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENTO GRID (FEATURES) */}
            <section id="features" className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-brand-500 font-bold uppercase tracking-widest text-xs">
                            Características
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Todo lo que necesitas para escalar
                        </h2>
                        <p className="text-slate-400 text-lg">
                            No es solo una herramienta, es tu departamento de
                            ventas, legal y finanzas en una sola app.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px] md:auto-rows-[400px]">
                        {/* FEATURE 1: PROPUESTAS */}
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
                                    la plataforma.
                                </p>
                            </div>
                            <div className="absolute top-1/2 right-[-20px] md:right-10 w-72 transform -translate-y-1/2 group-hover:scale-105 transition-transform duration-500">
                                <MockProposal />
                            </div>
                        </motion.div>

                        {/* FEATURE 2: FINANZAS */}
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
                                Control total de tu flujo de caja.
                            </p>
                            <div className="mt-8 transform group-hover:translate-y-[-10px] transition-transform">
                                <MockFinance />
                            </div>
                        </motion.div>

                        {/* FEATURE 3: WEB BUILDER */}
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
                                Tu portafolio online en minutos.
                            </p>
                            <div className="absolute -right-4 -bottom-4 bg-slate-800 p-4 rounded-xl border border-slate-700 w-48 shadow-2xl rotate-[-5deg] group-hover:rotate-0 transition-transform">
                                <div className="h-2 w-20 bg-slate-600 rounded mb-2"></div>
                                <div className="h-20 bg-slate-700 rounded mb-2"></div>
                                <div className="h-2 w-full bg-slate-600 rounded"></div>
                            </div>
                        </motion.div>

                        {/* FEATURE 4: JOB HUNTER & ACADEMY */}
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
                                        personalizados.
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                                            WeWorkRemotely
                                        </span>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                                            LinkedIn
                                        </span>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                                            +15 más
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5 h-full relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] to-transparent pointer-events-none"></div>
                                    {/* Mock List */}
                                    <div className="space-y-3 opacity-60">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="flex gap-3 items-center p-3 bg-white/5 rounded border border-white/5"
                                            >
                                                <div className="w-8 h-8 rounded bg-slate-700"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                                                    <div className="h-2 bg-slate-700 rounded w-1/4"></div>
                                                </div>
                                                <div className="text-green-500 text-xs font-bold">
                                                    $3k+
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VIDEO SECTION */}
            <section className="py-20 bg-black relative">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <h2 className="text-3xl font-bold mb-12">
                        Mira todo lo que puedes hacer
                    </h2>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)] border border-slate-800 bg-slate-900 relative group">
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                            {/* Puedes quitar este play si el iframe tiene controles */}
                        </div>
                        {/* REEMPLAZA EL SRC CON TU VIDEO */}
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO?rel=0"
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

                    <div className="grid md:grid-cols-2 gap-8 items-center">
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
                            answer="Sí, no hay contratos forzosos. Puedes cancelar desde tu panel de control en cualquier momento y mantendrás el acceso hasta el final de tu ciclo de facturación."
                        />
                        <FAQItem
                            question="¿Funciona para cualquier país?"
                            answer="Absolutamente. Nuestra pasarela de pagos (Gumroad) acepta tarjetas internacionales y PayPal. La app está optimizada para el mercado global y latino."
                        />
                        <FAQItem
                            question="¿Mis datos están seguros?"
                            answer="Tus finanzas y datos privados se guardan encriptados en Firebase (Google). Nadie, ni siquiera nosotros, leemos tus contratos o cifras financieras."
                        />
                    </div>
                </div>
            </section>

            {/* DOWNLOAD FINAL */}
            <section
                id="download"
                className="py-24 px-6 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden"
            >
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8">
                        Lleva tu oficina en el bolsillo
                    </h2>
                    <p className="text-slate-400 mb-12 text-lg">
                        Disponible para todos tus dispositivos.
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
                                    Descargar para
                                </div>
                                <div className="text-xl font-bold text-white">
                                    Android APK
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
                                    Descargar para
                                </div>
                                <div className="text-xl font-bold text-white">
                                    Windows
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 bg-black text-sm text-slate-500">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        &copy; 2026 ModoFreelanceOS. Todos los derechos
                        reservados.
                    </div>
                    <div className="flex gap-6">
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
                    </div>
                </div>
            </footer>
        </div>
    )
}
