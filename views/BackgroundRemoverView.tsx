import React, { useState } from 'react'
import {
    Upload,
    Image as ImageIcon,
    ArrowRight,
    Download,
    Eraser,
    AlertCircle,
} from 'lucide-react'
import { Button, Card } from '../components/ui'

interface BackgroundRemoverViewProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const BackgroundRemoverView: React.FC<BackgroundRemoverViewProps> = ({
    onUsage,
    userId,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [processedUrl, setProcessedUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // URL de tu Backend (Cámbialo cuando subas a Render)
    const BACKEND_URL = 'https://backend-freelanceos.onrender.com'

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            setProcessedUrl(null)
            setError(null)
        }
    }

    const handleProcess = async () => {
        if (!selectedFile || !userId) return

        // 1. Cobrar Créditos
        const canProceed = await onUsage(2)
        if (!canProceed) return

        setLoading(true)
        setError(null)

        try {
            // 2. Preparar datos para enviar a Python
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('userId', userId) // Importante para el historial

            // 3. Enviar al Backend
            const response = await fetch(`${BACKEND_URL}/api/remove-bg`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error al conectar con el servidor de IA.')
            }

            const data = await response.json()

            if (data.success) {
                setProcessedUrl(data.url)
            } else {
                throw new Error('No se pudo procesar la imagen.')
            }
        } catch (err: any) {
            console.error(err)
            setError(
                'Error: Asegúrate de que el backend (main.py) esté corriendo.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Eraser className="w-6 h-6 text-brand-600" /> Eliminador de
                    Fondos IA
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Sube una imagen y la IA recortará el sujeto automáticamente.
                    <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded ml-2">
                        Costo: 2 Créditos
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* ZONA DE CARGA */}
                <Card className="p-6 h-full flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">
                        Imagen Original
                    </h3>

                    {!previewUrl ? (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex-1 min-h-[300px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="w-10 h-10 text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Haz clic para subir imagen
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                JPG, PNG hasta 5MB
                            </p>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 min-h-[300px] flex items-center justify-center">
                            <img
                                src={previewUrl}
                                alt="Original"
                                className="max-w-full max-h-[300px] object-contain"
                            />
                            <button
                                onClick={() => {
                                    setSelectedFile(null)
                                    setPreviewUrl(null)
                                    setProcessedUrl(null)
                                }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                            >
                                <Upload className="w-4 h-4 rotate-45" />{' '}
                                {/* Icono X simulado */}
                            </button>
                        </div>
                    )}

                    <div className="mt-6">
                        <Button
                            onClick={handleProcess}
                            disabled={!selectedFile || loading}
                            isLoading={loading}
                            className="w-full"
                        >
                            {loading
                                ? 'Procesando en el Servidor...'
                                : 'Eliminar Fondo (2 Créditos)'}
                        </Button>
                        {error && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>
                </Card>

                {/* ZONA DE RESULTADO */}
                <Card className="p-6 h-full flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">
                        Resultado IA
                    </h3>

                    <div
                        className={`border-2 border-slate-200 dark:border-slate-700 rounded-xl flex-1 min-h-[300px] flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] transition-all ${
                            processedUrl ? 'opacity-100' : 'opacity-50'
                        }`}
                    >
                        {processedUrl ? (
                            <img
                                src={processedUrl}
                                alt="Procesada"
                                className="max-w-full max-h-[300px] object-contain animate-in zoom-in duration-300"
                            />
                        ) : (
                            <div className="text-slate-400 dark:text-slate-500 text-center p-6">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                    La imagen sin fondo aparecerá aquí.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <Button
                            onClick={() => window.open(processedUrl!, '_blank')}
                            disabled={!processedUrl}
                            variant="secondary"
                            className="w-full"
                        >
                            <Download className="w-4 h-4 mr-2" /> Descargar PNG
                        </Button>
                        {processedUrl && (
                            <p className="text-xs text-center text-slate-500 mt-2">
                                ✅ Guardado automáticamente en tu historial
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
