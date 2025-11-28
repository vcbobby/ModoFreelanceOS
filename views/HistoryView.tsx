import React, { useEffect, useState } from 'react'
import {
    collection,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { HistoryItem } from '../types'
import {
    Calendar,
    User,
    Trash2,
    ChevronDown,
    ChevronUp,
    Copy,
    CheckCircle2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface HistoryViewProps {
    userId?: string
}

export const HistoryView: React.FC<HistoryViewProps> = ({ userId }) => {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)

    // Cargar historial
    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return
            try {
                // Buscamos en la subcolección 'history' del usuario, ordenado por fecha
                const q = query(
                    collection(db, 'users', userId, 'history'),
                    orderBy('createdAt', 'desc')
                )
                const querySnapshot = await getDocs(q)
                const loadedHistory: HistoryItem[] = []

                querySnapshot.forEach((doc) => {
                    loadedHistory.push({
                        id: doc.id,
                        ...doc.data(),
                    } as HistoryItem)
                })

                setHistory(loadedHistory)
            } catch (error) {
                console.error('Error cargando historial', error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [userId])

    // Función para borrar (opcional, pero útil)
    const handleDelete = async (id: string) => {
        if (!userId) return
        if (confirm('¿Seguro que quieres borrar esta propuesta?')) {
            await deleteDoc(doc(db, 'users', userId, 'history', id))
            setHistory((prev) => prev.filter((item) => item.id !== id))
        }
    }

    if (loading)
        return (
            <div className="p-8 text-center text-slate-500">
                Cargando tu historial...
            </div>
        )

    if (history.length === 0)
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <HistoryIconPlaceholder />
                <h3 className="text-lg font-bold text-slate-700 mt-4">
                    Aún no hay historial
                </h3>
                <p className="text-slate-500">
                    Genera tu primera propuesta para verla aquí.
                </p>
            </div>
        )

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-brand-600">📜</span> Historial de
                Propuestas
            </h2>
            <div className="space-y-4">
                {history.map((item) => (
                    <HistoryCard
                        key={item.id}
                        item={item}
                        onDelete={() => handleDelete(item.id)}
                    />
                ))}
            </div>
        </div>
    )
}

// COMPONENTE TARJETA INDIVIDUAL (Para manejar el estado de expandir independientemente)
const HistoryCard = ({
    item,
    onDelete,
}: {
    item: HistoryItem
    onDelete: () => void
}) => {
    const [expanded, setExpanded] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        // Limpieza básica antes de copiar (la misma lógica que ya tenías)
        const cleanText = item.content
            .replace(/\*\*/g, '')
            .replace(/^#+\s/gm, '')
        navigator.clipboard.writeText(cleanText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Formatear fecha
    const dateStr =
        new Date(item.createdAt).toLocaleDateString() +
        ' ' +
        new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* ENCABEZADO DE LA TARJETA */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
                            item.type === 'Formal'
                                ? 'bg-blue-100 text-blue-700'
                                : item.type === 'Corto'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-purple-100 text-purple-700'
                        }`}
                    >
                        {item.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {dateStr}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                        <User className="w-3 h-3" /> {item.clientName}
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* CONTENIDO */}
            <div className="p-5">
                <div
                    className={`prose prose-sm max-w-none text-slate-600 ${
                        !expanded ? 'line-clamp-2' : ''
                    }`}
                >
                    {/* Si está expandido, mostramos Markdown bonito. Si no, texto plano cortado */}
                    {expanded ? (
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => (
                                    <p
                                        className="mb-2 whitespace-pre-wrap"
                                        {...props}
                                    />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="list-disc pl-4" {...props} />
                                ),
                            }}
                        >
                            {item.content}
                        </ReactMarkdown>
                    ) : (
                        // Muestra los primeros 30 caracteres aprox (o un poco más para que no se vea tan cortado)
                        <span>{item.content.substring(0, 100)}...</span>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                        {expanded ? (
                            <>
                                Ver menos <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Ver propuesta completa{' '}
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    {expanded && (
                        <button
                            onClick={handleCopy}
                            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"
                        >
                            {copied ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                            {copied ? 'Copiado' : 'Copiar texto'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const HistoryIconPlaceholder = () => (
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
        <Copy className="w-8 h-8" />
    </div>
)
