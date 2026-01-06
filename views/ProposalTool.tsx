import React, { useState, useEffect } from 'react'
import {
    Copy,
    RefreshCw,
    Wand2,
    Briefcase,
    User,
    CheckCircle2,
    Globe,
    Hash,
    Trash2,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import ReactMarkdown from 'react-markdown'

interface Proposal {
    type: string
    title: string
    content: string
}

interface ProposalToolProps {
    onUsage: () => Promise<boolean>
    userId?: string
}

export const ProposalTool: React.FC<ProposalToolProps> = ({
    onUsage,
    userId,
}) => {
    // Estados del formulario
    const [jobDescription, setJobDescription] = useState('')
    const [userProfile, setUserProfile] = useState('')
    const [platform, setPlatform] = useState('Workana')
    const [clientName, setClientName] = useState('')

    // Estados de UI
    const [isGenerating, setIsGenerating] = useState(false)
    const [proposals, setProposals] = useState<Proposal[] | null>(null)
    const [activeTab, setActiveTab] = useState<number>(0)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    // --- DEFINICIÓN DE BACKEND URL ---
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    // --- CONFIGURACIÓN DEL MODAL (UNIFICADA) ---
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        isDanger: false,
        action: () => {},
        confirmText: 'Confirmar', // Añadido para flexibilidad
        cancelText: 'Cancelar',
    })

    const showModal = (
        title: string,
        message: string,
        isDanger = false,
        action = () => {},
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    ) => {
        setModal({
            isOpen: true,
            title,
            message,
            isDanger,
            action,
            confirmText,
            cancelText,
        })
    }

    // Cargar perfil guardado
    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) return
            try {
                const docRef = doc(db, 'user_profiles', userId)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data().profile || '')
                }
            } catch (e) {
                console.error('Error cargando perfil', e)
            }
        }
        loadProfile()
    }, [userId])

    // Guardar perfil al salir del campo
    const saveProfile = async () => {
        if (!userId || !userProfile) return
        try {
            await setDoc(
                doc(db, 'user_profiles', userId),
                { profile: userProfile },
                { merge: true }
            )
        } catch (e) {
            console.error(e)
        }
    }

    const handleClear = () => {
        showModal(
            '¿Limpiar campos?',
            'Esto borrará la descripción del trabajo y el nombre del cliente actual. Tu perfil se mantendrá intacto.',
            true, // isDanger
            () => {
                setJobDescription('')
                setClientName('')
                setModal((prev) => ({ ...prev, isOpen: false }))
            },
            'Sí, limpiar',
            'Cancelar'
        )
    }

    // --- FUNCIÓN PRINCIPAL CONECTADA AL BACKEND ---
    const handleGenerate = async () => {
        if (!jobDescription || !userProfile) return

        // Cobro de créditos
        const canProceed = await onUsage()
        if (!canProceed) return

        setIsGenerating(true)
        setProposals(null)

        try {
            const formData = new FormData()
            formData.append('userId', userId || 'anon')
            formData.append('jobDescription', jobDescription)
            formData.append('userProfile', userProfile)
            formData.append('platform', platform)
            formData.append('clientName', clientName)

            // Llamada al Backend
            const res = await fetch(`${BACKEND_URL}/api/generate-proposal`, {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.detail || 'Error en el servidor')
            }

            const data = await res.json()

            if (!data.success || !data.proposals) {
                throw new Error('La IA no devolvió propuestas válidas.')
            }

            const newProposals = data.proposals
            setProposals(newProposals)
            setActiveTab(0)

            // Guardado en Historial (Firebase)
            if (userId) {
                const historyRef = collection(db, 'users', userId, 'history')
                await Promise.all(
                    newProposals.map((prop: Proposal) =>
                        addDoc(historyRef, {
                            createdAt: new Date().toISOString(),
                            category: 'proposal',
                            clientName: clientName || 'Cliente Desconocido',
                            platform: platform,
                            type: prop.type,
                            content: prop.content,
                        })
                    )
                )
            }
        } catch (e: any) {
            console.error(e)
            showModal(
                'Error',
                `No se pudo generar la propuesta. ${e.message}`,
                true,
                () => setModal((prev) => ({ ...prev, isOpen: false })),
                'Entendido',
                ''
            )
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        // Limpieza de markdown para copiar texto plano
        const cleanText = text
            .replace(/\*\*/g, '')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            .replace(/^#+\s/gm, '')
            .trim()

        navigator.clipboard.writeText(cleanText)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
            {/* COMPONENTE MODAL RENDERIZADO */}
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.action}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                isDanger={modal.isDanger}
            />

            {/* COLUMNA IZQUIERDA: INPUTS */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-brand-600" /> Generador
                        de Propuestas
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Personaliza tu propuesta según la plataforma.
                    </p>
                </div>

                <Card className="p-6 flex-1 flex flex-col gap-4 shadow-md bg-white dark:bg-slate-800 border dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Plataforma
                            </label>
                            <select
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white dark:bg-slate-900 dark:text-white"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                            >
                                <option value="Workana">Workana</option>
                                <option value="Upwork">Upwork</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Freelancer">Freelancer</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Cliente (Opcional)
                            </label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white dark:bg-slate-900 dark:text-white"
                                placeholder="Nombre o Empresa"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Descripción del
                            trabajo
                        </label>
                        <textarea
                            className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm bg-white dark:bg-slate-900 dark:text-white"
                            placeholder="Pega aquí lo que escribió el cliente... (Ej: Busco diseñador para logo de tienda de café...)"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <User className="w-4 h-4" /> Tu Perfil / Habilidades
                        </label>
                        <textarea
                            className="w-full h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm bg-white dark:bg-slate-900 dark:text-white"
                            placeholder="Resumen de tu experiencia... (Ej: Soy experto en Branding, 5 años de exp...)"
                            value={userProfile}
                            onChange={(e) => setUserProfile(e.target.value)}
                            onBlur={saveProfile}
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={handleClear}
                            disabled={!jobDescription && !clientName}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>

                        <Button
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            disabled={!jobDescription || !userProfile}
                            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
                        >
                            {isGenerating
                                ? 'Analizando con IA...'
                                : 'Generar Propuestas'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Output Section */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[600px] lg:h-auto">
                {!proposals ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <RefreshCw
                                className={`w-8 h-8 ${
                                    isGenerating
                                        ? 'animate-spin text-brand-500'
                                        : ''
                                }`}
                            />
                        </div>
                        {isGenerating ? (
                            <p className="font-medium text-slate-600 dark:text-slate-300">
                                Redactando propuestas ganadoras...
                                <br />
                                <span className="text-xs text-slate-400 font-normal">
                                    Usando rotación de llaves para evitar
                                    errores.
                                </span>
                            </p>
                        ) : (
                            <p>Tus propuestas aparecerán aquí.</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex space-x-2 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg mb-4">
                            {proposals.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                        activeTab === idx
                                            ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {p.type}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                                    {proposals[activeTab].title}
                                </h3>

                                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => (
                                                <p
                                                    className="mb-4"
                                                    {...props}
                                                />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul
                                                    className="list-disc pl-4 mb-4 space-y-1"
                                                    {...props}
                                                />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li
                                                    className="pl-1"
                                                    {...props}
                                                />
                                            ),
                                            strong: ({ node, ...props }) => (
                                                <strong
                                                    className="font-bold text-slate-900 dark:text-white"
                                                    {...props}
                                                />
                                            ),
                                        }}
                                    >
                                        {proposals[activeTab].content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    copyToClipboard(
                                        proposals[activeTab].content,
                                        activeTab
                                    )
                                }
                            >
                                {copiedIndex === activeTab ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                        Copiado
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
