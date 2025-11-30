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
    Image as ImageIcon,
    ExternalLink, // Nuevos iconos
    Download,
    FileText,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import html2pdf from 'html2pdf.js'
import { ConfirmationModal } from '../components/ui/ConfirmationModal'

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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        action: () => {},
        isDanger: false,
    })

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
    const handleDelete = (id: string) => {
        if (!userId) return
        confirmAction(
            '¿Borrar propuesta?',
            'Esta acción eliminará este elemento de tu historial permanentemente.',
            async () => {
                await deleteDoc(doc(db, 'users', userId, 'history', id))
                setHistory((prev) => prev.filter((item) => item.id !== id))
            },
            true // es peligroso (rojo)
        )
    }
    const confirmAction = (
        title: string,
        message: string,
        action: () => void,
        isDanger = false
    ) => {
        setModalConfig({ title, message, action, isDanger })
        setIsModalOpen(true)
    }
    // 3. VACIAR TODO EL HISTORIAL (Batch Delete)
    const handleClearAll = () => {
        if (!userId || history.length === 0) return
        confirmAction(
            '¿Vaciar todo el historial?',
            'Estás a punto de borrar TODAS las propuestas y logos guardados. Esta acción no se puede deshacer.',
            async () => {
                setLoading(true)
                try {
                    const batch = writeBatch(db)
                    history.forEach((item) => {
                        const docRef = doc(
                            db,
                            'users',
                            userId,
                            'history',
                            item.id
                        )
                        batch.delete(docRef)
                    })
                    await batch.commit()
                    setHistory([])
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoading(false)
                }
            },
            true // es peligroso
        )
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
                {currentItems.map((item) => {
                    if (item.category === 'logo')
                        return (
                            <LogoHistoryCard
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item.id)}
                            />
                        )
                    // NUEVO: Si es factura
                    if (item.category === 'invoice')
                        return (
                            <InvoiceHistoryCard
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item.id)}
                            />
                        )

                    return (
                        <HistoryCard
                            key={item.id}
                            item={item}
                            onDelete={() => handleDelete(item.id)}
                        />
                    )
                })}
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
            {/* MODAL GLOBAL */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText={modalConfig.isDanger ? 'Sí, borrar' : 'Confirmar'}
            />
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
// --- COMPONENTE TARJETA DE LOGO (MEJORADO) ---
const LogoHistoryCard = ({
    item,
    onDelete,
}: {
    item: HistoryItem
    onDelete: () => void
}) => {
    const [showImage, setShowImage] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const dateStr =
        new Date(item.createdAt).toLocaleDateString() +
        ' ' +
        new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })

    // 1. FUNCIÓN PARA COPIAR EL TEXTO DESCRIPTIVO
    // 1. FUNCIÓN PARA COPIAR EL TEXTO DESCRIPTIVO (BLINDADA)
    const handleCopyDescription = () => {
        const textToCopy = `Marca: ${item.clientName}\nDetalles: ${item.content}\nEstilo: ${item.type}`

        // INTENTO A: API Moderna (La que tenías)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                })
                .catch((err) => {
                    console.error('Error copiando (Moderno):', err)
                    fallbackCopyTextToClipboard(textToCopy) // Si falla, vamos al Plan B
                })
        } else {
            // INTENTO B: Si el navegador no soporta la API moderna
            fallbackCopyTextToClipboard(textToCopy)
        }
    }

    // Función auxiliar "Plan B" (Método clásico compatible con todo)
    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement('textarea')
        textArea.value = text

        // Evitar que haga scroll al fondo de la página
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.position = 'fixed'

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            const successful = document.execCommand('copy')
            if (successful) {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } else {
                alert('No se pudo copiar el texto automáticamente.')
            }
        } catch (err) {
            console.error('Error copiando (Fallback):', err)
        }

        document.body.removeChild(textArea)
    }

    // 2. FUNCIÓN PARA RE-DESCARGAR LA IMAGEN
    const handleReDownload = async () => {
        if (!item.imageUrl) return
        setIsDownloading(true)
        try {
            // Hacemos un fetch para obtener el "blob" (el archivo en sí)
            const response = await fetch(item.imageUrl)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            // Creamos el enlace invisible para forzar la descarga
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `logo-${item.clientName
                .replace(/\s+/g, '-')
                .toLowerCase()}-${Date.now()}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl) // Limpiamos memoria
        } catch (error) {
            console.error('Error al descargar:', error)
            // Si falla la descarga directa, abrimos en pestaña nueva como respaldo
            window.open(item.imageUrl, '_blank')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* ENCABEZADO */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1 w-fit">
                        <ImageIcon className="w-3 h-3" /> LOGO
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {dateStr}
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                        {item.clientName}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Borrar del historial"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* CUERPO DE LA TARJETA */}
            <div className="p-5 flex flex-col sm:flex-row gap-6 items-start">
                {/* COLUMNA IZQUIERDA: VISUALIZADOR DE IMAGEN */}
                <div className="w-full sm:w-40 shrink-0">
                    <div
                        className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative group cursor-pointer"
                        onClick={() => setShowImage(!showImage)}
                    >
                        {/* Si hay URL, mostramos la imagen siempre (como miniatura) */}
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt="Logo guardado"
                                className="w-full h-full object-contain p-1"
                                loading="lazy"
                            />
                        ) : (
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                        )}

                        {/* Overlay para indicar que se puede expandir */}
                        {!showImage && (
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="sr-only">Ver detalles</span>
                            </div>
                        )}
                    </div>

                    {/* Botón de Re-descarga debajo de la imagen */}
                    <button
                        onClick={handleReDownload}
                        disabled={isDownloading}
                        className="mt-2 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-colors"
                    >
                        {isDownloading ? (
                            <span className="animate-pulse">Bajando...</span>
                        ) : (
                            <>
                                <Download className="w-3 h-3" /> Descargar
                            </>
                        )}
                    </button>
                </div>

                {/* COLUMNA DERECHA: DATOS Y ACCIONES */}
                <div className="flex-1 w-full">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Estilo
                            </span>
                            <p className="text-sm font-medium text-slate-700">
                                {item.type}
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Marca
                            </span>
                            <p className="text-sm font-medium text-slate-700">
                                {item.clientName}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Prompt / Detalles
                        </span>
                        <div
                            className={`text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic ${
                                !showImage ? 'line-clamp-2' : ''
                            }`}
                        >
                            "{item.content}"
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                        {/* Botón Ver Más / Menos */}
                        <button
                            onClick={() => setShowImage(!showImage)}
                            className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                        >
                            {showImage ? (
                                <>
                                    Ver menos <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Ver detalles completos{' '}
                                    <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {/* Botón Copiar Descripción */}
                        <button
                            onClick={handleCopyDescription}
                            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 ml-auto"
                        >
                            {copied ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                            {copied
                                ? 'Descripción copiada'
                                : 'Copiar descripción'}
                        </button>
                    </div>

                    {/* VISOR EXPANDIDO (Opcional, si quieres ver la imagen en grande al darle ver más) */}
                    {showImage && item.imageUrl && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
                            <img
                                src={item.imageUrl}
                                alt="Logo Full"
                                className="max-h-64 object-contain shadow-sm rounded-lg bg-white"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
const InvoiceHistoryCard = ({
    item,
    onDelete,
}: {
    item: HistoryItem
    onDelete: () => void
}) => {
    const [isDownloading, setIsDownloading] = useState(false)
    const dateStr = new Date(item.createdAt).toLocaleDateString()

    // Función para regenerar el PDF desde el JSON guardado
    const handleRedownload = () => {
        setIsDownloading(true)
        const data = item.invoiceData
        if (!data) return

        // Creamos un HTML temporal en memoria para imprimir
        const content = document.createElement('div')
        content.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; color: #333;">
                <h1>FACTURA #${data.invoiceNumber}</h1>
                <p><strong>Fecha:</strong> ${data.date}</p>
                <hr/>
                <h3>Cliente: ${data.client.name}</h3>
                <p>Total: <strong>${data.currency}${data.total.toFixed(
            2
        )}</strong></p>
                <br/>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #eee;">
                        <th style="text-align: left; padding: 5px;">Item</th>
                        <th style="text-align: right; padding: 5px;">Total</th>
                    </tr>
                    ${data.items
                        .map(
                            (i: any) => `
                        <tr>
                            <td style="padding: 5px; border-bottom: 1px solid #ddd;">${
                                i.desc
                            } (x${i.qty})</td>
                            <td style="text-align: right; padding: 5px; border-bottom: 1px solid #ddd;">${
                                data.currency
                            }${(i.price * i.qty).toFixed(2)}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </table>
                <br/>
                <p><em>Copia regenerada desde historial.</em></p>
            </div>
        `

        const opt = {
            margin: 10,
            filename: `copia-factura-${data.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }

        html2pdf()
            .set(opt)
            .from(content)
            .save()
            .then(() => {
                setIsDownloading(false)
            })
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3" /> FACTURA
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                        {dateStr}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                        {item.clientName}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5">
                <p className="text-sm text-slate-600 mb-4">{item.content}</p>
                <div className="flex gap-3">
                    <button
                        onClick={handleRedownload}
                        disabled={isDownloading}
                        className="text-sm font-bold text-brand-600 hover:text-brand-800 flex items-center gap-2 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                        {isDownloading ? (
                            <span className="animate-pulse">Generando...</span>
                        ) : (
                            <>
                                <Download className="w-4 h-4" /> Descargar Copia
                                PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
