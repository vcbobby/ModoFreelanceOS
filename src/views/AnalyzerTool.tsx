import React, { useState } from 'react'
import {
    Upload,
    Search,
    AlertTriangle,
    List,
    CheckCircle,
    FileSearch,
    RefreshCw,
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { extractTextFromPdf } from '../utils/pdfUtils'
import { analyzeDocument } from '../services/geminiService'
import ReactMarkdown from 'react-markdown'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ConfirmationModal } from '../components/ui/ConfirmationModal'

interface AnalyzerToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const AnalyzerTool: React.FC<AnalyzerToolProps> = ({
    onUsage,
    userId,
}) => {
    const [file, setFile] = useState<File | null>(null)
    const [text, setText] = useState('')
    const [analysis, setAnalysis] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [mode, setMode] = useState<
        'resumen' | 'riesgos' | 'accion' | 'mejora'
    >('resumen')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        action: () => {},
        isDanger: false,
        singleButton: false,
    })

    const showModal = (
        title: string,
        message: string,
        action: () => void = () => {},
        isDanger = false,
        singleButton = true,
    ) => {
        setModalConfig({ title, message, action, isDanger, singleButton })
        setIsModalOpen(true)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return
        setFile(selectedFile)
        setAnalysis('')
        setText('')
        if (selectedFile.type === 'application/pdf') {
            try {
                const extracted = await extractTextFromPdf(selectedFile)
                setText(extracted)
            } catch (error) {
                console.error(error)
                showModal(
                    'Error de Lectura',
                    'No pudimos leer el PDF. Asegúrate de que no esté encriptado o protegido con contraseña.',
                    () => {},
                    true,
                )
            }
        } else {
            const reader = new FileReader()
            reader.onload = (ev) => setText(ev.target?.result as string)
            reader.readAsText(selectedFile)
        }
    }

    const handleAnalyzeClick = () => {
        if (!text) return
        showModal(
            'Analizar Documento',
            'Esta acción consumirá 2 Créditos. ¿Deseas continuar?',
            () => executeAnalysis(),
            false,
            false,
        )
    }

    const executeAnalysis = async () => {
        const canProceed = await onUsage(2)
        if (!canProceed) return
        setIsAnalyzing(true)
        try {
            const result = await analyzeDocument(text, mode)
            setAnalysis(result)
            if (userId && file) {
                addDoc(collection(db, 'users', userId, 'history'), {
                    createdAt: new Date().toISOString(),
                    category: 'proposal',
                    clientName: file.name,
                    platform: 'AI Analyzer',
                    type: mode.toUpperCase(),
                    content: result,
                })
            }
        } catch (error) {
            console.error(error)
            showModal(
                'Error del Sistema',
                'Ocurrió un error al conectar con la IA. Intenta de nuevo más tarde.',
                () => {},
                true,
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileSearch className="w-6 h-6 text-brand-600" />{' '}
                        Analizador IA
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        Sube un contrato o brief para analizarlo.
                        <span className="block mt-1 bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded w-fit">
                            Costo: 2 Créditos
                        </span>
                    </p>
                </div>

                <Card className="p-6 space-y-6 shadow-md">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".pdf,.txt,.md"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate px-2">
                            {file ? file.name : 'Subir PDF o TXT'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Máx 5MB</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">
                            Tipo de Análisis
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <ModeButton
                                active={mode === 'resumen'}
                                onClick={() => setMode('resumen')}
                                icon={<List className="w-4 h-4" />}
                                label="Resumir"
                            />
                            <ModeButton
                                active={mode === 'riesgos'}
                                onClick={() => setMode('riesgos')}
                                icon={<AlertTriangle className="w-4 h-4" />}
                                label="Riesgos"
                            />
                            <ModeButton
                                active={mode === 'accion'}
                                onClick={() => setMode('accion')}
                                icon={<CheckCircle className="w-4 h-4" />}
                                label="Acción"
                            />
                            <ModeButton
                                active={mode === 'mejora'}
                                onClick={() => setMode('mejora')}
                                icon={<RefreshCw className="w-4 h-4" />}
                                label="Mejorar"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyzeClick}
                        isLoading={isAnalyzing}
                        disabled={!text}
                        className="w-full"
                    >
                        {isAnalyzing ? 'Leyendo...' : 'Analizar Documento'}
                    </Button>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px] p-8">
                    {!analysis ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 mt-20">
                            <FileSearch className="w-16 h-16 mb-4" />
                            <p>El resultado aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {mode}
                                </span>
                                <span className="text-slate-400 text-xs">
                                    Archivo: {file?.name}
                                </span>
                            </div>
                            <ReactMarkdown>{analysis}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText="Continuar"
                cancelText={modalConfig.singleButton ? '' : 'Cancelar'}
            />
        </div>
    )
}

const ModeButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${
            active
                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
        {icon}
        {label}
    </button>
)
