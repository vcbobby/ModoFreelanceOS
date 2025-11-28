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
} from 'lucide-react'
import { generateProposals } from '../services/geminiService'
import { Proposal } from '../types'
import { Button, Card } from '../components/ui'
import { doc, getDoc, setDoc } from 'firebase/firestore' // Importamos Firestore
import { db } from '../firebase'

interface ProposalToolProps {
    onUsage: () => Promise<boolean>
    userId?: string
}

export const ProposalTool: React.FC<ProposalToolProps> = ({
    onUsage,
    userId,
}) => {
    const [jobDescription, setJobDescription] = useState('')
    const [userProfile, setUserProfile] = useState('')
    const [platform, setPlatform] = useState('Upwork')
    const [clientName, setClientName] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [proposals, setProposals] = useState<Proposal[] | null>(null)
    const [activeTab, setActiveTab] = useState<number>(0)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) return
            try {
                const docRef = doc(db, 'user_profiles', userId) // Usamos una colección separada
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

    const saveProfile = async () => {
        if (!userId || !userProfile) return
        try {
            await setDoc(
                doc(db, 'user_profiles', userId),
                {
                    profile: userProfile,
                },
                { merge: true }
            )
        } catch (e) {
            console.error('Error guardando perfil', e)
        }
    }

    const handleGenerate = async () => {
        if (!jobDescription || !userProfile) return

        // --- CORRECCIÓN AQUÍ ---

        // 1. Esperamos a que App.tsx nos diga si puede pasar (await)
        const canProceed = await onUsage()

        // 2. Si nos devuelve FALSE (no tiene créditos o cerró el modal), detenemos todo.
        if (!canProceed) {
            return
        }

        // -----------------------

        setIsGenerating(true)
        setProposals(null)

        try {
            const results = await generateProposals(
                jobDescription,
                userProfile,
                platform,
                clientName
            )
            setProposals(results)
            setActiveTab(0)
        } catch (e) {
            alert('Error al generar propuestas. Por favor intenta de nuevo.')
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Input Section */}
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-brand-600" />
                        Generador de Propuestas
                    </h2>
                    <p className="text-slate-600 mt-1">
                        Personaliza tu propuesta según la plataforma.
                    </p>
                </div>

                <Card className="p-6 flex-1 flex flex-col gap-4 shadow-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Plataforma
                            </label>
                            <select
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                            >
                                <option value="Upwork">Upwork</option>
                                <option value="Workana">Workana</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Freelancer">Freelancer</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Cliente (Opcional)
                            </label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
                                placeholder="Nombre o Empresa"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Descripción del trabajo (Job Description)
                        </label>
                        <textarea
                            className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm bg-white"
                            placeholder="Pega aquí lo que escribió el cliente... (Ej: Busco diseñador para logo de tienda de café...)"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Tu Perfil / Habilidades Clave
                        </label>
                        <textarea
                            className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm bg-white"
                            placeholder="Resumen de tu experiencia... (Ej: Soy experto en Branding, 5 años de exp...)"
                            value={userProfile}
                            onChange={(e) => setUserProfile(e.target.value)}
                            onBlur={saveProfile} // <--- MAGIA: Guarda cuando el usuario hace clic fuera
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        disabled={!jobDescription || !userProfile}
                        className="w-full mt-2"
                    >
                        {isGenerating
                            ? 'Analizando requerimientos...'
                            : 'Generar Propuestas'}
                    </Button>
                </Card>
            </div>

            {/* Output Section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col h-[600px] lg:h-auto">
                {!proposals ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <RefreshCw
                                className={`w-8 h-8 ${
                                    isGenerating
                                        ? 'animate-spin text-brand-500'
                                        : ''
                                }`}
                            />
                        </div>
                        {isGenerating ? (
                            <p className="font-medium text-slate-600">
                                Creando propuesta para {platform}...
                                <br />
                                <span className="text-xs text-slate-400 font-normal">
                                    Aplicando reglas de la plataforma
                                </span>
                            </p>
                        ) : (
                            <p>Tus propuestas aparecerán aquí.</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex space-x-2 bg-slate-200 p-1 rounded-lg mb-4">
                            {proposals.map((p, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                        activeTab === idx
                                            ? 'bg-white text-brand-700 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {p.type}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg text-slate-900 mb-4">
                                    {proposals[activeTab].title}
                                </h3>
                                <div className="prose prose-slate text-sm leading-relaxed whitespace-pre-line text-slate-700">
                                    {proposals[activeTab].content}
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
                                        Copiar al portapapeles
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
