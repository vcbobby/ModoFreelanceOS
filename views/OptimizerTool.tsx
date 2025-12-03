import React, { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Upload, Download, Zap, ArrowRight } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'

interface OptimizerToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const OptimizerTool: React.FC<OptimizerToolProps> = ({
    onUsage,
    userId,
}) => {
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [compressedFile, setCompressedFile] = useState<Blob | null>(null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setOriginalFile(event.target.files[0])
            setCompressedFile(null)
        }
    }

    const handleOptimize = async () => {
        if (!originalFile) return
        const canProceed = await onUsage(3)
        if (!canProceed) return

        setIsCompressing(true)
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            }
            const compressedBlob = await imageCompression(originalFile, options)
            setCompressedFile(compressedBlob)
        } catch (error) {
            console.error(error)
            alert('Error al comprimir.')
        } finally {
            setIsCompressing(false)
        }
    }

    const handleDownloadAndSave = async () => {
        if (!compressedFile || !originalFile) return
        setIsSaving(true)

        // DEBUG: Verificar si llega el usuario
        console.log('Intentando guardar historial. Usuario ID:', userId)

        if (userId) {
            const savedSize = (
                (originalFile.size - compressedFile.size) /
                1024
            ).toFixed(2)
            const percent = Math.round(
                ((originalFile.size - compressedFile.size) /
                    originalFile.size) *
                    100
            )

            try {
                await addDoc(collection(db, 'users', userId, 'history'), {
                    createdAt: new Date().toISOString(),
                    category: 'proposal',
                    clientName: originalFile.name, // Nombre del archivo como "Cliente"
                    platform: 'Image Optimizer',
                    type: 'Optimización',
                    content: `**Reporte de Ahorro:**\n- Peso Original: ${formatSize(
                        originalFile.size
                    )}\n- Peso Final: ${formatSize(
                        compressedFile.size
                    )}\n- **Espacio Ahorrado: ${savedSize} KB (${percent}%)**`,
                })
                console.log('Guardado en historial con éxito')
            } catch (e) {
                console.error('Error guardando historial:', e)
                alert('Error guardando en historial (revisa la consola)')
            }
        } else {
            console.warn('No se guardó en historial porque no hay userId')
        }

        // Descargar
        const link = document.createElement('a')
        link.href = URL.createObjectURL(compressedFile)
        link.download = `optimized-${originalFile.name}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setIsSaving(false)
    }

    const formatSize = (size: number) => (size / 1024 / 1024).toFixed(2) + ' MB'

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-brand-600" /> Optimizador de
                    Imágenes
                </h2>
                <p className="text-slate-600">
                    Reduce el peso de tus imágenes.{' '}
                    <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded">
                        Costo: 3 Créditos
                    </span>
                </p>
            </div>

            <Card className="p-8 shadow-md">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="font-bold text-slate-700">
                            {originalFile
                                ? originalFile.name
                                : 'Arrastra o selecciona una imagen'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {originalFile
                                ? formatSize(originalFile.size)
                                : 'Soporta JPG, PNG, WEBP'}
                        </p>
                    </div>
                </div>

                {originalFile && !compressedFile && (
                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={handleOptimize}
                            isLoading={isCompressing}
                            className="w-full md:w-auto"
                        >
                            {isCompressing
                                ? 'Comprimiendo...'
                                : 'Optimizar Ahora (3 Créditos)'}
                        </Button>
                    </div>
                )}

                {compressedFile && originalFile && (
                    <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <p className="text-xs text-slate-500 uppercase font-bold">
                                    Antes
                                </p>
                                <p className="font-bold text-slate-700">
                                    {formatSize(originalFile.size)}
                                </p>
                            </div>
                            <ArrowRight className="text-green-500 w-6 h-6" />
                            <div className="text-center md:text-right">
                                <p className="text-xs text-green-600 uppercase font-bold">
                                    Ahora
                                </p>
                                <p className="font-bold text-green-700">
                                    {formatSize(compressedFile.size)}
                                </p>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                                    -
                                    {Math.round(
                                        ((originalFile.size -
                                            compressedFile.size) /
                                            originalFile.size) *
                                            100
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handleDownloadAndSave}
                                disabled={isSaving}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <span>Guardando...</span>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />{' '}
                                        Descargar y Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
