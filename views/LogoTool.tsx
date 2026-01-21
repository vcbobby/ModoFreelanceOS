import React, { useState } from 'react'
import {
    Download,
    Palette,
    Wand2,
    PenLine,
    Loader2,
    Type,
    LayoutTemplate,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { downloadFile } from '../utils/downloadUtils'

interface LogoToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const LogoTool: React.FC<LogoToolProps> = ({ onUsage, userId }) => {
    const [name, setName] = useState('') // Nombre de la marca
    const [details, setDetails] = useState('') // Concepto / Detalles
    const [style, setStyle] = useState('Minimalista')

    const [generatedLogos, setGeneratedLogos] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })

    // URL Backend dinámica
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    const styles = [
        'Minimalista',
        'Tech/Moderno',
        'Vintage',
        'Geométrico',
        '3D Glossy',
        'Abstracto',
        'Lujo',
    ]

    const handleGenerate = async () => {
        if (!name) return

        // 1. Cobrar créditos
        const canProceed = await onUsage(2)
        if (!canProceed) return

        setIsGenerating(true)

        try {
            const formData = new FormData()
            formData.append('name', name) // Enviamos Nombre
            formData.append('details', details) // Enviamos Detalles
            formData.append('style', style)
            formData.append('userId', userId || 'anon')

            // 2. Petición al Backend
            const res = await fetch(
                `${BACKEND_URL}/api/generate-logo-backend`,
                {
                    method: 'POST',
                    body: formData,
                },
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || 'Error en el servidor')
            }

            if (data.success) {
                setGeneratedLogos((prev) => [data.url, ...prev])
            }
        } catch (error: any) {
            console.error('Error generando logo:', error)

            // 3. Reembolso si falla
            await onUsage(-2)

            setModal({
                isOpen: true,
                title: 'Error de Generación',
                message: `El servidor no pudo generar la imagen. Causa: ${error.message}. (Tus créditos han sido devueltos).`,
            })
        } finally {
            setIsGenerating(false)
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
                isDanger={true}
            />

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Palette className="w-8 h-8 text-brand-600" />
                    Diseñador de Logos Pro
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Potenciado por SDXL • Alta Resolución • Persistencia Cloud
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PANEL DE CONTROL */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 shadow-xl border-t-4 border-t-brand-500">
                        <div className="space-y-5">
                            {/* CAMPO 1: NOMBRE */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-brand-600" />
                                    Nombre de la Marca
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none font-bold"
                                    placeholder="Ej: Galaxy Coffee"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            {/* CAMPO 2: DETALLES (Agregado de nuevo) */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <PenLine className="w-4 h-4 text-brand-600" />
                                    Concepto / Detalles
                                </label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 text-sm resize-none"
                                    placeholder="Ej: Un astronauta sosteniendo una taza de café, fondo minimalista, colores azul neón..."
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                />
                            </div>

                            {/* CAMPO 3: ESTILO */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4 text-brand-600" />
                                    Estilo Visual
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {styles.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStyle(s)}
                                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${
                                                style === s
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-md transform scale-105'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                disabled={!name}
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-brand-500/20"
                            >
                                {isGenerating
                                    ? 'Renderizando...'
                                    : 'Generar Logo (2 Créditos)'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* GALERÍA DE RESULTADOS */}
                <div className="lg:col-span-2">
                    {generatedLogos.length === 0 && !isGenerating ? (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-900/50">
                            <Wand2 className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                Tu lienzo está vacío
                            </h3>
                            <p className="text-sm max-w-xs mt-2 opacity-70">
                                Describe tu marca a la izquierda y deja que la
                                Inteligencia Artificial cree algo único.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                            {/* SKELETON LOADING */}
                            {isGenerating && (
                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Wand2 className="w-4 h-4 text-brand-600" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 mt-4">
                                        Creando Arte HD...
                                    </span>
                                </div>
                            )}

                            {/* LOGOS GENERADOS */}
                            {generatedLogos.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 animate-in zoom-in-50 duration-300 slide-in-from-bottom-4"
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden relative bg-[url('https://res.cloudinary.com/dcmzo369v/image/upload/v1710000000/transparent-bg.png')] bg-repeat">
                                        <img
                                            src={url}
                                            alt="Logo generado"
                                            className="w-full h-full object-contain relative z-10"
                                        />
                                        {/* Overlay de descarga */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 backdrop-blur-[2px] gap-3">
                                            <button
                                                onClick={() =>
                                                    downloadFile(
                                                        url,
                                                        `logo-${name}-${idx}.jpg`,
                                                    )
                                                }
                                                className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />{' '}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 mt-1">
                                        <span className="text-xs font-mono text-slate-400">
                                            Variante #
                                            {generatedLogos.length - idx}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-bold">
                                            Flux/SDXL
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
