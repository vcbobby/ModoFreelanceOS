import React, { useState, useEffect } from 'react'
import {
    User,
    Mail,
    MapPin,
    Plus,
    Trash2,
    Download,
    FileText,
    Wand2,
    Briefcase,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { downloadFile } from '../utils/downloadUtils'
// @ts-ignore
import html2pdf from 'html2pdf.js'

interface CVBuilderProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ onUsage, userId }) => {
    // Estado del CV
    const [cvData, setCvData] = useState({
        fullName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        experience: [{ id: 1, role: '', company: '', dates: '', desc: '' }],
        education: [{ id: 1, degree: '', school: '', dates: '' }],
        skills: '',
    })

    // Estado Cover Letter
    const [coverLetter, setCoverLetter] = useState({
        targetName: '',
        targetPosition: '',
        content: '',
    })
    const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    // 1. CARGAR DATOS AL INICIO (Persistencia)
    useEffect(() => {
        if (!userId) return
        const loadCV = async () => {
            try {
                const docRef = doc(db, 'users', userId, 'cv_data', 'main')
                const snap = await getDoc(docRef)
                if (snap.exists()) setCvData(snap.data() as any)
            } catch (e) {
                console.error('Error cargando CV', e)
            }
        }
        loadCV()
    }, [userId])

    // 2. GUARDAR DATOS (Manual o Auto al cambiar tabs/descargar)
    const saveCV = async () => {
        if (!userId) return
        setSaving(true)
        try {
            await setDoc(doc(db, 'users', userId, 'cv_data', 'main'), cvData)
        } catch (e) {
            console.error('Error guardando CV', e)
        }
        setSaving(false)
    }

    // Funciones de formulario
    const updateField = (field: string, value: any) =>
        setCvData((prev) => ({ ...prev, [field]: value }))
    const addExp = () =>
        setCvData((prev) => ({
            ...prev,
            experience: [
                ...prev.experience,
                { id: Date.now(), role: '', company: '', dates: '', desc: '' },
            ],
        }))
    const removeExp = (id: number) =>
        setCvData((prev) => ({
            ...prev,
            experience: prev.experience.filter((e) => e.id !== id),
        }))
    const updateExp = (id: number, field: string, value: string) =>
        setCvData((prev) => ({
            ...prev,
            experience: prev.experience.map((e) =>
                e.id === id ? { ...e, [field]: value } : e
            ),
        }))
    // (Similar para educación - simplificado aquí, puedes replicar la lógica de Experiencia para Educación)

    const handleDownloadCV = async () => {
        await saveCV() // Guardar antes de descargar
        const element = document.getElementById('cv-preview')
        const opt = {
            margin: 0,
            filename: `CV-${cvData.fullName.replace(/\s+/g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }

        try {
            const pdfDataUri = await html2pdf()
                .set(opt)
                .from(element)
                .outputPdf('datauristring')
            await downloadFile(pdfDataUri, opt.filename)

            // Guardar en historial
            if (userId) {
                addDoc(collection(db, 'users', userId, 'history'), {
                    createdAt: new Date().toISOString(),
                    category: 'proposal',
                    type: 'cv',
                    clientName: 'Mi Curriculum',
                    content: 'CV Generado y Descargado',
                })
            }
        } catch (e) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo generar el PDF.',
            })
        }
    }

    const handleGenerateCoverLetter = async () => {
        if (!coverLetter.targetName || !coverLetter.targetPosition) return
        const canProceed = await onUsage(1)
        if (!canProceed) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('userId', userId || '')
            formData.append('cvData', JSON.stringify(cvData)) // Enviamos el CV completo como contexto
            formData.append('targetName', coverLetter.targetName)
            formData.append('targetPosition', coverLetter.targetPosition)

            const res = await fetch(
                `${BACKEND_URL}/api/generate-cover-letter`,
                { method: 'POST', body: formData }
            )
            const data = await res.json()
            if (data.success)
                setCoverLetter((prev) => ({ ...prev, content: data.text }))
            else throw new Error('Error backend')
        } catch (e) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Fallo al generar carta con IA.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
            />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-brand-600" /> Constructor
                    de CV
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'editor'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600'
                                : 'text-slate-500'
                        }`}
                    >
                        Editar CV
                    </button>
                    <button
                        onClick={() => setActiveTab('cover')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'cover'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600'
                                : 'text-slate-500'
                        }`}
                    >
                        Carta Presentación (IA)
                    </button>
                </div>
            </div>

            {activeTab === 'editor' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* FORMULARIO */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <h3 className="font-bold mb-4 dark:text-white">
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Nombre Completo"
                                    value={cvData.fullName}
                                    onChange={(e) =>
                                        updateField('fullName', e.target.value)
                                    }
                                />
                                <input
                                    className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Título Profesional"
                                    value={cvData.title}
                                    onChange={(e) =>
                                        updateField('title', e.target.value)
                                    }
                                />
                                <input
                                    className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Email"
                                    value={cvData.email}
                                    onChange={(e) =>
                                        updateField('email', e.target.value)
                                    }
                                />
                                <input
                                    className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Teléfono"
                                    value={cvData.phone}
                                    onChange={(e) =>
                                        updateField('phone', e.target.value)
                                    }
                                />
                                <input
                                    className="p-2 border rounded col-span-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Dirección / Ciudad"
                                    value={cvData.address}
                                    onChange={(e) =>
                                        updateField('address', e.target.value)
                                    }
                                />
                                <textarea
                                    className="p-2 border rounded col-span-2 h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Perfil Profesional (Resumen)"
                                    value={cvData.summary}
                                    onChange={(e) =>
                                        updateField('summary', e.target.value)
                                    }
                                />
                            </div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold dark:text-white">
                                    Experiencia
                                </h3>
                                <button
                                    onClick={addExp}
                                    className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded hover:bg-brand-200"
                                >
                                    + Agregar
                                </button>
                            </div>
                            {cvData.experience.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="mb-4 border-b pb-4 last:border-0 dark:border-slate-700 relative group"
                                >
                                    <button
                                        onClick={() => removeExp(exp.id)}
                                        className="absolute top-0 right-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                            placeholder="Cargo"
                                            value={exp.role}
                                            onChange={(e) =>
                                                updateExp(
                                                    exp.id,
                                                    'role',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                            placeholder="Empresa"
                                            value={exp.company}
                                            onChange={(e) =>
                                                updateExp(
                                                    exp.id,
                                                    'company',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <input
                                        className="w-full p-2 border rounded text-sm mb-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        placeholder="Fechas (Ej: Ene 2020 - Actualidad)"
                                        value={exp.dates}
                                        onChange={(e) =>
                                            updateExp(
                                                exp.id,
                                                'dates',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <textarea
                                        className="w-full p-2 border rounded text-sm h-20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        placeholder="Descripción de logros..."
                                        value={exp.desc}
                                        onChange={(e) =>
                                            updateExp(
                                                exp.id,
                                                'desc',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </Card>

                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <h3 className="font-bold mb-4 dark:text-white">
                                Habilidades
                            </h3>
                            <textarea
                                className="w-full p-3 border rounded h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                placeholder="Lista tus habilidades separadas por comas..."
                                value={cvData.skills}
                                onChange={(e) =>
                                    updateField('skills', e.target.value)
                                }
                            />
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                onClick={saveCV}
                                variant="secondary"
                                className="flex-1"
                                isLoading={saving}
                            >
                                Guardar Cambios
                            </Button>
                            <Button
                                onClick={handleDownloadCV}
                                className="flex-1"
                            >
                                <Download className="w-4 h-4 mr-2" /> Descargar
                                PDF
                            </Button>
                        </div>
                    </div>

                    {/* VISTA PREVIA A4 (Igual que en Briefing, escala horizontalmente) */}
                    <div className="bg-slate-200 dark:bg-slate-900 p-4 rounded-xl overflow-x-auto border border-slate-300 dark:border-slate-700">
                        <div
                            id="cv-preview"
                            className="bg-white text-slate-800 w-[210mm] min-h-[297mm] p-[15mm] shadow-xl mx-auto text-sm leading-relaxed shrink-0"
                        >
                            {/* Header CV */}
                            <div className="border-b-2 border-slate-800 pb-4 mb-6">
                                <h1 className="text-3xl font-bold uppercase tracking-tight">
                                    {cvData.fullName || 'Tu Nombre'}
                                </h1>
                                <p className="text-lg text-slate-600 font-medium">
                                    {cvData.title || 'Tu Título Profesional'}
                                </p>
                                <div className="flex gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                                    {cvData.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />{' '}
                                            {cvData.email}
                                        </span>
                                    )}
                                    {cvData.phone && (
                                        <span className="flex items-center gap-1">
                                            Tel: {cvData.phone}
                                        </span>
                                    )}
                                    {cvData.address && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />{' '}
                                            {cvData.address}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Resumen */}
                            {cvData.summary && (
                                <div className="mb-6">
                                    <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-2 pb-1 text-xs tracking-wider">
                                        Perfil
                                    </h3>
                                    <p className="text-justify">
                                        {cvData.summary}
                                    </p>
                                </div>
                            )}

                            {/* Experiencia */}
                            <div className="mb-6">
                                <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-3 pb-1 text-xs tracking-wider">
                                    Experiencia
                                </h3>
                                {cvData.experience.map((exp) => (
                                    <div key={exp.id} className="mb-4">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold">
                                                {exp.role}
                                            </h4>
                                            <span className="text-xs text-slate-500 italic">
                                                {exp.dates}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-medium text-xs mb-1">
                                            {exp.company}
                                        </p>
                                        <p className="text-xs whitespace-pre-wrap text-slate-600">
                                            {exp.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Habilidades */}
                            {cvData.skills && (
                                <div>
                                    <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-2 pb-1 text-xs tracking-wider">
                                        Habilidades
                                    </h3>
                                    <p>{cvData.skills}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB CARTA PRESENTACIÓN */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 bg-white dark:bg-slate-800 space-y-4 h-fit">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                            <Wand2 className="w-4 h-4 inline mr-2" />
                            La IA leerá tu CV actual y generará una carta
                            personalizada para la oferta que desees.
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase dark:text-slate-400">
                                Nombre de la Empresa / Recrutador
                            </label>
                            <input
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={coverLetter.targetName}
                                onChange={(e) =>
                                    setCoverLetter((prev) => ({
                                        ...prev,
                                        targetName: e.target.value,
                                    }))
                                }
                                placeholder="Ej: Google Inc."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase dark:text-slate-400">
                                Puesto al que aplicas
                            </label>
                            <input
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={coverLetter.targetPosition}
                                onChange={(e) =>
                                    setCoverLetter((prev) => ({
                                        ...prev,
                                        targetPosition: e.target.value,
                                    }))
                                }
                                placeholder="Ej: Senior React Developer"
                            />
                        </div>
                        <Button
                            onClick={handleGenerateCoverLetter}
                            isLoading={loading}
                            disabled={!coverLetter.targetName}
                            className="w-full"
                        >
                            Generar Carta (1 Crédito)
                        </Button>
                    </Card>

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                        {coverLetter.content ? (
                            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap max-w-none">
                                {coverLetter.content}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-center">
                                Completa los datos para generar tu carta.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
