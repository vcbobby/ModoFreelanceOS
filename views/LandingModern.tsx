import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
// AGREGADOS: Briefcase, Globe, Monitor (Faltaban y causaban el error)
import {
    ArrowRight,
    CheckCircle,
    Zap,
    Shield,
    Smartphone,
    Monitor,
    Globe,
    Star,
    PlayCircle,
    Menu,
    X,
    Instagram,
    Linkedin,
    Youtube,
    LayoutDashboard,
    Briefcase,
} from 'lucide-react'
import { Button } from '../components/ui'

const FEATURES = [
    {
        title: 'Propuestas con IA',
        desc: 'Redacta cartas de venta persuasivas para Upwork y Workana en segundos.',
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
    },
    {
        title: 'Contratos & Briefs',
        desc: 'Genera documentos legales y checklists de tareas automáticos.',
        icon: <Shield className="w-6 h-6 text-green-400" />,
    },
    {
        title: 'Constructor Web',
        desc: 'Tu portafolio profesional en línea sin saber programar.',
        icon: <Globe className="w-6 h-6 text-blue-400" />,
    },
    {
        title: 'Gestión Total',
        desc: 'Finanzas, Clientes, Agenda y Proyectos en un solo lugar.',
        icon: <LayoutDashboard className="w-6 h-6 text-purple-400" />,
    },
]

export const LandingModern: React.FC = () => {
    // SEO Básico
    useEffect(() => {
        document.title =
            'ModoFreelanceOS - El Sistema Operativo para Freelancers'
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc)
            metaDesc.setAttribute(
                'content',
                'La herramienta todo en uno para freelancers. Gestiona proyectos, crea contratos, portafolios y propuestas con IA.'
            )
    }, [])

    // Links de descarga (Asegúrate que coincidan con tu version.json)
    const ANDROID_LINK = 'https://freelanceos-app.vercel.app/app-android.apk'
    const WINDOWS_LINK = 'https://freelanceos-app.vercel.app/app-windows.exe'

    const handleLogin = () => {
        window.location.href = 'https://app.modofreelanceos.com'
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tight">
                        ModoFreelance<span className="text-brand-500">OS</span>
                    </div>
                    <div className="hidden md:flex gap-6 items-center">
                        <a
                            href="#features"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Funciones
                        </a>
                        <a
                            href="#download"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Descargar
                        </a>
                        <Button
                            onClick={handleLogin}
                            className="bg-white text-black hover:bg-slate-200"
                        >
                            Iniciar Sesión
                        </Button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="relative pt-32 pb-20 px-6 md:pt-48 md:pb-32 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto max-w-4xl"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-6 tracking-wide">
                        V 1.3.0 DISPONIBLE AHORA
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                        Tu Oficina Virtual con <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-600">
                            Inteligencia Artificial
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Deja de perder tiempo en tareas administrativas. Genera
                        propuestas, contratos, facturas y portafolios en
                        segundos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={handleLogin}
                            className="h-14 px-8 text-lg bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/20 w-full sm:w-auto"
                        >
                            Usar en el Navegador{' '}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <a
                            href="#video"
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors px-6 py-4 font-medium"
                        >
                            <PlayCircle className="w-6 h-6" /> Ver Demo
                        </a>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* AQUI ESTABA EL ERROR: Briefcase no estaba importado */}
                        <span className="flex items-center gap-2 text-lg font-bold">
                            <Monitor className="w-5 h-5" /> Upwork
                        </span>
                        <span className="flex items-center gap-2 text-lg font-bold">
                            <Globe className="w-5 h-5" /> Fiverr
                        </span>
                        <span className="flex items-center gap-2 text-lg font-bold">
                            <Briefcase className="w-5 h-5" /> Workana
                        </span>
                    </div>
                </motion.div>
            </header>

            {/* VIDEO DEMO */}
            <section
                id="video"
                className="py-20 bg-slate-900 border-y border-white/5"
            >
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black relative">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO"
                            title="ModoFreelanceOS Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section id="features" className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Todo lo que necesitas para crecer
                        </h2>
                        <p className="text-slate-400">
                            Diseñado por freelancers, para freelancers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOWNLOAD SECTION */}
            <section
                id="download"
                className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-8">
                        Lleva tu oficina en el bolsillo
                    </h2>
                    <p className="text-slate-400 mb-12 text-lg">
                        Descarga la aplicación nativa para Android y Windows.
                        Recibe notificaciones de cobros, trabaja offline y más.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a
                            href={ANDROID_LINK}
                            className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-all hover:scale-105 group"
                        >
                            <div className="bg-green-500/20 p-3 rounded-lg text-green-400 group-hover:text-green-300">
                                <Smartphone className="w-8 h-8" />
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
                            className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-left transition-all hover:scale-105 group"
                        >
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 group-hover:text-blue-300">
                                <Monitor className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase font-bold">
                                    Descargar para
                                </div>
                                <div className="text-xl font-bold text-white">
                                    Windows PC
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 bg-slate-950">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-500 text-sm">
                        &copy; 2026 ModoFreelanceOS. Todos los derechos
                        reservados.
                    </div>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-slate-400 hover:text-pink-500 transition-colors"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
