import React, { useEffect, useState } from 'react'
import {
    collection,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
    writeBatch,
    limit,
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
    Search,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface HistoryViewProps {
    userId?: string
}

export const HistoryView: React.FC<HistoryViewProps> = ({ userId }) => {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)

    // Estados para Buscador y Paginación
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // 1. CARGAR HISTORIAL (Limitado a los últimos 100 para optimizar)
    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return
            try {
                const q = query(
                    collection(db, 'users', userId, 'history'),
                    orderBy('createdAt', 'desc'),
                    limit(100) // TRAEMOS SOLO LOS ÚLTIMOS 100
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

    // 2. BORRAR UN ITEM
    const handleDelete = async (id: string) => {
        if (!userId) return
        if (confirm('¿Borrar esta propuesta?')) {
            await deleteDoc(doc(db, 'users', userId, 'history', id))
            setHistory((prev) => prev.filter((item) => item.id !== id))
        }
    }

    // 3. VACIAR TODO EL HISTORIAL (Batch Delete)
    const handleClearAll = async () => {
        if (!userId || history.length === 0) return

        const confirmDelete = confirm(
            '⚠️ ¿ESTÁS SEGURO?\n\nEsto borrará permanentemente todas las propuestas guardadas en tu historial. Esta acción no se puede deshacer.'
        )

        if (confirmDelete) {
            setLoading(true)
            try {
                // Firebase permite borrar en lotes (batches)
                const batch = writeBatch(db)
                history.forEach((item) => {
                    const docRef = doc(db, 'users', userId, 'history', item.id)
                    batch.delete(docRef)
                })

                await batch.commit()
                setHistory([]) // Limpiamos la vista local
                alert('Historial vaciado correctamente.')
            } catch (error) {
                console.error('Error borrando historial', error)
                alert('Hubo un error al borrar. Intenta de nuevo.')
            } finally {
                setLoading(false)
            }
        }
    }

    // 4. LÓGICA DE FILTRADO
    const filteredHistory = history.filter((item) => {
        const term = searchTerm.toLowerCase()
        return (
            item.clientName?.toLowerCase().includes(term) ||
            item.content?.toLowerCase().includes(term) ||
            item.type?.toLowerCase().includes(term)
        )
    })

    // 5. LÓGICA DE PAGINACIÓN
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentItems = filteredHistory.slice(
        startIndex,
        startIndex + itemsPerPage
    )

    // Resetear a página 1 si buscas algo nuevo
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    if (loading)
        return <div className="p-8 text-center text-slate-500">Cargando...</div>

    return (
        <div className="max-w-4xl mx-auto min-h-screen pb-20">
            {/* ENCABEZADO Y BUSCADOR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-brand-600">📜</span> Historial
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Tus últimas 100 generaciones guardadas.
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {/* Botón Vaciar */}
                    {history.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="px-3 py-2 text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Vaciar Historial"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden md:inline">Vaciar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por cliente, contenido o tipo..."
                    className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* LISTA VACÍA */}
            {filteredHistory.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                        No se encontraron resultados
                    </h3>
                    <p className="text-slate-500">
                        Intenta con otra búsqueda o genera una nueva propuesta.
                    </p>
                </div>
            )}

            {/* ITEMS DEL HISTORIAL */}
            <div className="space-y-4">
                {currentItems.map((item) => (
                    <HistoryCard
                        key={item.id}
                        item={item}
                        onDelete={() => handleDelete(item.id)}
                    />
                ))}
            </div>

            {/* PAGINACIÓN */}
            {filteredHistory.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>

                    <span className="text-sm font-medium text-slate-600">
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            )}
        </div>
    )
}

// --- COMPONENTE TARJETA (Igual que antes, con pequeña mejora visual) ---
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
        // Limpieza básica antes de copiar
        const cleanText = item.content
            .replace(/\*\*/g, '')
            .replace(/^#+\s/gm, '')
        navigator.clipboard.writeText(cleanText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const dateStr =
        new Date(item.createdAt).toLocaleDateString() +
        ' ' +
        new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-md uppercase w-fit ${
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
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <User className="w-3 h-3" />{' '}
                        {item.clientName || 'Cliente'}
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Borrar"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5">
                <div
                    className={`prose prose-sm max-w-none text-slate-600 ${
                        !expanded ? 'line-clamp-3' : ''
                    }`}
                >
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
                        <span className="opacity-70">
                            {item.content.substring(0, 150)}...
                        </span>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                        {expanded ? (
                            <>
                                Menos detalles <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Ver completa <ChevronDown className="w-4 h-4" />
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
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
