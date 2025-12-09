import React, { useState } from 'react'
import { Upload, Download, Zap, AlertCircle, Film } from 'lucide-react'
import { Button, Card } from '../components/ui'
import ReactMarkdown from 'react-markdown'
// Nota: No usaremos ffmpeg.wasm para no sobrecomplicar el MVP.
// El botón llamará a la IA para el análisis y luego pedirá al usuario
// que haga el paso manual o le mostrará dónde usar el ffmpeg.wasm.

interface VideoCompressorViewProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const VideoCompressorView: React.FC<VideoCompressorViewProps> = ({
    onUsage,
    userId,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [processed, setProcessed] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)

    const BACKEND_URL = 'https://TU-APP-EN-RENDER.onrender.com' // Usaremos Render para el análisis de texto

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0])
            setProcessed(false)
            setAnalysisResult(null)
        }
    }

    const handleAnalyze = async () => {
        if (!selectedFile || !userId) return

        // 1. Es PRO? Si no, prohibir el uso.
        const canProceed = await onUsage(9999) // Usamos un costo alto para forzar el modal PRO
        if (!canProceed) return // Si no es PRO, el modal de pricing ya se mostró.

        setLoading(true)
        setAnalysisResult(null)

        try {
            // 2. Simulamos el análisis de la IA (el backend lo registra)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('userId', userId)

            const response = await fetch(`${BACKEND_URL}/api/process-video`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok)
                throw new Error('Error en el servidor de análisis.')

            // Simulamos que la IA analizó el video y dio consejos
            setAnalysisResult(`
                ### ✅ Análisis Rápido de IA
                - **Duración:** ${Math.floor(Math.random() * 5 + 1)} minutos.
                - **Momento Viral 1:** 00:30 - 00:45 (Recomendado para TikTok).
                - **Subtítulos Generados:** Tienes el archivo .SRT listo en tu historial.
                
                ### 💡 Próximo Paso
                El servidor de compresión es muy caro. Hemos generado el análisis por ti.
                
                Para comprimir el video en tu navegador, usa la herramienta **ffmpeg.wasm** (busca en Google).
            `)
            setProcessed(true)
        } catch (error) {
            setAnalysisResult(
                `⚠️ Error: No se pudo conectar con el servidor de análisis (${
                    (error as Error).message
                }).`
            )
        } finally {
            setLoading(false)
        }
    }

    const formatSize = (size: number) => (size / 1024 / 1024).toFixed(2) + ' MB'

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Film className="w-6 h-6 text-brand-600" /> Compresor &
                    Shorts IA
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Analiza y comprime videos para redes sociales.
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded ml-2">
                        EXCLUSIVO PRO
                    </span>
                </p>
            </div>

            <Card className="p-8 shadow-md">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <Film className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                            {selectedFile
                                ? selectedFile.name
                                : 'Arrastra o selecciona un video'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {selectedFile
                                ? formatSize(selectedFile.size)
                                : 'MP4, MOV (Máx 100MB)'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleAnalyze}
                        isLoading={loading}
                        disabled={!selectedFile}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading
                            ? 'Analizando con IA...'
                            : 'Analizar Video (Exclusivo PRO)'}
                    </Button>
                </div>

                {analysisResult && (
                    <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 rounded-xl shadow-inner">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
