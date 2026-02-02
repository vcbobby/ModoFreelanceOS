import React, { useState, useEffect } from 'react'
import {
    Save,
    Eye,
    Monitor,
    Palette,
    Image as ImageIcon,
    Plus,
    Trash2,
    Smartphone,
    Layout,
    Briefcase,
    Link as LinkIcon,
    Video,
    Paperclip,
    FileText,
    Loader2,
    Share2,
    Globe,
    Facebook,
    Youtube,
    Twitch,
    FileDown,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import html2pdf from 'html2pdf.js'

interface WebsiteBuilderProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

// DEFINICIÓN DE LAYOUTS (15 Estilos)
const LAYOUTS = [
    // --- CLÁSICOS ---
    {
        id: 'classic',
        name: 'Clásico Profesional',
        desc: 'Limpio, centrado, atemporal.',
        // bg: 'bg-white',
        // text: 'text-slate-900',
    },
    // {
    //     id: 'split',
    //     name: 'Pantalla Dividida',
    //     desc: 'Foto lateral fija, contenido scroll.',
    //     bg: 'bg-slate-50',
    //     text: 'text-slate-900',
    // },
    {
        id: 'grid',
        name: 'Grid Creativo',
        desc: 'Enfocado en portafolio visual.',
        bg: 'bg-white',
        text: 'text-slate-900',
    },

    // --- OSCUROS / TECH ---
    {
        id: 'minimal_dark',
        name: 'Minimal Dark',
        desc: 'Elegancia oscura para devs.',
        bg: 'bg-black',
        text: 'text-gray-200',
    },
    {
        id: 'terminal',
        name: 'Terminal / Hacker',
        desc: 'Estilo línea de comandos retro.',
        bg: 'bg-black',
        text: 'text-green-400',
    },
    {
        id: 'cyber',
        name: 'Cyberpunk',
        desc: 'Neón, futurista y audaz.',
        bg: 'bg-slate-900',
        text: 'text-pink-400',
    },

    // --- TENDENCIAS ---
    // {
    //     id: 'neo',
    //     name: 'Neo-Brutalismo',
    //     desc: 'Bordes gruesos, sombras duras, pop.',
    //     bg: 'bg-yellow-100',
    //     text: 'text-black',
    // },
    {
        id: 'glass',
        name: 'Glassmorphism',
        desc: 'Transparencias y desenfoques.',
        bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
        text: 'text-white',
    },
    {
        id: 'bento',
        name: 'Bento Grid',
        desc: 'Cajas organizadas estilo Apple.',
        bg: 'bg-slate-100',
        text: 'text-slate-800',
    },

    // --- EDITORIAL / ARTE ---
    {
        id: 'magazine',
        name: 'Editorial Vogue',
        desc: 'Tipografía Serif grande y elegante.',
        bg: 'bg-stone-50',
        text: 'text-stone-900',
    },
    {
        id: 'swiss',
        name: 'Swiss Style',
        desc: 'Grillas rígidas, tipografía Helvetica.',
        bg: 'bg-white',
        text: 'text-red-600',
    },
    {
        id: 'studio',
        name: 'Agency Studio',
        desc: 'Espacioso, fotos gigantes.',
        bg: 'bg-zinc-900',
        text: 'text-white',
    },

    // --- COLORIDOS ---
    {
        id: 'vibrant',
        name: 'Vibrante',
        desc: 'Gradientes fuertes y energía.',
        bg: 'bg-indigo-900',
        text: 'text-white',
    },
    {
        id: 'pastel',
        name: 'Pastel Soft',
        desc: 'Colores suaves y amigables.',
        bg: 'bg-rose-50',
        text: 'text-rose-900',
    },
    {
        id: 'nature',
        name: 'Orgánico',
        desc: 'Tonos tierra y naturalidad.',
        bg: 'bg-green-50',
        text: 'text-green-900',
    },
]

export const WebsiteBuilder: React.FC<WebsiteBuilderProps> = ({
    onUsage,
    userId,
}) => {
    const [siteData, setSiteData] = useState({
        slug: '',
        name: '',
        role: '',
        bio: '',
        email: '',
        whatsapp: '',
        linkedin: '',
        instagram: '',
        twitter: '',
        github: '',
        behance: '',
        kick: '',
        twitch: '',
        youtube: '',
        patreon: '',
        facebook: '',
        upwork: '',
        freelancer: '',
        workana: '',
        fiverr: '',
        layoutId: 'classic',
        color: '#2563eb',
        theme: 'dark',
        photo: '',
        skills: '',
        projects: [] as any[],
        experience: [] as any[],
        education: [] as any[],
    })

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeSection, setActiveTab] = useState<
        'general' | 'design' | 'projects' | 'cv'
    >('general')
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })

    // ESTADO PARA EL NOMBRE DEL DOCUMENTO (REEMPLAZA AL PROMPT FEO)
    const [docModal, setDocModal] = useState({
        isOpen: false,
        projectIndex: -1,
        file: null as File | null,
        tempName: '',
    })

    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    useEffect(() => {
        if (!userId) return
        const load = async () => {
            try {
                const snap = await getDoc(
                    doc(db, 'users', userId, 'portfolio', 'site_config'),
                )
                if (snap.exists())
                    setSiteData((prev) => ({ ...prev, ...snap.data() }))
            } catch (e) {
                console.error(e)
            }
        }
        load()
    }, [userId])

    const handleExportPDF = async () => {
        await handleSave()
        const element = document.getElementById('portfolio-pdf-template')

        const opt = {
            margin: 0,
            filename: `Portafolio-${siteData.name.replace(/\s+/g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                // Mantenemos estas coordenadas para evitar las páginas blancas
                x: 0,
                y: 0,
                scrollY: 0,
                windowWidth: 794,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            // CORRECCIÓN AQUÍ: Agregamos 'avoid-all' de nuevo.
            // Esto es lo que lee los estilos CSS para evitar cortes.
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        }

        setLoading(true)
        try {
            // @ts-ignore
            await html2pdf().set(opt).from(element).save()
        } catch (e) {
            console.error(e)
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo generar el PDF.',
            })
        } finally {
            setLoading(false)
        }
    }

    // SUBIDA DE ARCHIVOS
    const uploadFileToBackend = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId || 'anon')

        const res = await fetch(`${BACKEND_URL}/api/upload-asset`, {
            method: 'POST',
            body: formData,
        })
        const data = await res.json()
        if (data.success) return data
        throw new Error('Error subiendo archivo')
    }

    const handleFileUpload = async (
        e: any,
        callback: (url: string, type: string, name: string) => void,
    ) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        try {
            const data = await uploadFileToBackend(file)
            callback(data.url, data.type, data.name)
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo subir el archivo.',
            })
        } finally {
            setUploading(false)
        }
    }

    // MANEJO DE DOCUMENTOS (Paso intermedio para pedir nombre)
    const handleDocSelect = (e: any, projIndex: number) => {
        const file = e.target.files[0]
        if (file) {
            setDocModal({
                isOpen: true,
                projectIndex: projIndex,
                file: file,
                tempName: file.name,
            })
        }
    }

    const confirmDocUpload = async () => {
        if (!docModal.file || docModal.projectIndex === -1) return
        setUploading(true)
        setDocModal((prev) => ({ ...prev, isOpen: false })) // Cerrar modal mientras sube

        try {
            const data = await uploadFileToBackend(docModal.file)
            // Agregamos al proyecto con el nombre personalizado
            addToDocs(docModal.projectIndex, data.url, 'raw', docModal.tempName)
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Fallo al subir documento.',
            })
        } finally {
            setUploading(false)
            setDocModal({
                isOpen: false,
                projectIndex: -1,
                file: null,
                tempName: '',
            })
        }
    }

    const handleSave = async () => {
        if (!userId) return
        setLoading(true)
        try {
            // Limpieza de datos
            const cleanProjects = (siteData.projects || []).map((p: any) => ({
                ...p,
                // Aseguramos IDs únicos si no tienen
                id: p.id || Date.now() + Math.random(),
                gallery: (p.gallery || []).map((g: any) => ({
                    url: g.url || '',
                    type: g.type || 'image',
                    name: g.name || 'Archivo',
                })),
                documents: (p.documents || []).map((d: any) => ({
                    url: d.url || '',
                    type: d.type || 'raw',
                    name: d.name || 'Doc',
                })),
            }))

            const dataToSave = { ...siteData, projects: cleanProjects }

            await setDoc(
                doc(db, 'users', userId, 'portfolio', 'site_config'),
                dataToSave,
            )
            if (siteData.slug && siteData.slug.length > 3) {
                await setDoc(
                    doc(db, 'slugs', siteData.slug.toLowerCase()),
                    { userId: userId },
                    { merge: true },
                )
            }
            setModal({
                isOpen: true,
                title: '¡Publicado!',
                message: 'Tu sitio web ha sido actualizado.',
            })
        } catch (e: any) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: `No se pudo guardar: ${e.message}`,
            })
        } finally {
            setLoading(false)
        }
    }

    const update = (field: string, val: any) =>
        setSiteData((p) => ({ ...p, [field]: val }))

    // CRUD Proyectos (CORREGIDO ERROR DE KEYS)
    const addProject = () =>
        update('projects', [
            ...(siteData.projects || []),
            {
                id: Date.now() + Math.random(), // ID ÚNICO REAL
                title: 'Nuevo Proyecto',
                desc: '',
                link: '',
                tags: '',
                cover: '',
                gallery: [],
                documents: [],
            },
        ])

    const updateProject = (i: number, f: string, v: any) => {
        const p = [...(siteData.projects || [])]
        p[i] = { ...p[i], [f]: v }
        update('projects', p)
    }
    const removeProject = (i: number) =>
        update(
            'projects',
            siteData.projects.filter((_, idx) => idx !== i),
        )

    // Galería
    const addToGallery = (
        idx: number,
        url: string,
        type: string,
        name: string,
    ) => {
        const p = [...(siteData.projects || [])]
        p[idx].gallery = [...(p[idx].gallery || []), { url, type, name }]
        update('projects', p)
    }
    const removeFromGallery = (pIdx: number, gIdx: number) => {
        const p = [...siteData.projects]
        p[pIdx].gallery = p[pIdx].gallery.filter(
            (_: any, i: number) => i !== gIdx,
        )
        update('projects', p)
    }

    // Documentos
    const addToDocs = (
        idx: number,
        url: string,
        type: string,
        name: string,
    ) => {
        const p = [...(siteData.projects || [])]
        p[idx].documents = [...(p[idx].documents || []), { url, type, name }]
        update('projects', p)
    }
    const removeFromDocs = (pIdx: number, dIdx: number) => {
        const p = [...siteData.projects]
        p[pIdx].documents = p[pIdx].documents.filter(
            (_: any, i: number) => i !== dIdx,
        )
        update('projects', p)
    }

    // CRUD Exp/Edu (CORREGIDO ERROR DE KEYS)
    const addExp = () =>
        update('experience', [
            ...(siteData.experience || []),
            {
                id: Date.now() + Math.random(),
                role: '',
                company: '',
                year: '',
                desc: '',
            },
        ])
    const updateExp = (i: number, f: string, v: string) => {
        const e = [...siteData.experience]
        e[i] = { ...e[i], [f]: v }
        update('experience', e)
    }
    const removeExp = (i: number) =>
        update(
            'experience',
            siteData.experience.filter((_, idx) => idx !== i),
        )

    const addEdu = () =>
        update('education', [
            ...(siteData.education || []),
            {
                id: Date.now() + Math.random(),
                degree: '',
                school: '',
                year: '',
            },
        ])
    const updateEdu = (i: number, f: string, v: string) => {
        const e = [...(siteData.education || [])]
        e[i] = { ...e[i], [f]: v }
        update('education', e)
    }
    const removeEdu = (i: number) =>
        update(
            'education',
            siteData.education.filter((_, idx) => idx !== i),
        )

    const inputClass =
        'w-full max-w-full min-w-0 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400'
    const labelClass =
        'text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block tracking-wide'

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                confirmText="OK"
                cancelText=""
            />

            {/* MODAL PARA NOMBRE DEL DOCUMENTO (NUEVO) */}
            {docModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold mb-4 dark:text-white text-lg">
                            Nombre del Documento
                        </h3>
                        <input
                            autoFocus
                            className={inputClass}
                            value={docModal.tempName}
                            onChange={(e) =>
                                setDocModal((prev) => ({
                                    ...prev,
                                    tempName: e.target.value,
                                }))
                            }
                            placeholder="Ej: Presupuesto 2025.pdf"
                        />
                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    setDocModal({
                                        isOpen: false,
                                        projectIndex: -1,
                                        file: null,
                                        tempName: '',
                                    })
                                }
                            >
                                Cancelar
                            </Button>
                            <Button onClick={confirmDocUpload}>
                                Subir Archivo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER MEJORADO RESPONSIVE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Monitor className="w-8 h-8 text-brand-600" /> Web
                        Builder PRO
                    </h2>
                </div>

                {/* BOTONES: Columna en móvil, Fila en escritorio */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() =>
                            window.open(
                                `${window.location.origin}/p/${
                                    siteData.slug || userId
                                }`,
                                '_blank',
                            )
                        }
                        className="w-full sm:w-auto justify-center"
                    >
                        <Eye className="w-4 h-4 mr-2" /> Ver Sitio
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleExportPDF}
                        disabled={uploading || loading}
                        className="w-full sm:w-auto justify-center"
                    >
                        <FileDown className="w-4 h-4 mr-2" /> Descargar PDF
                    </Button>

                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        disabled={uploading}
                        className="bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto justify-center"
                    >
                        <Save className="w-4 h-4 mr-2" /> Publicar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-2 lg:col-span-1">
                    {[
                        {
                            id: 'general',
                            label: '1. Datos Generales',
                            icon: <Smartphone className="w-4 h-4" />,
                        },
                        {
                            id: 'design',
                            label: '2. Diseño y Estilo',
                            icon: <Palette className="w-4 h-4" />,
                        },
                        {
                            id: 'projects',
                            label: '3. Portafolio',
                            icon: <Layout className="w-4 h-4" />,
                        },
                        {
                            id: 'cv',
                            label: '4. CV & Estudios',
                            icon: <Briefcase className="w-4 h-4" />,
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                                activeSection === tab.id
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-600'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                        >
                            {tab.icon}{' '}
                            <span className="font-bold">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3">
                    <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[600px]">
                        {/* 1. GENERAL */}
                        {activeSection === 'general' && (
                            <div className="space-y-6 animate-in fade-in">
                                {/* CORRECCIÓN RESPONSIVE PARA EL SLUG */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <label className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 block">
                                        Tu Enlace Personalizado
                                    </label>

                                    {/* CAMBIO AQUI: flex-col en móvil, flex-row en sm/md */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="text-slate-400 dark:text-slate-500 text-sm font-mono break-all sm:break-normal">
                                            app.modofreelanceos.com/p/
                                        </span>
                                        <input
                                            className="w-full flex-1 bg-transparent border-b-2 border-blue-300 focus:border-blue-600 outline-none text-blue-900 dark:text-white font-bold text-lg p-1 min-w-0"
                                            value={siteData.slug}
                                            onChange={(e) =>
                                                update(
                                                    'slug',
                                                    e.target.value
                                                        .replace(/\s+/g, '-')
                                                        .toLowerCase(),
                                                )
                                            }
                                            placeholder="tu-nombre"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Agregado 'w-full' y 'min-w-0' para evitar desbordamiento */}
                                    <div className="w-full min-w-0">
                                        <label className={labelClass}>
                                            Nombre Visible
                                        </label>
                                        <input
                                            // Aseguramos max-w-full por si acaso
                                            className={`${inputClass} max-w-full`}
                                            value={siteData.name}
                                            onChange={(e) =>
                                                update('name', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Rol Principal
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={siteData.role}
                                            onChange={(e) =>
                                                update('role', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Bio / Sobre Mí
                                    </label>
                                    <textarea
                                        className={`${inputClass} h-32`}
                                        value={siteData.bio}
                                        onChange={(e) =>
                                            update('bio', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>
                                            Email
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={siteData.email}
                                            onChange={(e) =>
                                                update('email', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            WhatsApp
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={siteData.whatsapp}
                                            onChange={(e) =>
                                                update(
                                                    'whatsapp',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="+58..."
                                        />
                                    </div>
                                </div>

                                {/* REDES SOCIALES COMPLETAS */}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Share2 className="w-4 h-4" /> Redes
                                        Sociales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            className={inputClass}
                                            value={siteData.linkedin}
                                            onChange={(e) =>
                                                update(
                                                    'linkedin',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="LinkedIn URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.instagram}
                                            onChange={(e) =>
                                                update(
                                                    'instagram',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Instagram URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.twitter}
                                            onChange={(e) =>
                                                update(
                                                    'twitter',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Twitter/X URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.github}
                                            onChange={(e) =>
                                                update('github', e.target.value)
                                            }
                                            placeholder="GitHub URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.behance}
                                            onChange={(e) =>
                                                update(
                                                    'behance',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Behance URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.facebook}
                                            onChange={(e) =>
                                                update(
                                                    'facebook',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Facebook URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.youtube}
                                            onChange={(e) =>
                                                update(
                                                    'youtube',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="YouTube URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.twitch}
                                            onChange={(e) =>
                                                update('twitch', e.target.value)
                                            }
                                            placeholder="Twitch URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.kick}
                                            onChange={(e) =>
                                                update('kick', e.target.value)
                                            }
                                            placeholder="Kick URL"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.patreon}
                                            onChange={(e) =>
                                                update(
                                                    'patreon',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Patreon URL"
                                        />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white mt-6 mb-4 flex items-center gap-2">
                                        Plataformas Freelance
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            className={inputClass}
                                            value={siteData.upwork}
                                            onChange={(e) =>
                                                update('upwork', e.target.value)
                                            }
                                            placeholder="Perfil Upwork"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.freelancer}
                                            onChange={(e) =>
                                                update(
                                                    'freelancer',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Perfil Freelancer"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.workana}
                                            onChange={(e) =>
                                                update(
                                                    'workana',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Perfil Workana"
                                        />
                                        <input
                                            className={inputClass}
                                            value={siteData.fiverr}
                                            onChange={(e) =>
                                                update('fiverr', e.target.value)
                                            }
                                            placeholder="Perfil Fiverr"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`${labelClass} mb-2`}>
                                        Foto de Perfil
                                    </label>
                                    <div className="flex items-center gap-4 p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                        {siteData.photo ? (
                                            <img
                                                src={siteData.photo}
                                                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500">
                                                Sin foto
                                            </div>
                                        )}
                                        <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors">
                                            {uploading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Subir Foto'
                                            )}
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleFileUpload(e, (url) =>
                                                        update('photo', url),
                                                    )
                                                }
                                                className="hidden"
                                                accept="image/*"
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. DESIGN */}
                        {activeSection === 'design' && (
                            <div className="space-y-8 animate-in fade-in">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Elige una Estructura
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {LAYOUTS.map((layout) => (
                                        <button
                                            key={layout.id}
                                            onClick={() =>
                                                update('layoutId', layout.id)
                                            }
                                            className={`p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                                                siteData.layoutId === layout.id
                                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="font-bold text-slate-800 dark:text-white text-base mb-1">
                                                {layout.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {layout.desc}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <label className={labelClass}>
                                        Color de Acento
                                    </label>
                                    <input
                                        type="color"
                                        className="w-16 h-12 rounded cursor-pointer border-0 p-0 bg-transparent mt-2"
                                        value={siteData.color}
                                        onChange={(e) =>
                                            update('color', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. PROJECTS */}
                        {activeSection === 'projects' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Portafolio
                                    </h3>
                                    <Button size="sm" onClick={addProject}>
                                        <Plus className="w-4 h-4 mr-1" /> Nuevo
                                        Proyecto
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    {siteData.projects?.map((proj, i) => (
                                        <div
                                            key={proj.id}
                                            className="border border-slate-200 dark:border-slate-700 p-6 rounded-xl relative bg-slate-50 dark:bg-slate-900/30"
                                        >
                                            <button
                                                onClick={() => removeProject(i)}
                                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Título
                                                        </label>
                                                        <input
                                                            className={`${inputClass} font-bold`}
                                                            value={proj.title}
                                                            onChange={(e) =>
                                                                updateProject(
                                                                    i,
                                                                    'title',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Descripción
                                                        </label>
                                                        <textarea
                                                            className={`${inputClass} h-24 resize-none`}
                                                            value={proj.desc}
                                                            onChange={(e) =>
                                                                updateProject(
                                                                    i,
                                                                    'desc',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Link
                                                        </label>
                                                        <input
                                                            className={
                                                                inputClass
                                                            }
                                                            value={proj.link}
                                                            onChange={(e) =>
                                                                updateProject(
                                                                    i,
                                                                    'link',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className={
                                                                labelClass
                                                            }
                                                        >
                                                            Tags
                                                        </label>
                                                        <input
                                                            className={
                                                                inputClass
                                                            }
                                                            value={proj.tags}
                                                            onChange={(e) =>
                                                                updateProject(
                                                                    i,
                                                                    'tags',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <p
                                                            className={`${labelClass} mb-2`}
                                                        >
                                                            Portada
                                                        </p>
                                                        <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-2 rounded text-xs font-bold block text-center transition-colors">
                                                            {uploading
                                                                ? '...'
                                                                : 'Subir Portada'}
                                                            <input
                                                                type="file"
                                                                onChange={(e) =>
                                                                    handleFileUpload(
                                                                        e,
                                                                        (url) =>
                                                                            updateProject(
                                                                                i,
                                                                                'cover',
                                                                                url,
                                                                            ),
                                                                    )
                                                                }
                                                                className="hidden"
                                                                accept="image/*"
                                                                disabled={
                                                                    uploading
                                                                }
                                                            />
                                                        </label>
                                                        {proj.cover && (
                                                            <img
                                                                src={proj.cover}
                                                                className="h-24 mt-3 rounded-lg object-cover w-full border dark:border-slate-600"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <p
                                                            className={`${labelClass} mb-2`}
                                                        >
                                                            Galería
                                                            (Fotos/Video)
                                                        </p>
                                                        <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-2 rounded text-xs font-bold w-full block text-center transition-colors mb-3">
                                                            {uploading
                                                                ? 'Subiendo...'
                                                                : '+ Agregar'}
                                                            <input
                                                                type="file"
                                                                onChange={(e) =>
                                                                    handleFileUpload(
                                                                        e,
                                                                        (
                                                                            url,
                                                                            type,
                                                                            name,
                                                                        ) =>
                                                                            addToGallery(
                                                                                i,
                                                                                url,
                                                                                type,
                                                                                name,
                                                                            ),
                                                                    )
                                                                }
                                                                className="hidden"
                                                                disabled={
                                                                    uploading
                                                                }
                                                            />
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {proj.gallery?.map(
                                                                (
                                                                    item: any,
                                                                    idx: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="relative group w-14 h-14 border dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden"
                                                                    >
                                                                        {item.type.includes(
                                                                            'image',
                                                                        ) ? (
                                                                            <img
                                                                                src={
                                                                                    item.url
                                                                                }
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <Video className="w-6 h-6 text-slate-400" />
                                                                        )}
                                                                        <button
                                                                            onClick={() =>
                                                                                removeFromGallery(
                                                                                    i,
                                                                                    idx,
                                                                                )
                                                                            }
                                                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* SECCION DOCUMENTOS CORREGIDA (Usa Modal) */}
                                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <p
                                                            className={`${labelClass} mb-2`}
                                                        >
                                                            Documentos
                                                        </p>
                                                        <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-2 rounded text-xs font-bold block text-center transition-colors mb-2">
                                                            + PDF/Doc
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={(e) =>
                                                                    handleDocSelect(
                                                                        e,
                                                                        i,
                                                                    )
                                                                }
                                                                className="hidden"
                                                                disabled={
                                                                    uploading
                                                                }
                                                            />
                                                        </label>
                                                        <div className="space-y-1">
                                                            {proj.documents?.map(
                                                                (
                                                                    d: any,
                                                                    idx: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-600 rounded mb-1"
                                                                    >
                                                                        <span className="truncate w-32 dark:text-slate-300">
                                                                            {
                                                                                d.name
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                removeFromDocs(
                                                                                    i,
                                                                                    idx,
                                                                                )
                                                                            }
                                                                            className="text-red-500"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. CV & EXP */}
                        {activeSection === 'cv' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <label className={labelClass}>Skills</label>
                                    <textarea
                                        className={`${inputClass} h-20`}
                                        value={siteData.skills}
                                        onChange={(e) =>
                                            update('skills', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold dark:text-white">
                                            Historial Laboral
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={addExp}
                                            variant="secondary"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />{' '}
                                            Agregar
                                        </Button>
                                    </div>
                                    {siteData.experience?.map((exp, i) => (
                                        <div
                                            key={exp.id}
                                            className="relative p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-4"
                                        >
                                            <button
                                                onClick={() => removeExp(i)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid md:grid-cols-3 gap-3 mb-2">
                                                <input
                                                    className={inputClass}
                                                    value={exp.role}
                                                    onChange={(e) =>
                                                        updateExp(
                                                            i,
                                                            'role',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Cargo"
                                                />
                                                <input
                                                    className={inputClass}
                                                    value={exp.company}
                                                    onChange={(e) =>
                                                        updateExp(
                                                            i,
                                                            'company',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Empresa"
                                                />
                                                <input
                                                    className={inputClass}
                                                    value={exp.year}
                                                    onChange={(e) =>
                                                        updateExp(
                                                            i,
                                                            'year',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Año"
                                                />
                                            </div>
                                            <textarea
                                                className={`${inputClass} h-16`}
                                                value={exp.desc}
                                                onChange={(e) =>
                                                    updateExp(
                                                        i,
                                                        'desc',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Logros..."
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold dark:text-white">
                                            Educación
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={addEdu}
                                            variant="secondary"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />{' '}
                                            Agregar
                                        </Button>
                                    </div>
                                    {siteData.education?.map(
                                        (edu: any, i: number) => (
                                            <div
                                                key={edu.id}
                                                className="relative p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-4"
                                            >
                                                <button
                                                    onClick={() => removeEdu(i)}
                                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="grid md:grid-cols-3 gap-3">
                                                    <input
                                                        className={inputClass}
                                                        value={edu.degree}
                                                        onChange={(e) =>
                                                            updateEdu(
                                                                i,
                                                                'degree',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Título"
                                                    />
                                                    <input
                                                        className={inputClass}
                                                        value={edu.school}
                                                        onChange={(e) =>
                                                            updateEdu(
                                                                i,
                                                                'school',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Institución"
                                                    />
                                                    <input
                                                        className={inputClass}
                                                        value={edu.year}
                                                        onChange={(e) =>
                                                            updateEdu(
                                                                i,
                                                                'year',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Año"
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            {/* --- PLANTILLA OCULTA PARA PDF (VERSIÓN FINAL ESTABLE) --- */}
            <div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: -9999,
                    visibility: 'visible',
                }}
            >
                <div
                    id="portfolio-pdf-template"
                    className="bg-white text-slate-900 box-border"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontSize: '11pt',
                        lineHeight: '1.5',
                        backgroundColor: 'white',
                    }}
                >
                    {/* PORTADA */}
                    <div className="w-full h-[290mm] relative flex flex-col justify-center items-center text-center p-[20mm] page-break-after-always box-border">
                        <div
                            className="absolute top-0 left-0 w-full h-6"
                            style={{ backgroundColor: siteData.color }}
                        ></div>

                        {siteData.photo && (
                            <img
                                src={siteData.photo}
                                className="w-48 h-48 rounded-full object-cover shadow-xl mb-8 border-4 border-white"
                                style={{ borderColor: siteData.color }}
                            />
                        )}

                        <h1 className="text-5xl font-black uppercase tracking-tight mb-4 leading-none text-slate-900">
                            {siteData.name}
                        </h1>
                        <p className="text-xl font-medium uppercase tracking-widest text-slate-500 mb-8">
                            {siteData.role}
                        </p>

                        <div className="max-w-md mx-auto text-base text-slate-600 leading-relaxed mb-12">
                            {siteData.bio}
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider border-t pt-8 w-full border-slate-100">
                            {siteData.email && <span>{siteData.email}</span>}
                            {siteData.whatsapp && (
                                <span>• {siteData.whatsapp}</span>
                            )}
                            {siteData.slug && (
                                <span>
                                    • app.modofreelanceos.com/p/{siteData.slug}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* CONTENIDO FLUIDO */}
                    <div className="p-[20mm]">
                        {/* SECCIÓN PORTAFOLIO */}
                        {siteData.projects?.length > 0 && (
                            <div className="mb-12">
                                <div
                                    className="flex items-center gap-4 mb-8 border-b-2 pb-2"
                                    style={{ borderColor: siteData.color }}
                                >
                                    <h2 className="text-2xl font-bold uppercase text-slate-800">
                                        Portafolio Seleccionado
                                    </h2>
                                </div>

                                <div className="space-y-12">
                                    {siteData.projects.map(
                                        (proj: any, i: number) => (
                                            <div
                                                key={i}
                                                className="mb-10 border-b border-slate-100 pb-10"
                                                // REFUERZO ANTI-CORTE: display: block ayuda al motor de PDF
                                                style={{
                                                    pageBreakInside: 'avoid',
                                                    breakInside: 'avoid',
                                                    display: 'block',
                                                }}
                                            >
                                                {/* Cabecera del Proyecto */}
                                                <div className="flex gap-6 mb-6">
                                                    <div className="w-32 shrink-0">
                                                        {proj.cover ? (
                                                            <img
                                                                src={proj.cover}
                                                                className="w-full h-24 object-cover rounded-lg shadow-sm bg-slate-100"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                                                Sin Foto
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                            {proj.title}
                                                        </h3>
                                                        {proj.tags && (
                                                            <p
                                                                className="text-xs font-bold uppercase mb-2 opacity-70"
                                                                style={{
                                                                    color: siteData.color,
                                                                }}
                                                            >
                                                                {proj.tags}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-slate-600 leading-relaxed mb-2 text-justify">
                                                            {proj.desc}
                                                        </p>
                                                        {proj.link && (
                                                            <a
                                                                href={proj.link}
                                                                className="text-xs underline text-slate-400"
                                                            >
                                                                Ver Proyecto
                                                                Online
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* GALERÍA MEJORADA (IMÁGENES MÁS GRANDES) */}
                                                {proj.gallery &&
                                                    proj.gallery.length > 0 && (
                                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                                                                Galería del
                                                                proyecto:
                                                            </p>

                                                            {/* Usamos grid de 2 columnas para que las fotos sean grandes */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {proj.gallery.map(
                                                                    (
                                                                        img: any,
                                                                        idx: number,
                                                                    ) => {
                                                                        if (
                                                                            !img.type.includes(
                                                                                'image',
                                                                            )
                                                                        )
                                                                            return null
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                style={{
                                                                                    breakInside:
                                                                                        'avoid',
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        img.url
                                                                                    }
                                                                                    // h-56 son unos 220px, bastante grande y detallado
                                                                                    className="w-full h-56 object-cover rounded-lg border border-slate-200 bg-white"
                                                                                    alt="Detalle"
                                                                                />
                                                                            </div>
                                                                        )
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EXPERIENCIA Y EDUCACIÓN */}
                        <div className="grid grid-cols-2 gap-10">
                            {/* Columna Izquierda */}
                            <div>
                                {siteData.experience?.length > 0 && (
                                    <div style={{ breakInside: 'avoid' }}>
                                        <h3 className="text-lg font-bold uppercase mb-4 pb-2 border-b border-slate-200 text-slate-800">
                                            Experiencia
                                        </h3>
                                        {siteData.experience.map(
                                            (exp: any, i: number) => (
                                                <div key={i} className="mb-5">
                                                    <h4 className="font-bold text-base text-slate-900">
                                                        {exp.role}
                                                    </h4>
                                                    <p className="text-xs font-bold text-slate-500 mb-1">
                                                        {exp.company} •{' '}
                                                        {exp.year}
                                                    </p>
                                                    <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                                        {exp.desc}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha */}
                            <div>
                                {siteData.education?.length > 0 && (
                                    <div
                                        className="mb-8"
                                        style={{ breakInside: 'avoid' }}
                                    >
                                        <h3 className="text-lg font-bold uppercase mb-4 pb-2 border-b border-slate-200 text-slate-800">
                                            Educación
                                        </h3>
                                        {siteData.education.map(
                                            (edu: any, i: number) => (
                                                <div key={i} className="mb-3">
                                                    <h4 className="font-bold text-sm text-slate-900">
                                                        {edu.degree}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500">
                                                        {edu.school} •{' '}
                                                        {edu.year}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {siteData.skills && (
                                    <div style={{ breakInside: 'avoid' }}>
                                        <h3 className="text-lg font-bold uppercase mb-4 pb-2 border-b border-slate-200 text-slate-800">
                                            Habilidades
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {siteData.skills
                                                .split(',')
                                                .map((s: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200"
                                                    >
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
