import React, { useState } from 'react'
import { Wand2, Copy, Check, Globe } from 'lucide-react'
import { Button, Card, ConfirmationModal } from '../components/ui'
import ReactMarkdown from 'react-markdown'

interface FiverrToolProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const FiverrTool: React.FC<FiverrToolProps> = ({ onUsage, userId }) => {
    const [skills, setSkills] = useState('')
    const [service, setService] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    const handleGenerate = async () => {
        if (!skills || !service) return
        if (!(await onUsage(2))) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('userId', userId || '')
            formData.append('skills', skills)
            formData.append('service', service)

            const res = await fetch(`${BACKEND_URL}/api/generate-fiverr`, {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.success) setResult(data.data)
            else throw new Error('Error generando Gig')
        } catch (e) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'No se pudo generar el Gig. Intenta de nuevo.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                confirmText="Ok"
                cancelText=""
            />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Globe className="w-6 h-6 text-green-500" /> Generador de
                    Gigs Fiverr
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Optimiza tu perfil para vender más. Costo: 2 Créditos.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 h-fit">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Tus Habilidades
                            </label>
                            <input
                                className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                placeholder="Ej: Photoshop, Illustrator, Branding"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Servicio a Ofrecer
                            </label>
                            <textarea
                                className="w-full p-3 border rounded-lg h-32 resize-none bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                placeholder="Ej: Diseño de logotipos minimalistas para startups tecnológicas."
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            isLoading={loading}
                            disabled={!skills || !service}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            Generar Gig
                        </Button>
                    </div>
                </Card>

                {result && (
                    <div className="space-y-6">
                        <Card className="p-6 bg-white dark:bg-slate-800">
                            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
                                Título & SEO
                            </h3>
                            <p className="text-xl font-bold text-green-600 mb-2">
                                {result.title}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {result.searchTags.map(
                                    (tag: string, i: number) => (
                                        <span
                                            key={i}
                                            className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    )
                                )}
                            </div>
                            <h4 className="font-bold text-sm mb-1 text-slate-700 dark:text-slate-300">
                                Descripción
                            </h4>
                            <div
                                className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                    __html: result.description,
                                }}
                            ></div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-slate-800 overflow-x-auto">
                            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
                                Paquetes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {Object.entries(result.packages).map(
                                    ([key, pkg]: any) => (
                                        <div
                                            key={key}
                                            className={`border rounded-xl p-4 flex flex-col ${
                                                key === 'standard'
                                                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                                                    : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className="uppercase text-xs font-extrabold text-slate-400 mb-2 tracking-wider">
                                                {key}
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                                                {pkg.name}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex-1">
                                                {pkg.desc}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                                                <span className="text-green-600 font-bold text-xl">
                                                    {pkg.price}
                                                </span>
                                                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                                    {pkg.delivery}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
