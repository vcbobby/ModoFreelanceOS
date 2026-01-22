import React, { useState } from 'react'
import {
    Download,
    Palette,
    Wand2,
    PenLine,
    Loader2,
    Type,
    LayoutTemplate,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { downloadFile } from '../utils/downloadUtils'

// Interfaz para el objeto de logo
interface LogoItem {
    id: string // ID único para React keys (importante para que no parpadee)
    url: string
}

interface LogoToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const LogoTool: React.FC<LogoToolProps> = ({ onUsage, userId }) => {
    const [name, setName] = useState('')
    const [details, setDetails] = useState('')
    const [style, setStyle] = useState('Minimalista')

    // Cambiamos a array de objetos para mejor control en React
    const [generatedLogos, setGeneratedLogos] = useState<LogoItem[]>([])
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
        '3D Glossy',
        'Abstracto',
        'Lujo',
    ]

    const handleGenerate = async () => {
        if (!name) return

        const canProceed = await onUsage(2)
        if (!canProceed) return

        setIsGenerating(true)

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('details', details)
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

            if (!res.ok) throw new Error(data.detail || 'Error servidor')

            if (data.success) {
                // Creamos un objeto con ID único
                const newLogo: LogoItem = {
                    id: Date.now().toString(),
                    url: data.url,
                }
                setGeneratedLogos((prev) => [newLogo, ...prev])
            }
        } catch (error: any) {
            console.error(error)
            await onUsage(-2) // Reembolso
            setModal({
                isOpen: true,
                title: 'Error',
                message:
                    'No se pudo iniciar la generación. Créditos reembolsados.',
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

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <PenLine className="w-4 h-4 text-brand-600" />
                                    Concepto / Detalles
                                </label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 text-sm resize-none"
                                    placeholder="Ej: Minimalista, colores azules..."
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                />
                            </div>

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
                                    ? 'Iniciando...'
                                    : 'Generar Logo (2 Créditos)'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* GALERÍA DE RESULTADOS */}
                <div className="lg:col-span-2">
                    {generatedLogos.length === 0 ? (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-900/50">
                            <Wand2 className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                Tu lienzo está vacío
                            </h3>
                            <p className="text-sm max-w-xs mt-2 opacity-70">
                                Describe tu marca y deja que la IA haga la
                                magia.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                            {/* Renderizamos cada tarjeta con su propio estado */}
                            {generatedLogos.map((item, idx) => (
                                <LogoCard
                                    key={item.id}
                                    url={item.url}
                                    index={generatedLogos.length - idx}
                                    name={name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTE INTELIGENTE: LogoCard ---
// Maneja su propio estado de carga y descarga
const LogoCard = ({
    url,
    index,
    name,
}: {
    url: string
    index: number
    name: string
}) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading',
    )
    const [downloading, setDownloading] = useState(false)

    // Función segura de descarga (Blob)
    const handleDownload = async () => {
        try {
            setDownloading(true)

            // Nombre de archivo limpio
            const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const filename = `logo-${safeName}-${index}.jpg`

            // Usamos la utilidad universal
            await downloadFile(url, filename)
        } catch (error) {
            console.error('Error descarga:', error)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="group relative bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 animate-in zoom-in-50 duration-300 slide-in-from-bottom-4">
            <div className="aspect-square rounded-lg overflow-hidden relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                {/* ESTADO DE CARGA (SKELETON) */}
                {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10 p-6 text-center">
                        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-3" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 animate-pulse">
                            Renderizando Píxeles...
                        </span>
                        <span className="text-xs text-slate-400 mt-2">
                            Esto puede tomar unos segundos.
                        </span>
                    </div>
                )}

                {/* ESTADO DE ERROR */}
                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10 text-center p-4">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-xs text-red-500">
                            Error al cargar imagen
                        </span>
                        <button
                            onClick={() => setStatus('loading')} // Reintento simple (recarga el src)
                            className="mt-2 text-xs underline text-slate-500"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* IMAGEN REAL */}
                <img
                    src={url}
                    alt={`Logo generado ${index}`}
                    className={`w-full h-full object-contain transition-opacity duration-500 ${
                        status === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => {
                        // A veces da error 404 momentáneo, reintentamos en 3 segs
                        setTimeout(() => {
                            const img = new Image()
                            img.src = url
                            img.onload = () => setStatus('loaded')
                        }, 3000)
                    }}
                />

                {/* OVERLAY DE DESCARGA (Solo visible al cargar) */}
                {status === 'loaded' && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70"
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {downloading ? 'Guardando...' : 'Descargar'}
                        </button>
                    </div>
                )}
            </div>

            {/* PIE DE TARJETA */}
            <div className="p-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 mt-1">
                <span className="text-xs font-mono text-slate-400">
                    Variante #{index}
                </span>
                {status === 'loaded' ? (
                    <span className="text-[10px] uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Listo
                    </span>
                ) : (
                    <span className="text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                        Procesando
                    </span>
                )}
            </div>
        </div>
    )
}
