import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    ArrowRight, CheckCircle, Zap, Shield, Smartphone, Monitor, Globe, 
    PlayCircle, Menu, X, Instagram, Linkedin, Youtube, LayoutDashboard, 
    PenTool, DollarSign, GraduationCap, Radar, FileText, Check
} from 'lucide-react'
import { Button } from '../components/ui'

// --- COMPONENTES VISUALES (MOCKUPS CSS) ---

const MockProposal = () => (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full max-w-sm shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-20 bg-brand-900/20 border border-brand-500/30 rounded p-3 text-xs text-brand-200">
                <span className="text-brand-400 font-bold">IA:</span> Generando propuesta persuasiva para Upwork...
            </div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
)

const MockFinance = () => (
    <div className="bg-white text-slate-900 rounded-xl p-4 shadow-xl w-full max-w-sm relative">
        <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-lg">Finanzas</div>
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">+12% este mes</div>
        </div>
        <div className="flex items-end gap-2 h-24 mb-4 justify-between px-2">
            {[40, 70, 30, 85, 50, 90].map((h, i) => (
                <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    whileInView={{ height: `${h}%` }} 
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-8 bg-brand-600 rounded-t-sm"
                ></motion.div>
            ))}
        </div>
        <div className="flex gap-2">
            <div className="flex-1 bg-slate-100 h-8 rounded"></div>
            <div className="flex-1 bg-brand-600 h-8 rounded text-white flex items-center justify-center text-xs font-bold">Ver Reporte</div>
        </div>
    </div>
)

const MockWebBuilder = () => (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 w-full max-w-sm shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="bg-slate-900 p-2 rounded-t-lg flex justify-between items-center">
            <span className="text-[10px] text-slate-500">mi-portafolio.com</span>
        </div>
        <div className="bg-slate-900 p-4 space-y-4">
            <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="aspect-video bg-slate-800 rounded"></div>
                <div className="aspect-video bg-slate-800 rounded"></div>
            </div>
        </div>
    </div>
)

// --- LANDING PAGE PRINCIPAL ---

export const LandingModern: React.FC = () => {
    
    useEffect(() => {
        // SEO: Meta tags dinámicos
        document.title = "ModoFreelanceOS | El Sistema Operativo Todo-en-Uno para Freelancers";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Automatiza tu vida freelance. Genera propuestas con IA, gestiona finanzas, crea tu web profesional y encuentra trabajo en un solo lugar.');
    }, []);

    const handleLogin = () => window.location.href = "https://app.modofreelanceos.com";

    const ANDROID_LINK = "https://freelanceos-app.vercel.app/app-android.apk";
    const WINDOWS_LINK = "https://freelanceos-app.vercel.app/app-windows.exe";

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
            
            {/* NAVBAR FLOTANTE */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" fill="currentColor"/>
                        </div>
                        ModoFreelance<span className="text-brand-500">OS</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-white transition-colors">Herramientas</a>
                        <a href="#download" className="hover:text-white transition-colors">Descargar</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={handleLogin} className="bg-white text-black hover:bg-slate-200 font-bold px-6">Entrar</Button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="relative pt-40 pb-32 px-6 overflow-hidden">
                {/* Fondo animado */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                
                <div className="container mx-auto text-center max-w-5xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-brand-300 mb-8 uppercase tracking-wide hover:bg-white/10 transition-colors cursor-default">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> v1.3.0 Disponible Ahora
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight">
                            Tu carrera freelance,<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-green-400 to-emerald-600">en Autopiloto.</span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Deja de perder horas en tareas administrativas. Usa nuestra <strong>Inteligencia Artificial</strong> para conseguir clientes, crear contratos, gestionar tu dinero y construir tu marca personal.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={handleLogin} className="h-14 px-10 text-lg bg-brand-600 hover:bg-brand-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] border border-brand-400/50">
                                Comenzar Gratis <ArrowRight className="ml-2 w-5 h-5"/>
                            </Button>
                            <a href="#video" className="flex items-center justify-center gap-2 h-14 px-10 text-lg font-bold border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                                <PlayCircle className="w-6 h-6"/> Ver Demo
                            </a>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* BENTO GRID DE CARACTERÍSTICAS (La parte visual fuerte) */}
            <section id="features" className="py-24 px-6 bg-slate-950">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold mb-4">Todo lo que necesitas para triunfar</h2>
                        <p className="text-slate-400">Una suite completa de herramientas diseñadas para facturar más.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                        
                        {/* FEATURE 1: PROPUESTAS (GRANDE) */}
                        <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-10 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400"><PenTool className="w-6 h-6"/></div>
                                <h3 className="text-3xl font-bold mb-4">Propuestas con IA</h3>
                                <p className="text-slate-400 max-w-md">No escribas más cartas desde cero. Nuestra IA analiza la oferta de trabajo y redacta una propuesta ganadora para Upwork o Workana en segundos.</p>
                            </div>
                            <div className="absolute top-20 right-[-50px] md:right-10 w-80 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                                <MockProposal />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0"></div>
                        </motion.div>

                        {/* FEATURE 2: FINANZAS */}
                        <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-slate-900 border border-slate-800 rounded-3xl p-10 relative overflow-hidden group">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400"><DollarSign className="w-6 h-6"/></div>
                            <h3 className="text-2xl font-bold mb-2">Finanzas Claras</h3>
                            <p className="text-slate-400 text-sm mb-6">Controla ingresos, gastos y suscripciones. Sabe cuánto ganas realmente.</p>
                            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-64 transform group-hover:scale-105 transition-transform">
                                <MockFinance />
                            </div>
                        </motion.div>

                        {/* FEATURE 3: WEB BUILDER */}
                        <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-slate-900 border border-slate-800 rounded-3xl p-10 relative overflow-hidden flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400"><Monitor className="w-6 h-6"/></div>
                                <h3 className="text-2xl font-bold mb-2">Web Builder PRO</h3>
                                <p className="text-slate-400 text-sm">Crea tu portafolio profesional con dominio propio sin tocar código.</p>
                            </div>
                            <div className="absolute bottom-10 right-[-20px] transform group-hover:-rotate-3 transition-transform">
                                <MockWebBuilder />
                            </div>
                        </motion.div>

                        {/* FEATURE 4: JOB HUNTER & ACADEMY (GRANDE) */}
                        <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:0.3}} className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-10 relative overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-10 h-full items-center">
                                <div>
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400"><Radar className="w-6 h-6"/></div>
                                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400"><GraduationCap className="w-6 h-6"/></div>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">Aprende y Consigue Trabajo</h3>
                                    <p className="text-slate-400 mb-6">Un buscador que rastrea 20+ sitios de empleo remoto en tiempo real, combinado con una Academia IA que genera cursos personalizados para ti.</p>
                                    <ul className="space-y-2 text-slate-300">
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500"/> Ofertas de WeWorkRemotely, LinkedIn, etc.</li>
                                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500"/> Cursos generados al instante.</li>
                                    </ul>
                                </div>
                                <div className="bg-black/40 rounded-xl p-4 border border-white/5 h-full">
                                    {/* Lista simulada de trabajos */}
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flex gap-3 items-center p-3 bg-white/5 rounded border border-white/5">
                                                <div className="w-8 h-8 rounded bg-slate-700"></div>
                                                <div className="flex-1">
                                                    <div className="h-2 bg-slate-600 rounded w-3/4 mb-2"></div>
                                                    <div className="h-2 bg-slate-700 rounded w-1/4"></div>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">$3k+</div>
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
            <section id="video" className="py-24 bg-black relative">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <h2 className="text-3xl font-bold mb-12">Míralo en acción</h2>
                    <div className="aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)] border border-slate-800 bg-slate-900">
                        {/* REEMPLAZA EL ID DEL VIDEO AQUI */}
                        <iframe 
                            className="w-full h-full" 
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO?rel=0&modestbranding=1" 
                            title="Demo" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS / TRUST (Simulado para MVP) */}
            <section className="py-20 border-y border-white/10 bg-slate-950">
                <div className="container mx-auto text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Diseñado para triunfar en</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                        <div className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6"/> Fiverr</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6"/> Upwork</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><Monitor className="w-6 h-6"/> Freelancer</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6"/> Workana</div>
                    </div>
                </div>
            </section>

            {/* DOWNLOAD & CTA FINAL */}
            <section id="download" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent"></div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black mb-8">Comienza tu transformación hoy.</h2>
                    <p className="text-xl text-slate-300 mb-12">
                        Únete a la nueva generación de freelancers que usan IA para trabajar menos y ganar más.
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <a href={ANDROID_LINK} className="flex items-center gap-4 bg-white text-black p-4 rounded-xl hover:bg-slate-200 transition-all hover:scale-105 shadow-xl w-full md:w-auto justify-center md:justify-start">
                            <Smartphone className="w-8 h-8"/>
                            <div className="text-left">
                                <div className="text-xs uppercase font-bold opacity-60">Disponible en</div>
                                <div className="text-xl font-black">Android</div>
                            </div>
                        </a>
                        <a href={WINDOWS_LINK} className="flex items-center gap-4 bg-slate-800 text-white border border-slate-700 p-4 rounded-xl hover:bg-slate-700 transition-all hover:scale-105 shadow-xl w-full md:w-auto justify-center md:justify-start">
                            <Monitor className="w-8 h-8"/>
                            <div className="text-left">
                                <div className="text-xs uppercase font-bold opacity-60">Disponible en</div>
                                <div className="text-xl font-black">Windows</div>
                            </div>
                        </a>
                    </div>
                    <div className="mt-8">
                        <Button onClick={handleLogin} variant="ghost" className="text-brand-400 hover:text-brand-300">
                            O úsalo desde el navegador web ->
                        </Button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 bg-black text-sm text-slate-500">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        &copy; 2026 ModoFreelanceOS. Hecho con ❤️ para la comunidad.
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5"/></a>
                        <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5"/></a>
                    </div>
                </div>
            </footer>

        </div>
    )
}