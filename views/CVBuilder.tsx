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
    GraduationCap,
    Camera,
    Briefcase,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'
import { downloadFile } from '../utils/downloadUtils'
// @ts-ignore
import html2pdf from 'html2pdf.js'
import ReactMarkdown from 'react-markdown'

interface CVBuilderProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ onUsage, userId }) => {
    const [cvData, setCvData] = useState({
        fullName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        photo: '', // Foto base64
        experience: [{ id: 1, role: '', company: '', dates: '', desc: '' }],
        education: [{ id: 1, degree: '', school: '', dates: '' }],
        skills: '',
    })

    const [coverLetter, setCoverLetter] = useState({
        targetName: '',
        targetPosition: '',
        content: '',
    })
    const [activeTab, setActiveTab] = useState<'editor' | 'cover'>('editor')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    useEffect(() => {
        if (!userId) return
        const loadCV = async () => {
            try {
                const docRef = doc(db, 'users', userId, 'cv_data', 'main')
                const snap = await getDoc(docRef)
                if (snap.exists()) setCvData(snap.data() as any)
            } catch (e) {
                console.error(e)
            }
        }
        loadCV()
    }, [userId])

    const saveCV = async () => {
        if (!userId) return
        setSaving(true)
        try {
            await setDoc(doc(db, 'users', userId, 'cv_data', 'main'), cvData)
        } catch (e) {
            console.error(e)
        }
        setSaving(false)
    }

    const updateField = (field: string, value: any) =>
        setCvData((prev) => ({ ...prev, [field]: value }))

    // CRUD Experiencia
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

    // CRUD Educación
    const addEdu = () =>
        setCvData((prev) => ({
            ...prev,
            education: [
                ...prev.education,
                { id: Date.now(), degree: '', school: '', dates: '' },
            ],
        }))
    const removeEdu = (id: number) =>
        setCvData((prev) => ({
            ...prev,
            education: prev.education.filter((e) => e.id !== id),
        }))
    const updateEdu = (id: number, field: string, value: string) =>
        setCvData((prev) => ({
            ...prev,
            education: prev.education.map((e) =>
                e.id === id ? { ...e, [field]: value } : e
            ),
        }))

    // Foto
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                // Resize básico si es muy grande para no explotar localStorage/Firestore
                updateField('photo', reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDownloadCV = async () => {
        await saveCV()
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
        if (!coverLetter.targetName) return
        if (!(await onUsage(1))) return
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('userId', userId || '')
            formData.append('cvData', JSON.stringify(cvData))
            formData.append('targetName', coverLetter.targetName)
            formData.append('targetPosition', coverLetter.targetPosition)
            const res = await fetch(
                `${BACKEND_URL}/api/generate-cover-letter`,
                { method: 'POST', body: formData }
            )
            const data = await res.json()
            if (data.success)
                setCoverLetter((prev) => ({ ...prev, content: data.text }))
        } catch (e) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Fallo al generar carta.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCover = () => {
        // Limpiar Markdown para clipboard
        const cleanText = coverLetter.content
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
        navigator.clipboard.writeText(cleanText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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

            {/* TAB SELECTOR RESPONSIVE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-brand-600" /> Constructor
                    CV
                </h2>
                <div className="flex w-full md:w-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'editor'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600'
                                : 'text-slate-500'
                        }`}
                    >
                        Editar CV
                    </button>
                    <button
                        onClick={() => setActiveTab('cover')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'cover'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600'
                                : 'text-slate-500'
                        }`}
                    >
                        Carta Presentación
                    </button>
                </div>
            </div>

            {activeTab === 'editor' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUMNA IZQUIERDA: EDITOR */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold dark:text-white">
                                    Datos Personales
                                </h3>
                                <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                    <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            </div>
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

                        {/* EXPERIENCIA */}
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
                                        className="absolute top-0 right-0 text-slate-300 hover:text-red-500"
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
                                        placeholder="Fechas"
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
                                        placeholder="Logros..."
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

                        {/* EDUCACIÓN (NUEVO) */}
                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-bold dark:text-white">
                                    Educación
                                </h3>
                                <button
                                    onClick={addEdu}
                                    className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded hover:bg-brand-200"
                                >
                                    + Agregar
                                </button>
                            </div>
                            {cvData.education.map((edu) => (
                                <div
                                    key={edu.id}
                                    className="mb-4 border-b pb-4 last:border-0 dark:border-slate-700 relative group"
                                >
                                    <button
                                        onClick={() => removeEdu(edu.id)}
                                        className="absolute top-0 right-0 text-slate-300 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                            placeholder="Título"
                                            value={edu.degree}
                                            onChange={(e) =>
                                                updateEdu(
                                                    edu.id,
                                                    'degree',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <input
                                            className="p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                            placeholder="Institución"
                                            value={edu.school}
                                            onChange={(e) =>
                                                updateEdu(
                                                    edu.id,
                                                    'school',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <input
                                        className="w-full p-2 border rounded text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        placeholder="Fechas"
                                        value={edu.dates}
                                        onChange={(e) =>
                                            updateEdu(
                                                edu.id,
                                                'dates',
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
                                placeholder="Lista tus habilidades..."
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
                                Guardar
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

                    {/* VISTA PREVIA ESCALABLE (NO SCROLL HORIZONTAL) */}
                    <div className="relative bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center min-h-[200px]">
                        {/* Contenedor escalado */}
                        <div className="origin-top scale-[0.45] md:scale-[0.55] lg:scale-[0.6] xl:scale-[0.7]">
                            <div
                                id="cv-preview"
                                className="bg-white text-slate-800 w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {/* Header */}
                                <div className="border-b-2 border-slate-800 pb-6 mb-6 flex gap-6 items-center">
                                    {cvData.photo && (
                                        <img
                                            src={cvData.photo}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-2 border-slate-100"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h1 className="text-4xl font-bold uppercase tracking-tight">
                                            {cvData.fullName || 'Tu Nombre'}
                                        </h1>
                                        <p className="text-xl text-slate-600 font-medium mt-1">
                                            {cvData.title ||
                                                'Título Profesional'}
                                        </p>
                                        <div className="flex gap-4 mt-3 text-sm text-slate-500 flex-wrap">
                                            {cvData.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />{' '}
                                                    {cvData.email}
                                                </span>
                                            )}
                                            {cvData.phone && (
                                                <span className="flex items-center gap-1">
                                                    {cvData.phone}
                                                </span>
                                            )}
                                            {cvData.address && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />{' '}
                                                    {cvData.address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen */}
                                {cvData.summary && (
                                    <div className="mb-8">
                                        <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-3 pb-1 text-sm tracking-wider">
                                            Perfil
                                        </h3>
                                        <p className="text-justify text-base leading-relaxed">
                                            {cvData.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Experiencia */}
                                <div className="mb-8">
                                    <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-4 pb-1 text-sm tracking-wider">
                                        Experiencia Profesional
                                    </h3>
                                    {cvData.experience.map((exp) => (
                                        <div key={exp.id} className="mb-5">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-lg">
                                                    {exp.role}
                                                </h4>
                                                <span className="text-sm text-slate-500 italic">
                                                    {exp.dates}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 font-medium text-base mb-2">
                                                {exp.company}
                                            </p>
                                            <p className="text-sm whitespace-pre-wrap text-slate-600 leading-relaxed">
                                                {exp.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Educación */}
                                {cvData.education.length > 0 &&
                                    cvData.education[0].degree && (
                                        <div className="mb-8">
                                            <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-4 pb-1 text-sm tracking-wider">
                                                Formación
                                            </h3>
                                            {cvData.education.map((edu) => (
                                                <div
                                                    key={edu.id}
                                                    className="mb-3"
                                                >
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-bold text-base">
                                                            {edu.degree}
                                                        </h4>
                                                        <span className="text-sm text-slate-500 italic">
                                                            {edu.dates}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm">
                                                        {edu.school}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                {/* Habilidades */}
                                {cvData.skills && (
                                    <div>
                                        <h3 className="font-bold uppercase text-slate-700 border-b border-slate-200 mb-3 pb-1 text-sm tracking-wider">
                                            Habilidades
                                        </h3>
                                        <p className="text-base leading-relaxed">
                                            {cvData.skills}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* TAB CARTA (Con Markdown Estilizado) */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 bg-white dark:bg-slate-800 space-y-4 h-fit">
                        {/* ... (Inputs de carta iguales) ... */}
                        <div>
                            <label className="text-xs font-bold uppercase dark:text-slate-400">
                                Nombre Recrutador
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
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase dark:text-slate-400">
                                Puesto
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

                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 relative">
                        {coverLetter.content && (
                            <button
                                onClick={handleCopyCover}
                                className="absolute top-4 right-4 text-brand-600 font-bold text-xs hover:underline flex items-center gap-1"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <Copy className="w-3 h-3" />
                                )}{' '}
                                {copied ? 'Copiado' : 'Copiar Limpio'}
                            </button>
                        )}

                        {coverLetter.content ? (
                            <div className="prose prose-slate dark:prose-invert whitespace-pre-wrap max-w-none text-sm">
                                {/* Markdown renderizado pero sin mostrar asteriscos */}
                                <ReactMarkdown
                                    components={{
                                        strong: ({ node, ...props }) => (
                                            <span
                                                className="font-bold text-slate-900 dark:text-white"
                                                {...props}
                                            />
                                        ),
                                    }}
                                >
                                    {coverLetter.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-center min-h-[300px]">
                                Completa los datos para generar tu carta.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
