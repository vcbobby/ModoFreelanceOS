// import React, { useEffect, useState } from 'react'
// import { doc, getDoc } from 'firebase/firestore'
// import { db } from '../firebase'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//     Mail,
//     ArrowRight,
//     Briefcase,
//     GraduationCap,
//     Code,
//     MessageCircle,
//     X,
//     ExternalLink,
//     FileText,
//     Moon,
//     Sun,
//     PlayCircle,
//     Zap,
//     Linkedin,
//     Twitter,
//     Instagram,
//     Github,
//     Globe,
//     Youtube,
//     Facebook,
//     Monitor,
//     Download,
// } from 'lucide-react'

// // --- UTILIDAD DE DESCARGA ---
// const forceDownload = async (url: string, filename: string) => {
//     try {
//         const response = await fetch(url)
//         const blob = await response.blob()
//         const blobUrl = window.URL.createObjectURL(blob)
//         const link = document.createElement('a')
//         link.href = blobUrl
//         link.download = filename || 'archivo'
//         document.body.appendChild(link)
//         link.click()
//         document.body.removeChild(link)
//         window.URL.revokeObjectURL(blobUrl)
//     } catch (e) {
//         window.open(url, '_blank')
//     }
// }

// // --- COMPONENTE 1: REDES SOCIALES (ICONOS) ---
// const Socials = ({ data, dark = false }: any) => {
//     const links = [
//         {
//             url: data.linkedin,
//             icon: <Linkedin className="w-5 h-5" />,
//             label: 'LinkedIn',
//         },
//         {
//             url: data.instagram,
//             icon: <Instagram className="w-5 h-5" />,
//             label: 'Instagram',
//         },
//         {
//             url: data.twitter,
//             icon: <Twitter className="w-5 h-5" />,
//             label: 'Twitter',
//         },
//         {
//             url: data.github,
//             icon: <Github className="w-5 h-5" />,
//             label: 'GitHub',
//         },
//         {
//             url: data.behance,
//             icon: <Globe className="w-5 h-5" />,
//             label: 'Behance',
//         },
//         {
//             url: data.youtube,
//             icon: <Youtube className="w-5 h-5" />,
//             label: 'YouTube',
//         },
//         {
//             url: data.facebook,
//             icon: <Facebook className="w-5 h-5" />,
//             label: 'Facebook',
//         },
//         {
//             url: data.twitch,
//             icon: <MessageCircle className="w-5 h-5" />,
//             label: 'Twitch',
//         },
//         { url: data.kick, icon: <Zap className="w-5 h-5" />, label: 'Kick' },
//         {
//             url: data.patreon,
//             icon: <span className="font-bold text-lg">$</span>,
//             label: 'Patreon',
//         },
//     ].filter((l) => l.url && l.url.length > 3)

//     if (links.length === 0) return null

//     return (
//         <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
//             {links.map((l, i) => (
//                 <a
//                     key={i}
//                     href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className={`p-3 rounded-full border transition-colors ${
//                         dark
//                             ? 'border-white/20 hover:bg-white/20 text-white'
//                             : 'border-black/20 hover:bg-black/10 text-black'
//                     }`}
//                     title={l.label}
//                 >
//                     {l.icon}
//                 </a>
//             ))}
//         </div>
//     )
// }

// // --- COMPONENTE 2: PLATAFORMAS FREELANCE (BOTONES) ---
// const FreelancePlatforms = ({ data, dark = false }: any) => {
//     const links = [
//         {
//             url: data.upwork,
//             icon: <Briefcase className="w-4 h-4" />,
//             label: 'Upwork',
//         },
//         {
//             url: data.freelancer,
//             icon: <Monitor className="w-4 h-4" />,
//             label: 'Freelancer',
//         },
//         {
//             url: data.workana,
//             icon: <Globe className="w-4 h-4" />,
//             label: 'Workana',
//         },
//         {
//             url: data.fiverr,
//             icon: <span className="font-bold text-xs">Fi</span>,
//             label: 'Fiverr',
//         },
//     ].filter((l) => l.url && l.url.length > 3)

//     if (links.length === 0) return null

//     return (
//         <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
//             {links.map((l, i) => (
//                 <a
//                     key={i}
//                     href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
//                         dark
//                             ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
//                             : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
//                     }`}
//                 >
//                     {l.icon} {l.label}
//                 </a>
//             ))}
//         </div>
//     )
// }

// // --- COMPONENTE: ACCIONES DE CONTACTO ---
// const ContactActions = ({ data, accent, style = 'default' }: any) => {
//     const btnBase =
//         'px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 justify-center cursor-pointer'
//     const whatsappLink = data.whatsapp
//         ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`
//         : null

//     if (style === 'neo') {
//         return (
//             <div className="flex flex-wrap gap-4 mt-8 justify-center">
//                 <a
//                     href={`mailto:${data.email}`}
//                     className={`${btnBase} border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
//                     style={{ backgroundColor: accent }}
//                 >
//                     <Mail className="w-5 h-5" /> Email
//                 </a>
//                 {whatsappLink && (
//                     <a
//                         href={whatsappLink}
//                         target="_blank"
//                         rel="noreferrer"
//                         className={`${btnBase} border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
//                     >
//                         <MessageCircle className="w-5 h-5" /> WhatsApp
//                     </a>
//                 )}
//             </div>
//         )
//     }
//     if (style === 'terminal') {
//         return (
//             <div className="flex flex-wrap gap-4 mt-8 font-mono justify-center md:justify-start">
//                 <a
//                     href={`mailto:${data.email}`}
//                     className="text-green-400 hover:bg-green-400/20 px-4 py-2 border border-green-400 rounded-sm w-full md:w-auto text-center"
//                 >
//                     {'>'} ./enviar_email.exe
//                 </a>
//                 {whatsappLink && (
//                     <a
//                         href={whatsappLink}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-green-400 hover:bg-green-400/20 px-4 py-2 border border-green-400 rounded-sm w-full md:w-auto text-center"
//                     >
//                         {'>'} ./abrir_whatsapp.sh
//                     </a>
//                 )}
//             </div>
//         )
//     }

//     return (
//         <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
//             <a
//                 href={`mailto:${data.email}`}
//                 className={`${btnBase} text-white shadow-lg hover:scale-105 hover:shadow-xl`}
//                 style={{ backgroundColor: accent }}
//             >
//                 <Mail className="w-5 h-5" /> Contáctame
//             </a>
//             {whatsappLink && (
//                 <a
//                     href={whatsappLink}
//                     target="_blank"
//                     rel="noreferrer"
//                     className={`${btnBase} border-2 border-current bg-transparent hover:bg-current/10`}
//                 >
//                     <MessageCircle className="w-5 h-5" /> WhatsApp
//                 </a>
//             )}
//         </div>
//     )
// }

// // --- FOOTER ---
// const Footer = ({ name, isDark }: any) => (
//     <footer
//         className={`py-12 text-center text-sm border-t mt-auto w-full relative z-10 ${
//             isDark
//                 ? 'border-white/10 text-slate-400'
//                 : 'border-black/10 text-slate-500'
//         }`}
//     >
//         <p className="font-medium">
//             &copy; {new Date().getFullYear()} {name}. Todos los derechos
//             reservados.
//         </p>
//         <a
//             href="https://modofreelanceos.com"
//             target="_blank"
//             rel="noreferrer"
//             className="mt-2 inline-flex items-center gap-1 hover:text-brand-500 transition-colors font-bold"
//         >
//             <Zap className="w-3 h-3" /> Potenciado por ModoFreelanceOS
//         </a>
//     </footer>
// )

// // --- SECCIONES COMPARTIDAS (PROJECTS + CV) ---
// const SharedSections = ({
//     data,
//     accent,
//     openProject,
//     gridMode,
//     isDark,
// }: any) => (
//     <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 w-full">
//         {data.projects && data.projects.length > 0 && (
//             <section>
//                 <h3
//                     className={`text-2xl font-bold mb-10 flex items-center gap-3 opacity-90 border-b pb-4 ${
//                         isDark
//                             ? 'text-white border-white/20'
//                             : 'text-slate-900 border-black/10'
//                     }`}
//                 >
//                     <Briefcase className="w-6 h-6" /> Proyectos
//                 </h3>
//                 <div
//                     className={`grid gap-8 ${
//                         gridMode
//                             ? 'md:grid-cols-2 lg:grid-cols-3'
//                             : 'md:grid-cols-2'
//                     }`}
//                 >
//                     {data.projects.map((p: any, i: number) => (
//                         <motion.div
//                             key={i}
//                             whileHover={{ y: -5 }}
//                             onClick={() => openProject(p)}
//                             className={`group cursor-pointer rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all ${
//                                 isDark
//                                     ? 'border-white/10 bg-white/5'
//                                     : 'border-black/10 bg-white'
//                             }`}
//                         >
//                             <div
//                                 className={`aspect-[4/3] relative overflow-hidden ${
//                                     isDark ? 'bg-gray-800' : 'bg-gray-100'
//                                 }`}
//                             >
//                                 {p.cover ? (
//                                     <img
//                                         src={p.cover}
//                                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                                         alt={p.title}
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center opacity-50">
//                                         Sin Imagen
//                                     </div>
//                                 )}
//                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                                     <span className="text-white font-bold border-2 border-white px-6 py-2 rounded-full">
//                                         Ver Detalles
//                                     </span>
//                                 </div>
//                             </div>
//                             <div className="p-6">
//                                 <h4
//                                     className={`text-xl font-bold mb-2 transition-colors line-clamp-1 ${
//                                         isDark
//                                             ? 'text-white group-hover:text-brand-400'
//                                             : 'text-slate-900 group-hover:text-brand-600'
//                                     }`}
//                                 >
//                                     {p.title}
//                                 </h4>
//                                 <p
//                                     className={`text-sm line-clamp-2 mb-4 ${
//                                         isDark
//                                             ? 'text-slate-400'
//                                             : 'text-slate-600'
//                                     }`}
//                                 >
//                                     {p.desc}
//                                 </p>
//                                 <div className="flex gap-2 flex-wrap">
//                                     {p.tags
//                                         ?.split(',')
//                                         .map((t: string, idx: number) => (
//                                             <span
//                                                 key={idx}
//                                                 className={`text-[10px] px-2 py-1 rounded font-bold uppercase opacity-70 ${
//                                                     isDark
//                                                         ? 'bg-white/10 text-white'
//                                                         : 'bg-black/10 text-black'
//                                                 }`}
//                                             >
//                                                 {t.trim()}
//                                             </span>
//                                         ))}
//                                 </div>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>
//             </section>
//         )}

//         <div className="grid md:grid-cols-2 gap-16">
//             {data.experience && data.experience.length > 0 && (
//                 <section>
//                     <h3
//                         className={`text-xl font-bold mb-8 flex items-center gap-3 opacity-90 ${
//                             isDark ? 'text-white' : 'text-slate-900'
//                         }`}
//                     >
//                         <Code className="w-5 h-5" /> Experiencia
//                     </h3>
//                     <div
//                         className={`space-y-10 border-l-2 pl-8 ml-2 ${
//                             isDark ? 'border-white/20' : 'border-black/10'
//                         }`}
//                     >
//                         {data.experience.map((e: any, i: number) => (
//                             <div key={i} className="relative">
//                                 <span
//                                     className={`absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 box-content ${
//                                         isDark
//                                             ? 'border-slate-950 bg-slate-400'
//                                             : 'border-white bg-slate-600'
//                                     }`}
//                                 ></span>
//                                 <h4
//                                     className={`font-bold text-lg ${
//                                         isDark ? 'text-white' : 'text-slate-900'
//                                     }`}
//                                 >
//                                     {e.role}
//                                 </h4>
//                                 <p
//                                     className={`text-sm mb-3 font-medium ${
//                                         isDark
//                                             ? 'text-slate-400'
//                                             : 'text-slate-500'
//                                     }`}
//                                 >
//                                     {e.company} • {e.year}
//                                 </p>
//                                 <p
//                                     className={`text-sm leading-relaxed ${
//                                         isDark
//                                             ? 'text-slate-300'
//                                             : 'text-slate-600'
//                                     }`}
//                                 >
//                                     {e.desc}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//             )}

//             <section>
//                 {data.education && data.education.length > 0 && (
//                     <div className="mb-12">
//                         <h3
//                             className={`text-xl font-bold mb-8 flex items-center gap-3 opacity-90 ${
//                                 isDark ? 'text-white' : 'text-slate-900'
//                             }`}
//                         >
//                             <GraduationCap className="w-5 h-5" /> Educación
//                         </h3>
//                         <div className="space-y-4">
//                             {data.education.map((e: any, i: number) => (
//                                 <div
//                                     key={i}
//                                     className={`p-6 rounded-xl border ${
//                                         isDark
//                                             ? 'bg-white/5 border-white/10'
//                                             : 'bg-slate-50 border-slate-200'
//                                     }`}
//                                 >
//                                     <h4
//                                         className={`font-bold text-base ${
//                                             isDark
//                                                 ? 'text-white'
//                                                 : 'text-slate-900'
//                                         }`}
//                                     >
//                                         {e.degree}
//                                     </h4>
//                                     <p
//                                         className={`text-sm ${
//                                             isDark
//                                                 ? 'text-slate-400'
//                                                 : 'text-slate-600'
//                                         }`}
//                                     >
//                                         {e.school} • {e.year}
//                                     </p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//                 {data.skills && (
//                     <div>
//                         <h3
//                             className={`text-xl font-bold mb-6 flex items-center gap-3 opacity-90 ${
//                                 isDark ? 'text-white' : 'text-slate-900'
//                             }`}
//                         >
//                             Habilidades
//                         </h3>
//                         <div className="flex flex-wrap gap-2">
//                             {data.skills
//                                 .split(',')
//                                 .map((s: string, i: number) => (
//                                     <span
//                                         key={i}
//                                         className={`px-4 py-2 rounded-lg font-bold text-sm ${
//                                             isDark
//                                                 ? 'bg-white/10 text-white'
//                                                 : 'bg-black/10 text-black'
//                                         }`}
//                                     >
//                                         {s.trim()}
//                                     </span>
//                                 ))}
//                         </div>
//                     </div>
//                 )}
//             </section>
//         </div>
//     </div>
// )

// // --- LAYOUTS ---

// const ClassicLayout = ({ data, accent, openProject }: any) => (
//     <div className="container mx-auto px-6 py-20 max-w-4xl min-h-screen flex flex-col">
//         <header className="text-center mb-16">
//             {data.photo && (
//                 <img
//                     src={data.photo}
//                     className="w-48 h-48 rounded-full mx-auto mb-8 object-cover border-4 shadow-xl border-white dark:border-slate-800"
//                     alt="Profile"
//                 />
//             )}
//             <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white">
//                 {data.name}
//             </h1>
//             <p
//                 className="text-xl opacity-60 mb-8 font-medium uppercase tracking-widest text-slate-600 dark:text-slate-400"
//                 style={{ color: accent }}
//             >
//                 {data.role}
//             </p>
//             <p className="max-w-2xl mx-auto opacity-80 leading-relaxed mb-10 text-lg text-slate-700 dark:text-slate-300">
//                 {data.bio}
//             </p>
//             <div className="flex flex-col items-center">
//                 <ContactActions data={data} accent={accent} />
//                 <div className="flex flex-col items-center gap-2 mt-6">
//                     <Socials data={data} />
//                     <FreelancePlatforms data={data} />
//                 </div>
//             </div>
//         </header>
//         <SharedSections data={data} accent={accent} openProject={openProject} />
//         <Footer name={data.name} isDark={false} />
//     </div>
// )

// const SplitLayout = ({ data, accent, openProject }: any) => (
//     <div className="lg:flex min-h-screen">
//         <div className="lg:w-[40%] p-12 lg:fixed lg:h-screen flex flex-col justify-center bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10">
//             <div>
//                 {data.photo && (
//                     <img
//                         src={data.photo}
//                         className="w-32 h-32 rounded-full mb-8 object-cover shadow-lg border-4 border-white dark:border-slate-800"
//                         alt="Profile"
//                     />
//                 )}
//                 <h1 className="text-5xl font-black mb-4 leading-none tracking-tighter text-slate-900 dark:text-white">
//                     {data.name}
//                 </h1>
//                 <p
//                     className="text-xl font-mono mb-8 opacity-90"
//                     style={{ color: accent }}
//                 >
//                     {data.role}
//                 </p>
//                 <p className="opacity-80 leading-relaxed text-lg mb-8 text-slate-600 dark:text-slate-400">
//                     {data.bio}
//                 </p>
//                 <ContactActions data={data} accent={accent} />
//                 <div className="mt-8 flex flex-col gap-2">
//                     <Socials data={data} dark={true} />
//                     <FreelancePlatforms data={data} dark={true} />
//                 </div>
//             </div>
//             <div className="mt-auto hidden lg:block pt-8">
//                 <Footer name={data.name} />
//             </div>
//         </div>
//         <div className="lg:w-[60%] lg:ml-[40%] p-8 lg:p-24 bg-white dark:bg-black">
//             <SharedSections
//                 data={data}
//                 accent={accent}
//                 openProject={openProject}
//                 isDark={true}
//             />
//             <div className="lg:hidden">
//                 <Footer name={data.name} isDark={true} />
//             </div>
//         </div>
//     </div>
// )

// const GridLayout = ({ data, accent, openProject }: any) => (
//     <div className="min-h-screen pb-10">
//         <header className="py-32 px-6 text-center bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden mb-12">
//             <div className="relative z-10 container mx-auto">
//                 <h2 className="text-6xl font-bold mb-4 text-slate-900 dark:text-white">
//                     {data.name}
//                 </h2>
//                 <p
//                     className="text-2xl font-light mb-8"
//                     style={{ color: accent }}
//                 >
//                     {data.role}
//                 </p>
//                 <p className="max-w-2xl mx-auto opacity-70 mb-8 text-slate-600 dark:text-slate-300">
//                     {data.bio}
//                 </p>
//                 <div className="flex flex-col items-center">
//                     <ContactActions data={data} accent={accent} />
//                     <div className="mt-6 flex flex-col items-center gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </div>
//         </header>
//         <div className="container mx-auto px-6 max-w-7xl">
//             <SharedSections
//                 data={data}
//                 accent={accent}
//                 openProject={openProject}
//                 gridMode={true}
//             />
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// const MinimalDarkLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-black text-gray-300 min-h-screen font-mono p-6 md:p-20">
//         <div className="max-w-5xl mx-auto border-l border-gray-800 pl-8 md:pl-16 relative">
//             <div
//                 className="absolute left-0 top-0 w-1 h-20"
//                 style={{ backgroundColor: accent }}
//             ></div>
//             <p className="text-sm mb-6 text-gray-500 tracking-widest">
//                 {'<Developer />'}
//             </p>
//             <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-none">
//                 {data.name}
//             </h1>
//             <p className="text-xl mb-8 max-w-2xl" style={{ color: accent }}>
//                 // {data.role}
//             </p>
//             <p className="text-lg text-gray-400 mb-10 max-w-xl">{data.bio}</p>

//             <ContactActions data={data} accent={accent} style="terminal" />
//             <div className="mt-6 flex flex-col items-start gap-2">
//                 <Socials data={data} dark={true} />
//                 <FreelancePlatforms data={data} dark={true} />
//             </div>

//             <div className="mt-20">
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     isDark={true}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} isDark={true} />
//     </div>
// )

// const TerminalLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-[#0d1117] text-[#00ff41] min-h-screen font-mono p-4 flex flex-col">
//         <div className="max-w-4xl mx-auto border border-[#30363d] rounded-lg bg-[#010409] p-6 md:p-10 shadow-2xl mt-10 w-full flex-1">
//             <div className="flex gap-2 mb-8 border-b border-[#30363d] pb-4">
//                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                 <span className="ml-4 text-xs text-gray-500">bash — 80x24</span>
//             </div>
//             <p className="mb-4 text-gray-400">
//                 Last login: {new Date().toDateString()}
//             </p>
//             <h1 className="text-4xl font-bold mb-6 text-white">{data.name}</h1>
//             <p className="text-xl mb-6 text-green-300">{data.role}</p>
//             <p className="opacity-80 mb-8 max-w-2xl text-gray-300">
//                 {data.bio}
//             </p>

//             <ContactActions data={data} accent={accent} style="terminal" />
//             <div className="mt-6 flex flex-col items-start gap-2">
//                 <Socials data={data} dark={true} />
//                 <FreelancePlatforms data={data} dark={true} />
//             </div>

//             <div className="mt-16 border-t border-[#30363d] pt-8">
//                 <p className="mb-6">
//                     <span className="text-blue-400">~</span> $ ls ./projects
//                 </p>
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     isDark={true}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} isDark={true} />
//     </div>
// )

// const NeoLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-[#e0e7ff] dark:bg-slate-900 min-h-screen font-sans text-black p-4">
//         <div className="container mx-auto max-w-5xl bg-white dark:bg-slate-200 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-16 mt-10 rounded-none">
//             <header className="mb-16">
//                 <h1
//                     className="text-6xl md:text-8xl font-black uppercase mb-4 leading-none text-black"
//                     style={{ textShadow: `4px 4px 0px ${accent}` }}
//                 >
//                     {data.name}
//                 </h1>
//                 <div className="bg-black text-white inline-block px-4 py-2 font-bold text-xl uppercase transform -rotate-2">
//                     {data.role}
//                 </div>
//                 <p className="text-xl font-bold mt-8 border-l-8 border-black pl-6 max-w-2xl text-black">
//                     {data.bio}
//                 </p>
//                 <div className="mt-8 flex flex-col items-start">
//                     <ContactActions data={data} accent={accent} style="neo" />
//                     <div className="mt-4 flex flex-col gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </header>
//             <div className="border-t-4 border-black pt-10">
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     gridMode={true}
//                 />
//             </div>
//         </div>
//         <div className="text-slate-900 dark:text-white">
//             <Footer name={data.name} />
//         </div>
//     </div>
// )

// const GlassLayout = ({ data, accent, openProject }: any) => (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans relative overflow-x-hidden">
//         <div className="fixed top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
//         <div className="fixed bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

//         <div className="container mx-auto px-6 py-20 relative z-10">
//             <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-16 shadow-2xl">
//                 <div className="flex flex-col md:flex-row gap-10 items-center mb-16 border-b border-white/10 pb-10">
//                     {data.photo && (
//                         <img
//                             src={data.photo}
//                             className="w-48 h-48 rounded-2xl object-cover shadow-lg border-2 border-white/30"
//                         />
//                     )}
//                     <div>
//                         <h1 className="text-5xl font-bold mb-2 text-white">
//                             {data.name}
//                         </h1>
//                         <p className="text-2xl opacity-80 mb-4 font-light text-indigo-200">
//                             {data.role}
//                         </p>
//                         <p className="opacity-90 leading-relaxed max-w-lg text-white">
//                             {data.bio}
//                         </p>
//                         <div className="mt-6 flex flex-col items-start">
//                             <ContactActions data={data} accent={accent} />
//                             <div className="mt-4 flex flex-col gap-2">
//                                 <Socials data={data} dark={true} />
//                                 <FreelancePlatforms data={data} dark={true} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     isDark={true}
//                 />
//             </div>
//             <Footer name={data.name} isDark={true} />
//         </div>
//     </div>
// )

// const MagazineLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-[#fcfbf7] dark:bg-[#1a1a1a] text-[#1a1a1a] dark:text-[#fcfbf7] min-h-screen font-serif transition-colors">
//         <header className="border-b-4 border-black dark:border-white py-12 px-6">
//             <div className="container mx-auto flex flex-col items-center">
//                 <h1 className="text-6xl md:text-9xl font-black text-center uppercase tracking-tighter leading-none">
//                     {data.name}
//                 </h1>
//                 <div className="flex items-center gap-4 mt-6 w-full max-w-4xl">
//                     <div className="h-px bg-black dark:bg-white flex-1"></div>
//                     <span className="font-sans font-bold uppercase tracking-widest text-sm">
//                         {data.role}
//                     </span>
//                     <div className="h-px bg-black dark:bg-white flex-1"></div>
//                 </div>
//             </div>
//         </header>
//         <div className="container mx-auto px-6 py-16 grid md:grid-cols-12 gap-12">
//             <div className="md:col-span-4 font-sans">
//                 {data.photo && (
//                     <img
//                         src={data.photo}
//                         className="w-full grayscale contrast-125 mb-8 border-2 border-black dark:border-white"
//                     />
//                 )}
//                 <p className="text-lg leading-relaxed mb-8 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-6px]">
//                     {data.bio}
//                 </p>
//                 <div className="flex flex-col">
//                     <ContactActions data={data} accent={accent} />
//                     <div className="mt-6 flex flex-col gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </div>
//             <div className="md:col-span-8 border-l border-black/10 dark:border-white/10 pl-8 font-sans">
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// const BentoLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-800">
//                 {data.photo && (
//                     <img
//                         src={data.photo}
//                         className="w-32 h-32 rounded-full object-cover bg-slate-100"
//                     />
//                 )}
//                 <div className="flex-1 text-center md:text-left">
//                     <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">
//                         {data.name}
//                     </h1>
//                     <p className="text-xl text-slate-500 mb-4">{data.role}</p>
//                     <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
//                         {data.bio}
//                     </p>
//                     <div className="mt-6 flex flex-col items-center md:items-start">
//                         <ContactActions data={data} accent={accent} />
//                         <div className="mt-4 flex flex-col gap-2">
//                             <Socials data={data} />
//                             <FreelancePlatforms data={data} />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
//                 <div className="text-6xl font-black mb-2">
//                     {data.projects?.length || 0}
//                 </div>
//                 <div className="text-sm uppercase tracking-widest opacity-60">
//                     Proyectos Realizados
//                 </div>
//             </div>
//             <div className="md:col-span-3">
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     gridMode={true}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// const SwissLayout = ({ data, accent, openProject }: any) => (
//     <div
//         className="bg-white dark:bg-slate-900 min-h-screen font-sans text-black dark:text-white pt-10 px-6 border-t-[20px]"
//         style={{ borderColor: accent }}
//     >
//         <div className="container mx-auto grid md:grid-cols-2 gap-20">
//             <div className="sticky top-20 h-fit">
//                 <h1 className="text-7xl font-bold leading-none mb-6 tracking-tight">
//                     {data.name.split(' ')[0]}
//                     <br />
//                     {data.name.split(' ').slice(1).join(' ')}
//                 </h1>
//                 <div className="w-20 h-2 bg-black dark:bg-white mb-6"></div>
//                 <p className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">
//                     {data.role}
//                 </p>
//                 <p className="text-lg max-w-sm mb-10 text-slate-600 dark:text-slate-400">
//                     {data.bio}
//                 </p>
//                 <div className="flex flex-col items-start">
//                     <ContactActions data={data} accent={accent} />
//                     <div className="mt-6 flex flex-col gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </div>
//             <div>
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// const StudioLayout = ({ data, accent, openProject }: any) => (
//     <div className="bg-zinc-900 text-white min-h-screen font-sans">
//         <div className="container mx-auto px-6 py-32 grid md:grid-cols-2 gap-20">
//             <div>
//                 <h1 className="text-6xl font-light mb-6 tracking-wide">
//                     {data.name}
//                 </h1>
//                 <p className="text-zinc-400 text-xl mb-12">{data.role}</p>
//                 <div className="border-l-2 border-white/20 pl-6 py-2 mb-12">
//                     <p className="text-lg leading-relaxed text-zinc-300">
//                         {data.bio}
//                     </p>
//                 </div>
//                 <div className="flex flex-col items-start">
//                     <ContactActions data={data} accent={accent} />
//                     <div className="mt-6 flex flex-col gap-2">
//                         <Socials data={data} dark={true} />
//                         <FreelancePlatforms data={data} dark={true} />
//                     </div>
//                 </div>
//             </div>
//             <div className="flex items-center justify-center bg-zinc-800 rounded-lg overflow-hidden h-[500px]">
//                 {data.photo ? (
//                     <img
//                         src={data.photo}
//                         className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
//                     />
//                 ) : (
//                     <div className="text-zinc-600">IMAGEN DE ESTUDIO</div>
//                 )}
//             </div>
//         </div>
//         <div className="bg-zinc-950 py-20">
//             <div className="container mx-auto px-6">
//                 <SharedSections
//                     data={data}
//                     accent={accent}
//                     openProject={openProject}
//                     isDark={true}
//                 />
//             </div>
//         </div>
//         <Footer name={data.name} isDark={true} />
//     </div>
// )

// const VibrantLayout = ({ data, accent, openProject }: any) => (
//     <div className="min-h-screen bg-indigo-900 text-indigo-50 font-sans">
//         <div className="bg-indigo-600 p-16 md:p-32 text-center rounded-b-[3rem] shadow-2xl mb-20 relative overflow-hidden">
//             <div className="relative z-10">
//                 {data.photo && (
//                     <img
//                         src={data.photo}
//                         className="w-40 h-40 rounded-full mx-auto mb-8 border-8 border-indigo-500/50 shadow-2xl"
//                         alt="Profile"
//                     />
//                 )}
//                 <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
//                     {data.name}
//                 </h1>
//                 <span className="inline-block px-6 py-2 rounded-full bg-indigo-800 text-indigo-200 text-sm font-bold tracking-widest uppercase shadow-inner">
//                     {data.role}
//                 </span>
//                 <div className="mt-8 flex flex-col items-center">
//                     <ContactActions data={data} accent="#fbbf24" />
//                     <div className="mt-6 flex flex-col items-center gap-2">
//                         <Socials data={data} dark={true} />
//                         <FreelancePlatforms data={data} dark={true} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <div className="container mx-auto px-6 max-w-5xl pb-20">
//             <SharedSections
//                 data={data}
//                 accent="#fbbf24"
//                 openProject={openProject}
//                 isDark={true}
//             />
//         </div>
//         <Footer name={data.name} isDark={true} />
//     </div>
// )

// const PastelLayout = ({ data, accent, openProject }: any) => (
//     <div className="min-h-screen bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100 font-sans p-6">
//         <div className="max-w-5xl mx-auto bg-white dark:bg-rose-900 rounded-[2rem] p-10 md:p-20 shadow-xl mt-10">
//             <header className="text-center mb-16">
//                 {data.photo && (
//                     <img
//                         src={data.photo}
//                         className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-rose-200"
//                     />
//                 )}
//                 <h1 className="text-5xl font-bold mb-4 text-rose-500 dark:text-rose-300">
//                     {data.name}
//                 </h1>
//                 <p className="text-xl text-rose-400 mb-6">{data.role}</p>
//                 <p className="max-w-xl mx-auto text-slate-500 dark:text-rose-200">
//                     {data.bio}
//                 </p>
//                 <div className="mt-8 flex flex-col items-center">
//                     <ContactActions data={data} accent="#f43f5e" />
//                     <div className="mt-6 flex flex-col items-center gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </header>
//             <SharedSections
//                 data={data}
//                 accent="#f43f5e"
//                 openProject={openProject}
//             />
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// const NatureLayout = ({ data, accent, openProject }: any) => (
//     <div className="min-h-screen bg-[#f1f8f5] dark:bg-[#0f1f1a] text-[#1a2f26] dark:text-[#e0f2eb] font-sans transition-colors">
//         <header className="container mx-auto px-6 py-20 grid md:grid-cols-2 items-center">
//             <div className="order-2 md:order-1">
//                 <h1 className="text-6xl font-bold mb-4 text-green-900 dark:text-green-300">
//                     {data.name}
//                 </h1>
//                 <div className="h-2 w-20 bg-green-500 mb-6 rounded-full"></div>
//                 <p className="text-2xl mb-6 text-green-700 dark:text-green-400">
//                     {data.role}
//                 </p>
//                 <p className="text-lg text-green-800/70 dark:text-green-200/70 mb-8 leading-relaxed">
//                     {data.bio}
//                 </p>
//                 <div className="flex flex-col items-start">
//                     <ContactActions data={data} accent="#22c55e" />
//                     <div className="mt-6 flex flex-col gap-2">
//                         <Socials data={data} />
//                         <FreelancePlatforms data={data} />
//                     </div>
//                 </div>
//             </div>
//             <div className="flex justify-center order-1 md:order-2 mb-10 md:mb-0">
//                 {data.photo ? (
//                     <img
//                         src={data.photo}
//                         className="w-80 h-96 object-cover rounded-t-[10rem] rounded-b-3xl border-4 border-green-200 dark:border-green-800 shadow-xl"
//                     />
//                 ) : (
//                     <div className="w-80 h-96 bg-green-200 rounded-t-[10rem] flex items-center justify-center text-green-700">
//                         Foto
//                     </div>
//                 )}
//             </div>
//         </header>
//         <div className="container mx-auto px-6 max-w-6xl pb-20">
//             <SharedSections
//                 data={data}
//                 accent="#22c55e"
//                 openProject={openProject}
//             />
//         </div>
//         <Footer name={data.name} />
//     </div>
// )

// // --- MAIN WRAPPER (ENRUTADOR) ---
// export const PublicPortfolioViewer = ({ userId }: { userId: string }) => {
//     const [data, setData] = useState<any>(null)
//     const [selectedProject, setSelectedProject] = useState<any>(null)
//     const [isDark, setIsDark] = useState(false)

//     useEffect(() => {
//         const fetchPortfolio = async () => {
//             try {
//                 const docRef = doc(
//                     db,
//                     'users',
//                     userId,
//                     'portfolio',
//                     'site_config'
//                 )
//                 const snap = await getDoc(docRef)
//                 if (snap.exists()) {
//                     const d = snap.data()
//                     setData(d)
//                     if (
//                         [
//                             'minimal_dark',
//                             'terminal',
//                             'cyber',
//                             'studio',
//                             'vibrant',
//                         ].includes(d.layoutId)
//                     )
//                         setIsDark(true)
//                 }
//             } catch (e) {
//                 console.error(e)
//             }
//         }
//         fetchPortfolio()
//     }, [userId])

//     if (!data)
//         return (
//             <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
//                 Cargando...
//             </div>
//         )

//     const accent = data.color || '#16a34a'
//     const LayoutComponent =
//         {
//             classic: ClassicLayout,
//             split: SplitLayout,
//             grid: GridLayout,
//             minimal_dark: MinimalDarkLayout,
//             terminal: TerminalLayout,
//             neo: NeoLayout,
//             glass: GlassLayout,
//             magazine: MagazineLayout,
//             bento: BentoLayout,
//             swiss: SwissLayout,
//             studio: StudioLayout,
//             vibrant: VibrantLayout,
//             pastel: PastelLayout,
//             nature: NatureLayout,
//         }[data.layoutId] || ClassicLayout

//     return (
//         <div className={isDark ? 'dark' : ''}>
//             <div
//                 className={`min-h-screen transition-colors duration-300 ${
//                     isDark
//                         ? 'bg-slate-950 text-slate-100'
//                         : 'bg-white text-slate-900'
//                 }`}
//             >
//                 <button
//                     onClick={() => setIsDark(!isDark)}
//                     className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur hover:bg-black/20 dark:hover:bg-white/20 transition-colors border border-current/10"
//                 >
//                     {isDark ? (
//                         <Sun className="w-5 h-5 text-yellow-400" />
//                     ) : (
//                         <Moon className="w-5 h-5 text-slate-700" />
//                     )}
//                 </button>

//                 <LayoutComponent
//                     data={data}
//                     accent={accent}
//                     openProject={setSelectedProject}
//                 />

//                 {/* MODAL PROYECTO (CORREGIDO Y MEJORADO) */}
//                 <AnimatePresence>
//                     {selectedProject && (
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex justify-center items-center p-4 md:p-8"
//                             onClick={() => setSelectedProject(null)}
//                         >
//                             <div
//                                 className="relative w-full max-w-6xl bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
//                                 onClick={(e) => e.stopPropagation()}
//                             >
//                                 <button
//                                     onClick={() => setSelectedProject(null)}
//                                     className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full hover:bg-white hover:text-black transition-colors border border-white/20"
//                                 >
//                                     <X className="w-5 h-5" />
//                                 </button>

//                                 {/* GALERÍA (IZQUIERDA) - IMÁGENES/VIDEO */}
//                                 <div className="md:w-7/12 bg-black overflow-y-auto no-scrollbar">
//                                     <div className="p-4 space-y-4">
//                                         {selectedProject.cover && (
//                                             <img
//                                                 src={selectedProject.cover}
//                                                 className="w-full rounded-xl shadow-lg border border-slate-800"
//                                                 alt="Portada"
//                                             />
//                                         )}

//                                         {selectedProject.gallery?.map(
//                                             (item: any, i: number) => {
//                                                 // Solo renderizamos multimedia visual aquí
//                                                 if (
//                                                     item.type?.includes('video')
//                                                 ) {
//                                                     return (
//                                                         <div
//                                                             key={i}
//                                                             className="relative rounded-xl overflow-hidden shadow-lg border border-slate-800"
//                                                         >
//                                                             <video
//                                                                 src={item.url}
//                                                                 controls
//                                                                 className="w-full"
//                                                             />
//                                                         </div>
//                                                     )
//                                                 } else if (
//                                                     !item.type?.includes(
//                                                         'pdf'
//                                                     ) &&
//                                                     !item.type?.includes(
//                                                         'application'
//                                                     )
//                                                 ) {
//                                                     return (
//                                                         <img
//                                                             key={i}
//                                                             src={item.url}
//                                                             className="w-full rounded-xl object-cover"
//                                                             alt="Galería"
//                                                         />
//                                                     )
//                                                 }
//                                                 return null
//                                             }
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* INFO (DERECHA) - TEXTO + DOCUMENTOS */}
//                                 <div className="md:w-5/12 bg-slate-900 border-l border-slate-800 flex flex-col">
//                                     <div className="p-8 md:p-10 overflow-y-auto no-scrollbar flex-1">
//                                         <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-white">
//                                             {selectedProject.title}
//                                         </h2>

//                                         <div className="flex flex-wrap gap-2 mb-8">
//                                             {selectedProject.tags
//                                                 ?.split(',')
//                                                 .map(
//                                                     (
//                                                         t: string,
//                                                         idx: number
//                                                     ) => (
//                                                         <span
//                                                             key={idx}
//                                                             className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300"
//                                                         >
//                                                             {t.trim()}
//                                                         </span>
//                                                     )
//                                                 )}
//                                         </div>

//                                         <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap mb-10">
//                                             {selectedProject.desc}
//                                         </div>

//                                         {/* DOCUMENTOS ADJUNTOS (AQUÍ SEPARADOS) */}
//                                         {selectedProject.documents &&
//                                             selectedProject.documents.length >
//                                                 0 && (
//                                                 <div className="mt-8 pt-8 border-t border-slate-800">
//                                                     <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">
//                                                         Documentos Adjuntos
//                                                     </h4>
//                                                     <div className="space-y-3">
//                                                         {selectedProject.documents.map(
//                                                             (
//                                                                 doc: any,
//                                                                 i: number
//                                                             ) => (
//                                                                 <button
//                                                                     key={i}
//                                                                     onClick={() =>
//                                                                         forceDownload(
//                                                                             doc.url,
//                                                                             doc.name
//                                                                         )
//                                                                     }
//                                                                     className="flex items-center gap-3 p-3 w-full text-left bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all group"
//                                                                 >
//                                                                     <div className="p-2 bg-slate-900 rounded border border-slate-700 group-hover:border-blue-500/50 transition-colors">
//                                                                         <FileText className="w-5 h-5 text-blue-400" />
//                                                                     </div>
//                                                                     <div className="flex-1 overflow-hidden">
//                                                                         <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-300 transition-colors">
//                                                                             {
//                                                                                 doc.name
//                                                                             }
//                                                                         </p>
//                                                                         <p className="text-[10px] text-slate-500">
//                                                                             Clic
//                                                                             para
//                                                                             descargar
//                                                                         </p>
//                                                                     </div>
//                                                                     <Download className="w-4 h-4 text-slate-600 group-hover:text-white" />
//                                                                 </button>
//                                                             )
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             )}
//                                     </div>

//                                     {selectedProject.link && (
//                                         <div className="p-6 border-t border-slate-800 bg-slate-900 z-10">
//                                             <a
//                                                 href={
//                                                     selectedProject.link.startsWith(
//                                                         'http'
//                                                     )
//                                                         ? selectedProject.link
//                                                         : `https://${selectedProject.link}`
//                                                 }
//                                                 target="_blank"
//                                                 rel="noreferrer"
//                                                 className="flex w-full items-center justify-center gap-2 bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg"
//                                             >
//                                                 Visitar Proyecto{' '}
//                                                 <ExternalLink className="w-4 h-4" />
//                                             </a>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <style>{`
//                     .no-scrollbar::-webkit-scrollbar { display: none; }
//                     .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//                 `}</style>
//             </div>
//         </div>
//     )
// }

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mail,
    ArrowRight,
    Briefcase,
    GraduationCap,
    Code,
    MessageCircle,
    X,
    ExternalLink,
    FileText,
    Moon,
    Sun,
    PlayCircle,
    Zap,
    Linkedin,
    Twitter,
    Instagram,
    Github,
    Globe,
    Youtube,
    Facebook,
    Monitor,
    Download,
} from 'lucide-react'

// --- UTILIDAD DE DESCARGA ---
const forceDownload = async (url: string, filename: string) => {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename || 'archivo'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
        window.open(url, '_blank')
    }
}

// --- COMPONENTE 1: REDES SOCIALES (ICONOS) ---
const Socials = ({ data, dark = false }: any) => {
    const links = [
        {
            url: data.linkedin,
            icon: <Linkedin className="w-5 h-5" />,
            label: 'LinkedIn',
        },
        {
            url: data.instagram,
            icon: <Instagram className="w-5 h-5" />,
            label: 'Instagram',
        },
        {
            url: data.twitter,
            icon: <Twitter className="w-5 h-5" />,
            label: 'Twitter',
        },
        {
            url: data.github,
            icon: <Github className="w-5 h-5" />,
            label: 'GitHub',
        },
        {
            url: data.behance,
            icon: <Globe className="w-5 h-5" />,
            label: 'Behance',
        },
        {
            url: data.youtube,
            icon: <Youtube className="w-5 h-5" />,
            label: 'YouTube',
        },
        {
            url: data.facebook,
            icon: <Facebook className="w-5 h-5" />,
            label: 'Facebook',
        },
        {
            url: data.twitch,
            icon: <MessageCircle className="w-5 h-5" />,
            label: 'Twitch',
        },
        { url: data.kick, icon: <Zap className="w-5 h-5" />, label: 'Kick' },
        {
            url: data.patreon,
            icon: <span className="font-bold text-lg">$</span>,
            label: 'Patreon',
        },
    ].filter((l) => l.url && l.url.length > 3)

    if (links.length === 0) return null

    return (
        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {links.map((l, i) => (
                <a
                    key={i}
                    href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-3 rounded-full border transition-colors ${
                        dark
                            ? 'border-white/20 hover:bg-white/10 text-white'
                            : 'border-black/10 hover:bg-black/5 text-slate-700 dark:text-slate-200 dark:border-white/20 dark:hover:bg-white/10'
                    }`}
                    title={l.label}
                >
                    {l.icon}
                </a>
            ))}
        </div>
    )
}

// --- COMPONENTE 2: PLATAFORMAS FREELANCE (BOTONES) ---
const FreelancePlatforms = ({ data, dark = false }: any) => {
    const links = [
        {
            url: data.upwork,
            icon: <Briefcase className="w-4 h-4" />,
            label: 'Upwork',
        },
        {
            url: data.freelancer,
            icon: <Monitor className="w-4 h-4" />,
            label: 'Freelancer',
        },
        {
            url: data.workana,
            icon: <Globe className="w-4 h-4" />,
            label: 'Workana',
        },
        {
            url: data.fiverr,
            icon: <span className="font-bold text-xs">Fi</span>,
            label: 'Fiverr',
        },
    ].filter((l) => l.url && l.url.length > 3)

    if (links.length === 0) return null

    return (
        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {links.map((l, i) => (
                <a
                    key={i}
                    href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-colors ${
                        dark
                            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {l.icon} {l.label}
                </a>
            ))}
        </div>
    )
}

// --- COMPONENTE: ACCIONES DE CONTACTO ---
const ContactActions = ({ data, accent, style = 'default' }: any) => {
    const btnBase =
        'px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 justify-center cursor-pointer'
    const whatsappLink = data.whatsapp
        ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`
        : null

    if (style === 'neo') {
        return (
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <a
                    href={`mailto:${data.email}`}
                    className={`${btnBase} border-4 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
                    style={{ backgroundColor: accent }}
                >
                    <Mail className="w-5 h-5" /> Email
                </a>
                {whatsappLink && (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`${btnBase} border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}
                    >
                        <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>
                )}
            </div>
        )
    }
    if (style === 'terminal') {
        return (
            <div className="flex flex-wrap gap-4 mt-8 font-mono justify-center md:justify-start">
                <a
                    href={`mailto:${data.email}`}
                    className="text-green-400 hover:bg-green-400/20 px-4 py-2 border border-green-400 rounded-sm w-full md:w-auto text-center"
                >
                    {'>'} ./enviar_email.exe
                </a>
                {whatsappLink && (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-400 hover:bg-green-400/20 px-4 py-2 border border-green-400 rounded-sm w-full md:w-auto text-center"
                    >
                        {'>'} ./abrir_whatsapp.sh
                    </a>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
            <a
                href={`mailto:${data.email}`}
                className={`${btnBase} text-white shadow-lg hover:scale-105 hover:shadow-xl`}
                style={{ backgroundColor: accent }}
            >
                <Mail className="w-5 h-5" /> Contáctame
            </a>
            {whatsappLink && (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`${btnBase} border-2 border-current bg-transparent hover:bg-current/10 dark:text-white`}
                >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                </a>
            )}
        </div>
    )
}

// --- FOOTER ---
const Footer = ({ name, isDark }: any) => (
    <footer
        className={`py-12 text-center text-sm border-t mt-auto w-full relative z-10 ${
            isDark
                ? 'border-white/10 text-slate-400'
                : 'border-black/10 text-slate-500 dark:border-white/10 dark:text-slate-400'
        }`}
    >
        <p className="font-medium">
            &copy; {new Date().getFullYear()} {name}. Todos los derechos
            reservados.
        </p>
        <a
            href="https://modofreelanceos.com"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 hover:text-brand-500 transition-colors font-bold"
        >
            <Zap className="w-3 h-3" /> Potenciado por ModoFreelanceOS
        </a>
    </footer>
)

// --- SECCIONES COMPARTIDAS (PROJECTS + CV) ---
const SharedSections = ({
    data,
    accent,
    openProject,
    gridMode,
    isDark,
}: any) => (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 w-full">
        {data.projects && data.projects.length > 0 && (
            <section>
                <h3
                    className={`text-2xl font-bold mb-10 flex items-center gap-3 opacity-90 border-b pb-4 ${
                        isDark
                            ? 'text-white border-white/20'
                            : 'text-slate-900 border-black/10 dark:text-white dark:border-white/20'
                    }`}
                >
                    <Briefcase className="w-6 h-6" /> Proyectos
                </h3>
                <div
                    className={`grid gap-8 ${
                        gridMode
                            ? 'md:grid-cols-2 lg:grid-cols-3'
                            : 'md:grid-cols-2'
                    }`}
                >
                    {data.projects.map((p: any, i: number) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            onClick={() => openProject(p)}
                            className={`group cursor-pointer rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all ${
                                isDark
                                    ? 'border-white/10 bg-white/5'
                                    : 'border-black/10 bg-white dark:border-white/10 dark:bg-white/5'
                            }`}
                        >
                            <div
                                className={`aspect-[4/3] relative overflow-hidden ${
                                    isDark
                                        ? 'bg-gray-800'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                            >
                                {p.cover ? (
                                    <img
                                        src={p.cover}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={p.title}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-50 text-slate-500">
                                        Sin Imagen
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-bold border-2 border-white px-6 py-2 rounded-full">
                                        Ver Detalles
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4
                                    className={`text-xl font-bold mb-2 transition-colors line-clamp-1 ${
                                        isDark
                                            ? 'text-white group-hover:text-brand-400'
                                            : 'text-slate-900 group-hover:text-brand-600 dark:text-white'
                                    }`}
                                >
                                    {p.title}
                                </h4>
                                <p
                                    className={`text-sm line-clamp-2 mb-4 ${
                                        isDark
                                            ? 'text-slate-400'
                                            : 'text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {p.desc}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {p.tags
                                        ?.split(',')
                                        .map((t: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className={`text-[10px] px-2 py-1 rounded font-bold uppercase opacity-70 ${
                                                    isDark
                                                        ? 'bg-white/10 text-white'
                                                        : 'bg-black/10 text-black dark:bg-white/10 dark:text-white'
                                                }`}
                                            >
                                                {t.trim()}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        )}

        <div className="grid md:grid-cols-2 gap-16">
            {data.experience && data.experience.length > 0 && (
                <section>
                    <h3
                        className={`text-xl font-bold mb-8 flex items-center gap-3 opacity-90 ${
                            isDark
                                ? 'text-white'
                                : 'text-slate-900 dark:text-white'
                        }`}
                    >
                        <Code className="w-5 h-5" /> Experiencia
                    </h3>
                    <div
                        className={`space-y-10 border-l-2 pl-8 ml-2 ${
                            isDark
                                ? 'border-white/20'
                                : 'border-black/10 dark:border-white/20'
                        }`}
                    >
                        {data.experience.map((e: any, i: number) => (
                            <div key={i} className="relative">
                                <span
                                    className={`absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 box-content ${
                                        isDark
                                            ? 'border-slate-950 bg-slate-400'
                                            : 'border-white bg-slate-600 dark:border-slate-950 dark:bg-slate-400'
                                    }`}
                                ></span>
                                <h4
                                    className={`font-bold text-lg ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-slate-900 dark:text-white'
                                    }`}
                                >
                                    {e.role}
                                </h4>
                                <p
                                    className={`text-sm mb-3 font-medium ${
                                        isDark
                                            ? 'text-slate-400'
                                            : 'text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    {e.company} • {e.year}
                                </p>
                                <p
                                    className={`text-sm leading-relaxed ${
                                        isDark
                                            ? 'text-slate-300'
                                            : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    {e.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                {data.education && data.education.length > 0 && (
                    <div className="mb-12">
                        <h3
                            className={`text-xl font-bold mb-8 flex items-center gap-3 opacity-90 ${
                                isDark
                                    ? 'text-white'
                                    : 'text-slate-900 dark:text-white'
                            }`}
                        >
                            <GraduationCap className="w-5 h-5" /> Educación
                        </h3>
                        <div className="space-y-4">
                            {data.education.map((e: any, i: number) => (
                                <div
                                    key={i}
                                    className={`p-6 rounded-xl border ${
                                        isDark
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10'
                                    }`}
                                >
                                    <h4
                                        className={`font-bold text-base ${
                                            isDark
                                                ? 'text-white'
                                                : 'text-slate-900 dark:text-white'
                                        }`}
                                    >
                                        {e.degree}
                                    </h4>
                                    <p
                                        className={`text-sm ${
                                            isDark
                                                ? 'text-slate-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {e.school} • {e.year}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {data.skills && (
                    <div>
                        <h3
                            className={`text-xl font-bold mb-6 flex items-center gap-3 opacity-90 ${
                                isDark
                                    ? 'text-white'
                                    : 'text-slate-900 dark:text-white'
                            }`}
                        >
                            Habilidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills
                                .split(',')
                                .map((s: string, i: number) => (
                                    <span
                                        key={i}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                                            isDark
                                                ? 'bg-white/10 text-white'
                                                : 'bg-black/10 text-black dark:bg-white/10 dark:text-white'
                                        }`}
                                    >
                                        {s.trim()}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    </div>
)

// --- LAYOUTS (CON CORRECCIONES DARK MODE) ---

const ClassicLayout = ({ data, accent, openProject }: any) => (
    <div className="container mx-auto px-6 py-20 max-w-4xl min-h-screen flex flex-col">
        <header className="text-center mb-16">
            {data.photo && (
                <img
                    src={data.photo}
                    className="w-48 h-48 rounded-full mx-auto mb-8 object-cover border-4 shadow-xl border-white dark:border-slate-800"
                    alt="Profile"
                />
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white">
                {data.name}
            </h1>
            <p
                className="text-xl opacity-60 mb-8 font-medium uppercase tracking-widest"
                style={{ color: accent }}
            >
                {data.role}
            </p>
            <p className="max-w-2xl mx-auto opacity-80 leading-relaxed mb-10 text-lg text-slate-700 dark:text-slate-300">
                {data.bio}
            </p>
            <div className="flex flex-col items-center">
                <ContactActions data={data} accent={accent} />
                <div className="flex flex-col items-center gap-2 mt-6">
                    <Socials data={data} />
                    <FreelancePlatforms data={data} />
                </div>
            </div>
        </header>
        <SharedSections data={data} accent={accent} openProject={openProject} />
        <Footer name={data.name} isDark={false} />
    </div>
)

const SplitLayout = ({ data, accent, openProject }: any) => (
    <div className="lg:flex min-h-screen">
        <div
            className="
    lg:w-[40%] p-12 lg:fixed lg:h-screen flex flex-col justify-center
    bg-slate-100 dark:bg-slate-900
    border-r border-slate-200 dark:border-slate-800
    z-10
    text-slate-800 dark:text-white
    [&_svg]:text-slate-700 dark:[&_svg]:text-white
    [&_a]:text-slate-700 dark:[&_a]:text-white
  "
        >
            <div>
                {data.photo && (
                    <img
                        src={data.photo}
                        className="w-32 h-32 rounded-full mb-8 object-cover shadow-lg border-4 border-white dark:border-slate-800"
                        alt="Profile"
                    />
                )}
                <h1 className="text-5xl font-black mb-4 leading-none tracking-tighter text-slate-900 dark:text-white">
                    {data.name}
                </h1>
                <p
                    className="text-xl font-mono mb-8 opacity-90"
                    style={{ color: accent }}
                >
                    {data.role}
                </p>
                <p className="opacity-80 leading-relaxed text-lg mb-8 text-slate-600 dark:text-slate-400">
                    {data.bio}
                </p>
                <ContactActions data={data} accent={accent} />
                <div className="mt-8 flex flex-col gap-2">
                    <Socials data={data} dark={true} />
                    <FreelancePlatforms data={data} dark={true} />
                </div>
            </div>
            <div className="mt-auto hidden lg:block pt-8">
                <Footer name={data.name} />
            </div>
        </div>
        <div
            className="lg:w-[60%] lg:ml-[40%] p-8 lg:p-24
    bg-white dark:bg-black
    text-slate-900 dark:text-white
    [&_svg]:text-slate-700 dark:[&_svg]:text-white"
        >
            <SharedSections
                data={data}
                accent={accent}
                openProject={openProject}
                isDark={true}
            />
            <div className="lg:hidden">
                <Footer name={data.name} isDark={true} />
            </div>
        </div>
    </div>
)

const GridLayout = ({ data, accent, openProject }: any) => (
    <div className="min-h-screen pb-10">
        <header className="py-32 px-6 text-center bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden mb-12">
            <div className="relative z-10 container mx-auto">
                <h2 className="text-6xl font-bold mb-4 text-slate-900 dark:text-white">
                    {data.name}
                </h2>
                <p
                    className="text-2xl font-light mb-8"
                    style={{ color: accent }}
                >
                    {data.role}
                </p>
                <p className="max-w-2xl mx-auto opacity-70 mb-8 text-slate-600 dark:text-slate-300">
                    {data.bio}
                </p>
                <div className="flex flex-col items-center">
                    <ContactActions data={data} accent={accent} />
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </div>
        </header>
        <div className="container mx-auto px-6 max-w-7xl">
            <SharedSections
                data={data}
                accent={accent}
                openProject={openProject}
                gridMode={true}
            />
        </div>
        <Footer name={data.name} />
    </div>
)

const MinimalDarkLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-black text-gray-300 min-h-screen font-mono p-6 md:p-20">
        <div className="max-w-5xl mx-auto border-l border-gray-800 pl-8 md:pl-16 relative">
            <div
                className="absolute left-0 top-0 w-1 h-20"
                style={{ backgroundColor: accent }}
            ></div>
            <p className="text-sm mb-6 text-gray-500 tracking-widest">
                {'<Developer />'}
            </p>
            <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-none">
                {data.name}
            </h1>
            <p className="text-xl mb-8 max-w-2xl" style={{ color: accent }}>
                // {data.role}
            </p>
            <p className="text-lg text-gray-400 mb-10 max-w-xl">{data.bio}</p>
            <ContactActions data={data} accent={accent} style="terminal" />
            <div className="mt-6 flex flex-col items-start gap-2">
                <Socials data={data} dark={true} />
                <FreelancePlatforms data={data} dark={true} />
            </div>
            <div className="mt-20">
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    isDark={true}
                />
            </div>
        </div>
        <Footer name={data.name} isDark={true} />
    </div>
)

const TerminalLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-[#0d1117] text-[#00ff41] min-h-screen font-mono p-4 flex flex-col">
        <div className="max-w-4xl mx-auto border border-[#30363d] rounded-lg bg-[#010409] p-6 md:p-10 shadow-2xl mt-10 w-full flex-1">
            <div className="flex gap-2 mb-8 border-b border-[#30363d] pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-xs text-gray-500">bash — 80x24</span>
            </div>
            <p className="mb-4 text-gray-400">
                Last login: {new Date().toDateString()}
            </p>
            <h1 className="text-4xl font-bold mb-6 text-white">{data.name}</h1>
            <p className="text-xl mb-6 text-green-300">{data.role}</p>
            <p className="opacity-80 mb-8 max-w-2xl text-gray-300">
                {data.bio}
            </p>
            <ContactActions data={data} accent={accent} style="terminal" />
            <div className="mt-6 flex flex-col items-start gap-2">
                <Socials data={data} dark={true} />
                <FreelancePlatforms data={data} dark={true} />
            </div>
            <div className="mt-16 border-t border-[#30363d] pt-8">
                <p className="mb-6">
                    <span className="text-blue-400">~</span> $ ls ./projects
                </p>
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    isDark={true}
                />
            </div>
        </div>
        <Footer name={data.name} isDark={true} />
    </div>
)

const NeoLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-[#e0e7ff] dark:bg-slate-950 min-h-screen font-sans text-black p-4">
        <div className="container mx-auto max-w-5xl bg-white dark:bg-slate-100 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-16 mt-10 rounded-none">
            <header className="mb-16">
                <h1
                    className="text-6xl md:text-8xl font-black uppercase mb-4 leading-none text-black"
                    style={{ textShadow: `4px 4px 0px ${accent}` }}
                >
                    {data.name}
                </h1>
                <div className="bg-black text-white inline-block px-4 py-2 font-bold text-xl uppercase transform -rotate-2">
                    {data.role}
                </div>
                <p className="text-xl font-bold mt-8 border-l-8 border-black pl-6 max-w-2xl text-black">
                    {data.bio}
                </p>
                <div className="mt-8 flex flex-col items-start">
                    <ContactActions data={data} accent={accent} style="neo" />
                    <div className="mt-4 flex flex-col gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </header>
            <div className="border-t-4 border-black pt-10">
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    gridMode={true}
                />
            </div>
        </div>
        <div className="text-slate-900 dark:text-white">
            <Footer name={data.name} />
        </div>
    </div>
)

const GlassLayout = ({ data, accent, openProject }: any) => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans relative overflow-x-hidden">
        <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-16 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-10 items-center mb-16 border-b border-white/10 pb-10">
                    {data.photo && (
                        <img
                            src={data.photo}
                            className="w-48 h-48 rounded-2xl object-cover shadow-lg border-2 border-white/30"
                        />
                    )}
                    <div>
                        <h1 className="text-5xl font-bold mb-2 text-white">
                            {data.name}
                        </h1>
                        <p className="text-2xl opacity-80 mb-4 font-light text-indigo-200">
                            {data.role}
                        </p>
                        <p className="opacity-90 leading-relaxed max-w-lg text-white">
                            {data.bio}
                        </p>
                        <div className="mt-6 flex flex-col items-start">
                            <ContactActions data={data} accent={accent} />
                            <div className="mt-4 flex flex-col gap-2">
                                <Socials data={data} dark={true} />
                                <FreelancePlatforms data={data} dark={true} />
                            </div>
                        </div>
                    </div>
                </div>
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    isDark={true}
                />
            </div>
            <Footer name={data.name} isDark={true} />
        </div>
    </div>
)

const MagazineLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-[#fcfbf7] dark:bg-stone-950 text-[#1a1a1a] dark:text-stone-100 min-h-screen font-serif transition-colors">
        <header className="border-b-4 border-black dark:border-stone-100 py-12 px-6">
            <div className="container mx-auto flex flex-col items-center">
                <h1 className="text-6xl md:text-9xl font-black text-center uppercase tracking-tighter leading-none">
                    {data.name}
                </h1>
                <div className="flex items-center gap-4 mt-6 w-full max-w-4xl">
                    <div className="h-px bg-black dark:bg-stone-100 flex-1"></div>
                    <span className="font-sans font-bold uppercase tracking-widest text-sm">
                        {data.role}
                    </span>
                    <div className="h-px bg-black dark:bg-stone-100 flex-1"></div>
                </div>
            </div>
        </header>
        <div className="container mx-auto px-6 py-16 grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4 font-sans">
                {data.photo && (
                    <img
                        src={data.photo}
                        className="w-full grayscale contrast-125 mb-8 border-2 border-black dark:border-stone-100"
                    />
                )}
                <p className="text-lg leading-relaxed mb-8 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-6px]">
                    {data.bio}
                </p>
                <div className="flex flex-col">
                    <ContactActions data={data} accent={accent} />
                    <div className="mt-6 flex flex-col gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </div>
            <div className="md:col-span-8 border-l border-black/10 dark:border-white/10 pl-8 font-sans">
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                />
            </div>
        </div>
        <Footer name={data.name} />
    </div>
)

const BentoLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 border border-slate-200 dark:border-slate-800">
                {data.photo && (
                    <img
                        src={data.photo}
                        className="w-32 h-32 rounded-full object-cover bg-slate-100 dark:bg-slate-800"
                    />
                )}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">
                        {data.name}
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-4">
                        {data.role}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {data.bio}
                    </p>
                    <div className="mt-6 flex flex-col items-center md:items-start">
                        <ContactActions data={data} accent={accent} />
                        <div className="mt-4 flex flex-col gap-2">
                            <Socials data={data} />
                            <FreelancePlatforms data={data} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-6xl font-black mb-2">
                    {data.projects?.length || 0}
                </div>
                <div className="text-sm uppercase tracking-widest opacity-60">
                    Proyectos Realizados
                </div>
            </div>
            <div className="md:col-span-3">
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    gridMode={true}
                />
            </div>
        </div>
        <Footer name={data.name} />
    </div>
)

const SwissLayout = ({ data, accent, openProject }: any) => (
    <div
        className="bg-white dark:bg-slate-950 min-h-screen font-sans text-black dark:text-white pt-10 px-6 border-t-[20px]"
        style={{ borderColor: accent }}
    >
        <div className="container mx-auto grid md:grid-cols-2 gap-20">
            <div className="sticky top-20 h-fit">
                <h1 className="text-7xl font-bold leading-none mb-6 tracking-tight">
                    {data.name.split(' ')[0]}
                    <br />
                    {data.name.split(' ').slice(1).join(' ')}
                </h1>
                <div className="w-20 h-2 bg-black dark:bg-white mb-6"></div>
                <p className="text-2xl font-bold mb-8 text-slate-800 dark:text-slate-200">
                    {data.role}
                </p>
                <p className="text-lg max-w-sm mb-10 text-slate-600 dark:text-slate-400">
                    {data.bio}
                </p>
                <div className="flex flex-col items-start">
                    <ContactActions data={data} accent={accent} />
                    <div className="mt-6 flex flex-col gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </div>
            <div>
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                />
            </div>
        </div>
        <Footer name={data.name} />
    </div>
)

const StudioLayout = ({ data, accent, openProject }: any) => (
    <div className="bg-zinc-900 text-white min-h-screen font-sans">
        <div className="container mx-auto px-6 py-32 grid md:grid-cols-2 gap-20">
            <div>
                <h1 className="text-6xl font-light mb-6 tracking-wide">
                    {data.name}
                </h1>
                <p className="text-zinc-400 text-xl mb-12">{data.role}</p>
                <div className="border-l-2 border-white/20 pl-6 py-2 mb-12">
                    <p className="text-lg leading-relaxed text-zinc-300">
                        {data.bio}
                    </p>
                </div>
                <div className="flex flex-col items-start">
                    <ContactActions data={data} accent={accent} />
                    <div className="mt-6 flex flex-col gap-2">
                        <Socials data={data} dark={true} />
                        <FreelancePlatforms data={data} dark={true} />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center bg-zinc-800 rounded-lg overflow-hidden h-[500px]">
                {data.photo ? (
                    <img
                        src={data.photo}
                        className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-700"
                    />
                ) : (
                    <div className="text-zinc-600">IMAGEN DE ESTUDIO</div>
                )}
            </div>
        </div>
        <div className="bg-zinc-950 py-20">
            <div className="container mx-auto px-6">
                <SharedSections
                    data={data}
                    accent={accent}
                    openProject={openProject}
                    isDark={true}
                />
            </div>
        </div>
        <Footer name={data.name} isDark={true} />
    </div>
)

const VibrantLayout = ({ data, accent, openProject }: any) => (
    <div className="min-h-screen bg-indigo-900 text-indigo-50 font-sans">
        <div className="bg-indigo-600 p-16 md:p-32 text-center rounded-b-[3rem] shadow-2xl mb-20 relative overflow-hidden">
            <div className="relative z-10">
                {data.photo && (
                    <img
                        src={data.photo}
                        className="w-40 h-40 rounded-full mx-auto mb-8 border-8 border-indigo-500/50 shadow-2xl"
                        alt="Profile"
                    />
                )}
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
                    {data.name}
                </h1>
                <span className="inline-block px-6 py-2 rounded-full bg-indigo-800 text-indigo-200 text-sm font-bold tracking-widest uppercase shadow-inner">
                    {data.role}
                </span>
                <div className="mt-8 flex flex-col items-center">
                    <ContactActions data={data} accent="#fbbf24" />
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Socials data={data} dark={true} />
                        <FreelancePlatforms data={data} dark={true} />
                    </div>
                </div>
            </div>
        </div>
        <div className="container mx-auto px-6 max-w-5xl pb-20">
            <SharedSections
                data={data}
                accent="#fbbf24"
                openProject={openProject}
                isDark={true}
            />
        </div>
        <Footer name={data.name} isDark={true} />
    </div>
)

const PastelLayout = ({ data, accent, openProject }: any) => (
    <div className="min-h-screen bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100 font-sans p-6">
        <div className="max-w-5xl mx-auto bg-white dark:bg-rose-900/30 rounded-[2rem] p-10 md:p-20 shadow-xl mt-10 border border-rose-100 dark:border-rose-900">
            <header className="text-center mb-16">
                {data.photo && (
                    <img
                        src={data.photo}
                        className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-rose-200 dark:border-rose-800"
                    />
                )}
                <h1 className="text-5xl font-bold mb-4 text-rose-500 dark:text-rose-300">
                    {data.name}
                </h1>
                <p className="text-xl text-rose-400 mb-6">{data.role}</p>
                <p className="max-w-xl mx-auto text-slate-500 dark:text-rose-200/70">
                    {data.bio}
                </p>
                <div className="mt-8 flex flex-col items-center">
                    <ContactActions data={data} accent="#f43f5e" />
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </header>
            <SharedSections
                data={data}
                accent="#f43f5e"
                openProject={openProject}
            />
        </div>
        <Footer name={data.name} />
    </div>
)

const NatureLayout = ({ data, accent, openProject }: any) => (
    <div className="min-h-screen bg-[#f1f8f5] dark:bg-[#0a1410] text-[#1a2f26] dark:text-[#e0f2eb] font-sans transition-colors">
        <header className="container mx-auto px-6 py-20 grid md:grid-cols-2 items-center">
            <div className="order-2 md:order-1">
                <h1 className="text-6xl font-bold mb-4 text-green-900 dark:text-green-300">
                    {data.name}
                </h1>
                <div className="h-2 w-20 bg-green-500 mb-6 rounded-full"></div>
                <p className="text-2xl mb-6 text-green-700 dark:text-green-400">
                    {data.role}
                </p>
                <p className="text-lg text-green-800/70 dark:text-green-200/70 mb-8 leading-relaxed">
                    {data.bio}
                </p>
                <div className="flex flex-col items-start">
                    <ContactActions data={data} accent="#22c55e" />
                    <div className="mt-6 flex flex-col gap-2">
                        <Socials data={data} />
                        <FreelancePlatforms data={data} />
                    </div>
                </div>
            </div>
            <div className="flex justify-center order-1 md:order-2 mb-10 md:mb-0">
                {data.photo ? (
                    <img
                        src={data.photo}
                        className="w-80 h-96 object-cover rounded-t-[10rem] rounded-b-3xl border-4 border-green-200 dark:border-green-900 shadow-xl"
                    />
                ) : (
                    <div className="w-80 h-96 bg-green-200 dark:bg-green-900 rounded-t-[10rem] flex items-center justify-center text-green-700">
                        Foto
                    </div>
                )}
            </div>
        </header>
        <div className="container mx-auto px-6 max-w-6xl pb-20">
            <SharedSections
                data={data}
                accent="#22c55e"
                openProject={openProject}
            />
        </div>
        <Footer name={data.name} />
    </div>
)

// --- MAIN WRAPPER (ENRUTADOR) ---
export const PublicPortfolioViewer = ({ userId }: { userId: string }) => {
    const [data, setData] = useState<any>(null)
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const docRef = doc(
                    db,
                    'users',
                    userId,
                    'portfolio',
                    'site_config'
                )
                const snap = await getDoc(docRef)
                if (snap.exists()) {
                    const d = snap.data()
                    setData(d)
                    // Auto-detección de layouts oscuros por defecto
                    if (
                        [
                            'minimal_dark',
                            'terminal',
                            'cyber',
                            'studio',
                            'vibrant',
                        ].includes(d.layoutId)
                    ) {
                        setIsDark(true)
                    } else {
                        // Respetar preferencia del sistema si no es un layout forzado
                        setIsDark(
                            window.matchMedia('(prefers-color-scheme: dark)')
                                .matches
                        )
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchPortfolio()
    }, [userId])

    // Sincronizar clase "dark" en el root para que funcionen las clases dark: de Tailwind
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    if (!data)
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
                Cargando portafolio...
            </div>
        )

    const accent = data.color || '#16a34a'
    const LayoutComponent =
        {
            classic: ClassicLayout,
            split: SplitLayout,
            grid: GridLayout,
            minimal_dark: MinimalDarkLayout,
            terminal: TerminalLayout,
            neo: NeoLayout,
            glass: GlassLayout,
            magazine: MagazineLayout,
            bento: BentoLayout,
            swiss: SwissLayout,
            studio: StudioLayout,
            vibrant: VibrantLayout,
            pastel: PastelLayout,
            nature: NatureLayout,
        }[data.layoutId] || ClassicLayout

    return (
        <div className={isDark ? 'dark' : ''}>
            <div
                className={`min-h-screen transition-colors duration-300 ${
                    isDark
                        ? 'bg-slate-950 text-slate-100'
                        : 'bg-white text-slate-900'
                }`}
            >
                {/* BOTÓN TOGGLE MEJORADO */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="fixed top-6 right-6 z-[110] p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-lg hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-700" />
                    )}
                </button>

                <LayoutComponent
                    data={data}
                    accent={accent}
                    openProject={setSelectedProject}
                />

                {/* MODAL PROYECTO */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex justify-center items-center p-4 md:p-8"
                            onClick={() => setSelectedProject(null)}
                        >
                            <div
                                className="relative w-full max-w-6xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 z-50 bg-slate-100 dark:bg-black/50 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-slate-200 dark:border-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="md:w-7/12 bg-slate-50 dark:bg-black overflow-y-auto no-scrollbar">
                                    <div className="p-4 space-y-4">
                                        {selectedProject.cover && (
                                            <img
                                                src={selectedProject.cover}
                                                className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                                                alt="Portada"
                                            />
                                        )}
                                        {selectedProject.gallery?.map(
                                            (item: any, i: number) => {
                                                if (
                                                    item.type?.includes('video')
                                                ) {
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800"
                                                        >
                                                            <video
                                                                src={item.url}
                                                                controls
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    )
                                                } else if (
                                                    !item.type?.includes(
                                                        'pdf'
                                                    ) &&
                                                    !item.type?.includes(
                                                        'application'
                                                    )
                                                ) {
                                                    return (
                                                        <img
                                                            key={i}
                                                            src={item.url}
                                                            className="w-full rounded-xl object-cover"
                                                            alt="Galería"
                                                        />
                                                    )
                                                }
                                                return null
                                            }
                                        )}
                                    </div>
                                </div>

                                <div className="md:w-5/12 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                                    <div className="p-8 md:p-10 overflow-y-auto no-scrollbar flex-1">
                                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                            {selectedProject.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {selectedProject.tags
                                                ?.split(',')
                                                .map(
                                                    (
                                                        t: string,
                                                        idx: number
                                                    ) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                                                        >
                                                            {t.trim()}
                                                        </span>
                                                    )
                                                )}
                                        </div>
                                        <div className="prose dark:prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-10">
                                            {selectedProject.desc}
                                        </div>

                                        {selectedProject.documents &&
                                            selectedProject.documents.length >
                                                0 && (
                                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">
                                                        Documentos Adjuntos
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {selectedProject.documents.map(
                                                            (
                                                                doc: any,
                                                                i: number
                                                            ) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() =>
                                                                        forceDownload(
                                                                            doc.url,
                                                                            doc.name
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-3 p-3 w-full text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-all group"
                                                                >
                                                                    <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors">
                                                                        <FileText className="w-5 h-5 text-blue-500" />
                                                                    </div>
                                                                    <div className="flex-1 overflow-hidden">
                                                                        <p className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors">
                                                                            {
                                                                                doc.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-[10px] opacity-50">
                                                                            Clic
                                                                            para
                                                                            descargar
                                                                        </p>
                                                                    </div>
                                                                    <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                    {selectedProject.link && (
                                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                                            <a
                                                href={
                                                    selectedProject.link.startsWith(
                                                        'http'
                                                    )
                                                        ? selectedProject.link
                                                        : `https://${selectedProject.link}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex w-full items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                                            >
                                                Visitar Proyecto{' '}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </div>
    )
}
