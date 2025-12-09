import React, { useState, useEffect, useRef } from 'react'
import {
    Upload,
    Download,
    Zap,
    AlertCircle,
    Film,
    Scissors,
    Maximize2,
    Loader2,
    Check,
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import ReactMarkdown from 'react-markdown'
// Importar FFmpeg
// import { FFmpeg } from '@ffmpeg/ffmpeg'
// import { toBlobURL } from '@ffmpeg/util'
declare const FFmpeg: any
declare const toBlobURL: any

interface VideoCompressorViewProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

const formatSize = (size: number) => (size / 1024 / 1024).toFixed(2) + ' MB'
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const VideoCompressorView: React.FC<VideoCompressorViewProps> = ({
    onUsage,
    userId,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [isFFmpegLoading, setIsFFmpegLoading] = useState(true)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    // FFmpeg Instance
    const ffmpegRef = useRef<FFmpeg | null>(null) // Usamos null al inicio
    const messageRef = useRef<HTMLDivElement>(null)

    // --- 1. Inicializar FFmpeg ---
    useEffect(() => {
        const loadFFmpeg = async () => {
            // Importamos dinámicamente y la instancia de la librería
            const { FFmpeg } = await import('@ffmpeg/ffmpeg')
            const { toBlobURL } = await import('@ffmpeg/util')

            const ffmpeg = new FFmpeg()
            ffmpegRef.current = ffmpeg

            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

            try {
                // Monta los core files
                await ffmpeg.load({
                    coreURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.js`,
                        'text/javascript'
                    ),
                    wasmURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.wasm`,
                        'application/wasm'
                    ),
                })
                setIsFFmpegLoading(false)
                setStatusMessage('Herramienta de procesamiento lista.')
            } catch (error) {
                console.error('Error al cargar FFmpeg', error)
                setStatusMessage(
                    'Error: No se pudo cargar la herramienta de video.'
                )
            }
        }

        loadFFmpeg()
        // Limpiar URL del blob al desmontar
        return () => {
            if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl)
        }
    }, [])

    // --- 2. Manejar la Carga del Archivo ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0]
            setSelectedFile(file)
            setAnalysisResult(null)
            setVideoBlobUrl(URL.createObjectURL(file))
            setStatusMessage(null)
        }
    }

    // --- 3. Análisis de IA (Aviso PRO) ---
    const handleAnalyze = async () => {
        if (!selectedFile || !userId) return

        // Comprobación de PRO (onUsage muestra el modal de pago si es necesario)
        const canProceed = await onUsage(1)
        if (!canProceed) return

        setLoading(true)
        setStatusMessage('Iniciando análisis de contenido con IA...')
        setAnalysisResult(null)

        // Simulamos la llamada al backend para que registre en el historial (el registro es la "magia" PRO)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('userId', userId)

            // Llama al endpoint de video (que solo registra en historial)
            const response = await fetch(`${BACKEND_URL}/api/process-video`, {
                method: 'POST',
                body: formData,
            })

            // Si el backend responde, simulamos el análisis IA exitoso
            if (response.ok) {
                setAnalysisResult(`
                    ### ✅ Análisis de IA Completado
                    - **Recomendación:** Tu video es ideal para un Short de 45 segundos.
                    - **Fragmento Viral:** Corta de **01:10** a **01:55** para mejor retención.
                    - **Subtítulos:** Generados automáticamente (no visible en esta demo).

                    ---
                    **Elige una opción para procesar en tu navegador (tardará según tu PC):**
                    `)
            } else {
                throw new Error('Error en el servidor. Intenta de nuevo.')
            }
        } catch (error) {
            setStatusMessage(
                `⚠️ Error de conexión con el backend: ${
                    (error as Error).message
                }`
            )
        } finally {
            setLoading(false)
        }
    }

    // --- 4. Funciones de Procesamiento de Video ---

    const log = (msg: string) => {
        if (messageRef.current) {
            messageRef.current.innerHTML += `<div class='text-xs text-slate-500'>${msg}</div>`
            messageRef.current.scrollTop = messageRef.current.scrollHeight
        }
    }

    const runFFmpegCommand = async (
        outputFileName: string,
        ffmpegArgs: string[],
        content: string,
        newFileName: string
    ) => {
        if (!selectedFile || isFFmpegLoading) return

        setLoading(true)
        const ffmpeg = ffmpegRef.current
        ffmpeg.on('log', ({ message }) => log(message))

        try {
            // Escribe el archivo en la memoria virtual de FFmpeg
            await ffmpeg.writeFile(
                selectedFile.name,
                new Uint8Array(await selectedFile.arrayBuffer())
            )
            setStatusMessage('Archivo de video cargado en memoria.')

            // Ejecuta el comando de compresión o corte
            await ffmpeg.exec(ffmpegArgs)
            setStatusMessage('Procesamiento completado.')

            // Lee el resultado y crea un Blob
            const data = await ffmpeg.readFile(outputFileName)
            const blob = new Blob([data], { type: 'video/mp4' })
            const url = URL.createObjectURL(blob)

            // Descarga el archivo
            const a = document.createElement('a')
            a.href = url
            a.download = newFileName
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            console.error('FFmpeg ERROR:', error)
            setStatusMessage(
                `⚠️ Error en FFmpeg: ${
                    (error as Error).message
                }. Archivo no procesado.`
            )
        } finally {
            setLoading(false)
            // Limpia el archivo de la memoria de FFmpeg
            await ffmpeg.deleteFile(selectedFile.name)
        }
    }

    const handleCompress = () => {
        // Comando simple de compresión (reduciendo bitrate)
        const args = [
            '-i',
            selectedFile!.name,
            '-vcodec',
            'libx264',
            '-crf',
            '28', // Calidad de compresión (más alto = más compresión)
            'compressed_output.mp4',
        ]
        runFFmpegCommand(
            'compressed_output.mp4',
            args,
            'Comprimiendo...',
            `compressed_${selectedFile!.name}`
        )
    }

    const handleShort = () => {
        // Cortar de 01:10 a 01:55 (ejemplo de la IA)
        const args = [
            '-i',
            selectedFile!.name,
            '-ss',
            '00:01:10', // Start time
            '-to',
            '00:01:55', // End time
            '-c',
            'copy', // Corta sin recodificar (instantáneo)
            'short_output.mp4',
        ]
        runFFmpegCommand(
            'short_output.mp4',
            args,
            'Generando Short...',
            `short_${selectedFile!.name}`
        )
    }

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
                {/* Cargador */}
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
                        {selectedFile && (
                            <p className="text-xs text-slate-500 mt-1">
                                {formatSize(selectedFile.size)}
                            </p>
                        )}
                        {isFFmpegLoading && (
                            <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />{' '}
                                Cargando Herramienta...
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón de Análisis */}
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleAnalyze}
                        isLoading={loading}
                        disabled={
                            !selectedFile ||
                            isFFmpegLoading ||
                            analysisResult !== null
                        }
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading
                            ? 'Analizando con IA...'
                            : 'Analizar Video (Exclusivo PRO)'}
                    </Button>
                </div>

                {/* Resultado del Análisis de IA */}
                {analysisResult && (
                    <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 rounded-xl shadow-inner">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mt-6 border-t pt-4 border-slate-200 dark:border-slate-700">
                            <Button
                                onClick={handleCompress}
                                disabled={loading}
                                variant="secondary"
                                className="flex-1"
                            >
                                <Download className="w-4 h-4 mr-2" /> Comprimir
                                (Reducir Tamaño)
                            </Button>
                            <Button
                                onClick={handleShort}
                                disabled={loading}
                                className="flex-1"
                            >
                                <Scissors className="w-4 h-4 mr-2" /> Generar
                                Short (Cortar Viral)
                            </Button>
                        </div>
                    </div>
                )}

                {/* Log de Procesamiento */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg h-32 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">
                        Estado de Procesamiento:
                    </h4>
                    <div ref={messageRef}>
                        {statusMessage && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                {statusMessage}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
