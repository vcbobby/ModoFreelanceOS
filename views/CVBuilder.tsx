import React, { useState, useEffect } from 'react'
import {
    User,
    Mail,
    MapPin,
    Trash2,
    Download,
    FileText,
    Camera,
    Plus,
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
    const [cvData, setCvData] = useState({
        fullName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        photo: '',
        experience: [{ id: 1, role: '', company: '', dates: '', desc: '' }],
        education: [{ id: 1, degree: '', school: '', dates: '' }],
        skills: '',
    })

    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })

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
                e.id === id ? { ...e, [field]: value } : e,
            ),
        }))

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
                e.id === id ? { ...e, [field]: value } : e,
            ),
        }))

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => updateField('photo', reader.result)
            reader.readAsDataURL(file)
        }
    }

    const handleDownloadCV = async () => {
        await saveCV()
        const element = document.getElementById('cv-preview')

        // CONFIGURACIÓN AJUSTADA PARA QUE NO CORTE
        const opt = {
            margin: 0, // Usamos margin 0 porque el padding ya está en el CSS del div
            filename: `CV-${cvData.fullName.replace(/\s+/g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                // IMPORTANTE: No fijar windowWidth aquí para que tome el del elemento real
                scrollY: 0,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
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

    return (
        <div className="max-w-7xl mx-auto pb-20">
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
                    CV
                </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* COLUMNA IZQUIERDA: EDITOR */}
                <div className="space-y-6">
                    {/* ... (Tus cards de inputs siguen igual, no cambiaron) ... */}
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
                                                e.target.value,
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
                                                e.target.value,
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
                                            e.target.value,
                                        )
                                    }
                                />
                                <textarea
                                    className="w-full p-2 border rounded text-sm h-20 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Descripción..."
                                    value={exp.desc}
                                    onChange={(e) =>
                                        updateExp(
                                            exp.id,
                                            'desc',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </Card>

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
                                    className="absolute top-0 right-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
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
                                                e.target.value,
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
                                                e.target.value,
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
                                            e.target.value,
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
                            placeholder="Habilidades..."
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
                        <Button onClick={handleDownloadCV} className="flex-1">
                            <Download className="w-4 h-4 mr-2" /> Descargar PDF
                        </Button>
                    </div>
                </div>

                {/* VISTA PREVIA (DERECHA) - RE-CORREGIDA */}
                <div className="relative bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-[600px] md:h-[850px] shadow-inner">
                    <div className="bg-slate-300 dark:bg-slate-800 p-2 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 z-10 relative">
                        Vista Previa (A4)
                    </div>

                    {/* CONTENEDOR CON SCROLL ESTILIZADO */}
                    {/* Agregamos clases [&::-webkit-scrollbar] para estilizar las barras */}
                    <div
                        className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/50 p-2 md:p-8 flex justify-center items-start
                        scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent scrollbar-thumb-rounded-full
                        [&::-webkit-scrollbar]:w-2 
                        [&::-webkit-scrollbar]:h-2
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-slate-300 
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                    >
                        {/* WRAPPER DE ESCALA RESPONSIVA */}
                        {/* Quitamos el 'transform' inline para que las clases 'scale' funcionen */}
                        {/* scale-[0.4] en móvil arregla el corte izquierdo */}
                        <div className="origin-top transform-gpu transition-transform duration-300 scale-[0.4] sm:scale-[0.55] md:scale-[0.6] lg:scale-[0.65] xl:scale-[0.75]">
                            <div
                                id="cv-preview"
                                className="bg-white text-slate-800 shadow-2xl mx-auto box-border"
                                style={{
                                    width: '210mm', // Ancho A4
                                    minHeight: '297mm', // Alto A4
                                    // AUMENTADO padding-top a 20mm (antes 15mm) para más margen superior
                                    padding: '20mm 15mm 15mm 15mm',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '11pt',
                                    lineHeight: '1.5',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                {/* Header */}
                                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex gap-8 items-center page-break-inside-avoid">
                                    {cvData.photo && (
                                        <img
                                            src={cvData.photo}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-sm shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight mb-1">
                                            {cvData.fullName || 'Tu Nombre'}
                                        </h1>
                                        <p className="text-xl text-brand-700 font-medium mb-3">
                                            {cvData.title ||
                                                'Título Profesional'}
                                        </p>
                                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600">
                                            {cvData.email && (
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-4 h-4 text-brand-600" />{' '}
                                                    {cvData.email}
                                                </span>
                                            )}
                                            {cvData.phone && (
                                                <span className="flex items-center gap-1.5">
                                                    Tel: {cvData.phone}
                                                </span>
                                            )}
                                            {cvData.address && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-brand-600" />{' '}
                                                    {cvData.address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                {cvData.summary && (
                                    <div className="mb-8 page-break-inside-avoid">
                                        <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-3 pb-1 text-sm tracking-widest">
                                            Perfil
                                        </h3>
                                        <p className="text-justify text-sm text-slate-700">
                                            {cvData.summary}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-4 pb-1 text-sm tracking-widest page-break-after-avoid">
                                        Experiencia Profesional
                                    </h3>
                                    {cvData.experience.map((exp) => (
                                        <div
                                            key={exp.id}
                                            className="mb-6 last:mb-0 page-break-inside-avoid"
                                        >
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-base text-slate-900">
                                                    {exp.role}
                                                </h4>
                                                <span className="text-xs text-slate-500 font-medium italic shrink-0 ml-4 bg-slate-100 px-2 py-0.5 rounded">
                                                    {exp.dates}
                                                </span>
                                            </div>
                                            <p className="text-brand-700 font-semibold text-sm mb-2">
                                                {exp.company}
                                            </p>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap text-justify">
                                                {exp.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {cvData.education.length > 0 &&
                                    cvData.education[0].degree && (
                                        <div className="mb-8 page-break-inside-avoid">
                                            <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-4 pb-1 text-sm tracking-widest">
                                                Formación
                                            </h3>
                                            {cvData.education.map((edu) => (
                                                <div
                                                    key={edu.id}
                                                    className="mb-3 page-break-inside-avoid"
                                                >
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="font-bold text-sm text-slate-900">
                                                            {edu.degree}
                                                        </h4>
                                                        <span className="text-xs text-slate-500 italic shrink-0 ml-4">
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

                                {cvData.skills && (
                                    <div className="page-break-inside-avoid">
                                        <h3 className="font-bold uppercase text-slate-900 border-b-2 border-slate-100 mb-3 pb-1 text-sm tracking-widest">
                                            Habilidades
                                        </h3>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {cvData.skills}
                                        </p>
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
