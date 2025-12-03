import React, { useState, useEffect, useRef } from 'react'
import {
    Download,
    Palette,
    RefreshCw,
    Image as ImageIcon,
    AlertCircle,
    Wand2,
    PenLine,
    Type,
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'

interface LogoToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const LogoTool: React.FC<LogoToolProps> = ({ onUsage, userId }) => {
    const [prompt, setPrompt] = useState('')
    const [details, setDetails] = useState('')
    const [style, setStyle] = useState('Minimalista')
    const [noText, setNoText] = useState(false)

    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImages, setGeneratedImages] = useState<
        { url: string; id: string }[]
    >([])

    const styles = [
        'Minimalista',
        'Tech/Moderno',
        'Vintage/Retro',
        'Geométrico',
        '3D Glossy',
        'Abstracto',
        'Elegante/Lujo',
    ]

    const handleGenerate = async () => {
        if (!prompt) return

        const canProceed = await onUsage(2)
        if (!canProceed) return

        setIsGenerating(true)
        setGeneratedImages([])

        setTimeout(() => {
            try {
                const newImages = []

                const userDetails = details
                    ? `, featuring elements: ${details}`
                    : ''
                let enhancedPrompt = ''

                // --- LÓGICA DE PROMPT CAMBIADA ---
                if (noText) {
                    // ESTRATEGIA SIN TEXTO:
                    // 1. No usamos la palabra "brand name" para que no intente escribirlo.
                    // 2. Usamos "pictorial symbol" o "icon representing".
                    // 3. Agregamos instrucciones negativas agresivas contra el texto.
                    enhancedPrompt = `pictorial vector symbol representing the concept of "${prompt}"${userDetails}, style ${style}, NO TEXT, no letters, no typography, no words, visual icon only, standalone graphic, white background, high quality, centered, vector art`
                } else {
                    // ESTRATEGIA CON TEXTO:
                    // Forzamos a que escriba el nombre.
                    const textInstruction = `, with the text "${prompt}" written clearly, bold typography, perfect spelling, legible font`
                    enhancedPrompt = `professional vector logo for brand "${prompt}"${userDetails}${textInstruction}, style ${style}, clean lines, minimalist, on white background, high quality, centered, no realistic photo details`
                }

                const safePrompt = encodeURIComponent(enhancedPrompt)
                const timestamp = Date.now()

                for (let i = 0; i < 3; i++) {
                    const seed = Math.floor(Math.random() * 9999999)
                    // Mantenemos nologo=true como refuerzo
                    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?seed=${seed}&width=1024&height=1024&nologo=true&model=flux&enhance=true&t=${timestamp}`

                    newImages.push({
                        url: imageUrl,
                        id: `img-${timestamp}-${i}-${seed}`,
                    })
                }

                setGeneratedImages(newImages)
                setIsGenerating(false)
            } catch (error) {
                console.error(error)
                setIsGenerating(false)
            }
        }, 100)
    }

    const downloadImage = async (url: string, index: number) => {
        if (userId) {
            try {
                await addDoc(collection(db, 'users', userId, 'history'), {
                    createdAt: new Date().toISOString(),
                    category: 'logo', // Marcamos que es un logo
                    clientName: prompt, // Nombre de la marca
                    platform: 'Logo Creator',
                    type: style, // El estilo visual (Minimalista, etc)
                    content: details || 'Sin detalles adicionales', // Descripción
                    imageUrl: url, // Guardamos la URL para verlo después
                })
            } catch (e) {
                console.error('Error guardando en historial', e)
            }
        }

        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `logo-modofreelance-${index}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            window.open(url, '_blank')
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-6 h-6 text-brand-600" />
                    Generador de Logos IA (Beta)
                </h2>
                <p className="text-slate-600 mt-1">
                    Crea logotipos usando el modelo <strong>Flux</strong>.
                    <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded ml-2">
                        Costo: 2 Créditos
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PANEL DE CONTROL */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 shadow-md sticky top-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Nombre de la Marca
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Ej: Aroma..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>

                            <div
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                                    noText
                                        ? 'bg-brand-50 border-brand-200'
                                        : 'bg-slate-50 border-slate-200'
                                }`}
                                onClick={() => setNoText(!noText)}
                            >
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        noText
                                            ? 'bg-brand-600 border-brand-600'
                                            : 'bg-white border-slate-300'
                                    }`}
                                >
                                    {noText && (
                                        <Type className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-slate-700 select-none">
                                        Solo Icono (Sin texto)
                                    </span>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                        Genera un símbolo limpio para editar
                                        después.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <PenLine className="w-4 h-4" /> Detalles
                                    (Opcional)
                                </label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24 text-sm resize-none"
                                    placeholder="Ej: Una taza de café humeante, colores azul y dorado..."
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Estilo Visual
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {styles.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStyle(s)}
                                            className={`p-2 text-xs font-medium rounded-lg border transition-all ${
                                                style === s
                                                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100 flex gap-2">
                                <Wand2 className="w-4 h-4 shrink-0" />
                                <p>
                                    Consejo: Si la IA escribe mal tu nombre,
                                    activa "Solo Icono" y agrégalo tú mismo.
                                </p>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                isLoading={isGenerating}
                                disabled={!prompt}
                                className="w-full mt-2"
                            >
                                {isGenerating
                                    ? 'Diseñando...'
                                    : 'Generar 3 Variantes'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* RESULTADOS */}
                <div className="lg:col-span-2">
                    {generatedImages.length === 0 && !isGenerating ? (
                        <div className="h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 text-center p-6">
                            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                            <p className="font-medium text-slate-600">
                                Comienza a diseñar tu logo
                            </p>
                            <p className="text-sm mt-1">
                                Ingresa el nombre de la marca y describe tus
                                ideas.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {generatedImages.map((imgData, idx) => (
                                <AutoRetryImage
                                    key={imgData.id}
                                    src={imgData.url}
                                    idx={idx}
                                    onDownload={() =>
                                        downloadImage(imgData.url, idx)
                                    }
                                />
                            ))}

                            {isGenerating &&
                                generatedImages.length === 0 &&
                                Array(3)
                                    .fill(0)
                                    .map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square bg-slate-100 rounded-xl animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2"
                                        >
                                            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
                                            <span className="text-xs font-medium">
                                                Creando Arte Vectorial...
                                            </span>
                                        </div>
                                    ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const AutoRetryImage = ({
    src,
    idx,
    onDownload,
}: {
    src: string
    idx: number
    onDownload: () => void
}) => {
    const [imgSrc, setImgSrc] = useState(src)
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading'
    )
    const retryCount = useRef(0)
    const MAX_RETRIES = 8

    useEffect(() => {
        setImgSrc(src)
        setStatus('loading')
        retryCount.current = 0
    }, [src])

    const handleError = () => {
        if (retryCount.current < MAX_RETRIES) {
            retryCount.current += 1
            const timeout = 2000 + retryCount.current * 1000

            setTimeout(() => {
                setImgSrc((prev) => {
                    const separator = prev.includes('?') ? '&' : '?'
                    return `${src}${separator}retry=${Date.now()}`
                })
            }, timeout)
        } else {
            setStatus('error')
        }
    }

    return (
        <div className="group relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden relative flex items-center justify-center">
                {status === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-50 z-10 p-4 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-brand-600" />
                        <span className="text-xs font-bold animate-pulse">
                            Generando Alta Calidad...
                        </span>
                        <span className="text-[10px] mt-1 text-slate-400">
                            Intento {retryCount.current + 1}/{MAX_RETRIES}
                        </span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center bg-white z-20">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium mb-2">
                            Servidor saturado
                        </span>
                        <button
                            onClick={() => {
                                retryCount.current = 0
                                handleError()
                                setStatus('loading')
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Reintentar
                        </button>
                    </div>
                )}
                <img
                    src={imgSrc}
                    alt={`Logo ${idx}`}
                    className={`w-full h-full object-contain p-2 transition-opacity duration-700 ${
                        status === 'loaded' ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setStatus('loaded')}
                    onError={handleError}
                />
                {status === 'loaded' && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 backdrop-blur-[2px]">
                        <button
                            onClick={onDownload}
                            className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand-50 shadow-lg transform hover:scale-105 transition-all"
                        >
                            <Download className="w-4 h-4" /> Descargar HD
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
