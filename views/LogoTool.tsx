import React, { useState } from 'react'
import { Download, Palette, Wand2, PenLine, Loader2, Type } from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { downloadFile } from '../utils/downloadUtils'

interface LogoToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const LogoTool: React.FC<LogoToolProps> = ({ onUsage, userId }) => {
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState('Minimalista')

    // Ahora guardamos un historial local de la sesión
    const [generatedLogos, setGeneratedLogos] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    const styles = [
        'Minimalista',
        'Tech/Moderno',
        'Vintage',
        'Geométrico',
        '3D',
        'Abstracto',
        'Lujo',
    ]

    const handleGenerate = async () => {
        if (!prompt) return

        // Costo: 2 créditos por 1 logo de alta calidad
        const canProceed = await onUsage(2)
        if (!canProceed) return

        setIsGenerating(true)

        try {
            const formData = new FormData()
            formData.append('prompt', prompt)
            formData.append('style', style)
            formData.append('userId', userId || 'anon')

            const res = await fetch(
                `${BACKEND_URL}/api/generate-logo-backend`,
                {
                    method: 'POST',
                    body: formData,
                },
            )
            const data = await res.json()

            if (data.success) {
                // Añadimos el nuevo logo al principio de la lista
                setGeneratedLogos((prev) => [data.url, ...prev])
            } else {
                throw new Error('Error en el servidor')
            }
        } catch (error) {
            console.error(error)
            // Reembolso (opcional)
            await onUsage(-2)
            setModal({
                isOpen: true,
                title: 'Error',
                message:
                    'El servidor de IA está ocupado. Intenta de nuevo en unos segundos. (Créditos reembolsados)',
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
                    IA Avanzada (SDXL) • Persistencia en Nube • Alta Resolución
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PANEL DE CONTROL */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 shadow-xl border-t-4 border-t-brand-500">
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                                    Nombre / Concepto
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Ej: Cafetería Espacial..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                                    Estilo Visual
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {styles.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStyle(s)}
                                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${
                                                style === s
                                                    ? 'bg-brand-600 text-white border-brand-600 shadow-md'
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
                                disabled={!prompt}
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
                        <div className="h-full min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-900/50">
                            <Wand2 className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                Tu lienzo está vacío
                            </h3>
                            <p className="text-sm">
                                Define tu marca y deja que la IA haga la magia.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SKELETON LOADING */}
                            {isGenerating && (
                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-3" />
                                    <span className="text-sm font-medium text-slate-500">
                                        Creando Arte...
                                    </span>
                                </div>
                            )}

                            {/* LOGOS GENERADOS */}
                            {generatedLogos.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 animate-in zoom-in-50 duration-300"
                                >
                                    <div className="aspect-square rounded-lg overflow-hidden relative">
                                        <img
                                            src={url}
                                            alt="Logo generado"
                                            className="w-full h-full object-contain bg-slate-50 dark:bg-black/20"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button
                                                onClick={() =>
                                                    downloadFile(
                                                        url,
                                                        `logo-${idx}.jpg`,
                                                    )
                                                }
                                                className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                            >
                                                <Download className="w-5 h-5" />{' '}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-400">
                                            Variante #
                                            {generatedLogos.length - idx}
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                            HD
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
