import React, { useState, useEffect } from 'react'
import {
    GraduationCap,
    ChevronDown,
    ChevronRight,
    Sparkles,
    Trash2,
} from 'lucide-react'
import { Button, Card, ConfirmationModal } from '@features/shared/ui'
import ReactMarkdown from 'react-markdown'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '@config/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface AcademyViewProps {
    onUsage: (cost: number) => Promise<boolean>
    userId?: string
}

export const AcademyView: React.FC<AcademyViewProps> = ({
    onUsage,
    userId,
}) => {
    const [topic, setTopic] = useState('')
    const [level, setLevel] = useState('Principiante')
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [expandedModule, setExpandedModule] = useState<number | null>(0)

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    })
    const BACKEND_URL = import.meta.env.PROD
        ? 'https://backend-freelanceos.onrender.com'
        : 'http://localhost:8000'

    useEffect(() => {
        // Si no hay userId, no hacemos nada
        if (!userId) return

        const loadSavedCourse = async () => {
            try {
                // Referencia directa al curso activo "current"
                const docRef = doc(db, 'users', userId, 'academy', 'current')
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setCourse(docSnap.data())
                }
            } catch (error) {
                console.error('Error cargando curso guardado:', error)
            }
        }

        loadSavedCourse()
    }, [userId]) // Solo se ejecuta cuando cambia el userId (al login)

    const handleGenerate = async () => {
        if (!topic) return

        // 1. Cobramos los créditos primero
        const canProceed = await onUsage(3)
        if (!canProceed) return

        setLoading(true)
        setCourse(null) // Limpiamos la vista anterior

        try {
            const formData = new FormData()
            formData.append('topic', topic)
            formData.append('level', level)
            formData.append('userId', userId || '')

            // 2. Llamada a la IA
            const res = await fetch(`${BACKEND_URL}/api/generate-course`, {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()

            if (data.success) {
                const newCourse = data.course

                // 3. ¡EXITO! Mostramos el curso INMEDIATAMENTE al usuario
                setCourse(newCourse)

                // 4. Intentamos guardar en Firebase (Persistencia)
                if (userId) {
                    try {
                        await setDoc(
                            doc(db, 'users', userId, 'academy', 'current'),
                            newCourse,
                        )
                        console.log('Curso autoguardado en Firebase')
                    } catch (saveError) {
                        // SI FALLA EL GUARDADO, SOLO LO LOGUEAMOS, NO MOLESTAMOS AL USUARIO
                        // El usuario seguirá viendo su curso generado aunque no se guarde.
                        console.error(
                            'Error de permisos o red al guardar:',
                            saveError,
                        )
                    }
                }
            } else {
                throw new Error('La IA no devolvió un resultado exitoso')
            }
        } catch (e) {
            console.error(e)
            setModal({
                isOpen: true,
                title: 'Error de Generación',
                message:
                    'La IA tardó demasiado o hubo un error de conexión. Por favor intenta un tema más sencillo.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleNewTopic = async () => {
        setCourse(null)
        setTopic('')
        setExpandedModule(0)
        if (userId) {
            try {
                await deleteDoc(doc(db, 'users', userId, 'academy', 'current'))
            } catch (e) {
                console.error('Error borrando curso', e)
            }
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
            />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <GraduationCap className="w-6 h-6 text-brand-600" />{' '}
                    Academia IA
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Aprende cualquier habilidad técnica freelance en segundos.
                    <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-xs font-bold px-2 py-0.5 rounded ml-2">
                        Costo: 3 Créditos
                    </span>
                </p>
            </div>

            {!course ? (
                <Card className="p-8 max-w-lg mx-auto shadow-lg bg-white dark:bg-slate-800">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                ¿Qué quieres aprender hoy?
                            </label>
                            <input
                                className="w-full p-3 border rounded-lg mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                placeholder="Ej: SEO para e-commerce, React, Diseño de Logos..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Nivel Actual
                            </label>
                            <select
                                className="w-full p-3 border rounded-lg mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option>Principiante</option>
                                <option>Intermedio</option>
                                <option>Avanzado</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            isLoading={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading
                                ? 'Diseñando Plan de Estudios...'
                                : 'Generar Curso Personalizado'}
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Layout Móvil Corregido */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">
                                {course.description}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleNewTopic}
                            className="shrink-0 w-full md:w-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Nuevo Tema
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {course.modules.map((mod: any, i: number) => (
                            <div
                                key={i}
                                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedModule(
                                            expandedModule === i ? null : i,
                                        )
                                    }
                                    className="w-full flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                                expandedModule === i
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                            }`}
                                        >
                                            {i + 1}
                                        </div>
                                        <span className="font-bold text-lg text-slate-800 dark:text-white">
                                            {mod.title}
                                        </span>
                                    </div>
                                    {expandedModule === i ? (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                </button>

                                {expandedModule === i && (
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <div className="prose prose-slate dark:prose-invert max-w-none mb-8 text-sm leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    code({
                                                        node,
                                                        className,
                                                        children,
                                                        ...props
                                                    }) {
                                                        const match =
                                                            /language-(\w+)/.exec(
                                                                className || '',
                                                            )
                                                        return (
                                                            <span className="block bg-slate-900 text-slate-50 p-4 rounded-lg my-4 overflow-x-auto border border-slate-700 shadow-sm font-mono text-xs">
                                                                <code
                                                                    className={
                                                                        className
                                                                    }
                                                                    {...props}
                                                                >
                                                                    {children}
                                                                </code>
                                                            </span>
                                                        )
                                                    },
                                                    h3: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <h3
                                                            className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-6 mb-2"
                                                            {...props}
                                                        />
                                                    ),
                                                    ul: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <ul
                                                            className="list-disc pl-5 space-y-1 mb-4"
                                                            {...props}
                                                        />
                                                    ),
                                                    li: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <li
                                                            className="pl-1"
                                                            {...props}
                                                        />
                                                    ),
                                                    strong: ({
                                                        node,
                                                        ...props
                                                    }) => (
                                                        <strong
                                                            className="font-bold text-slate-900 dark:text-white"
                                                            {...props}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {mod.content}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                            <h4 className="text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase mb-3 flex items-center gap-2 tracking-wider">
                                                <Sparkles className="w-4 h-4" />{' '}
                                                Tu Misión (Ejercicio Práctico)
                                            </h4>
                                            <p className="text-indigo-900 dark:text-indigo-100 text-sm font-medium">
                                                {mod.exercise}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}



