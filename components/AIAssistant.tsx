import React, { useState, useEffect, useRef } from 'react'
import {
    Bot,
    X,
    Send,
    Sparkles,
    Maximize2,
    Minimize2,
    Trash2,
    AlertTriangle,
    MessageSquare,
    CheckCircle,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { chatWithAssistant } from '../services/geminiService'

const SUGGESTED_QUESTIONS = [
    '¿Cómo van mis finanzas este mes?',
    'Agendar reunión mañana a las 10am',
    'Analiza mis gastos recientes',
    'Crea una nota con ideas para redes sociales',
]

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        Confirmar Acción
                    </span>
                    <button
                        onClick={onClose}
                        className="hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-slate-800 dark:text-white font-bold mb-2">
                        ¿Borrar historial?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Esta acción eliminará toda la conversación actual. No
                        podrás recuperarla después.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-none transition-all active:scale-95"
                        >
                            Sí, borrar todo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface AIAssistantProps {
    userId?: string
    onUsage: (cost: number) => Promise<boolean>
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
    userId,
    onUsage,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState<
        { role: 'user' | 'model'; text: string }[]
    >(() => {
        const saved = localStorage.getItem(`chat_history_${userId}`)
        return saved ? JSON.parse(saved) : []
    })

    const [contextData, setContextData] = useState({
        finances: '',
        agenda: '',
        notes: '',
        history: '',
        currentTime: '',
        currentDate: '',
    })
    useEffect(() => {
        if (userId)
            localStorage.setItem(
                `chat_history_${userId}`,
                JSON.stringify(messages)
            )
    }, [messages, userId])

    useEffect(() => {
        if (isOpen && userId) loadContext()
    }, [isOpen, userId])

    const confirmClearHistory = () => {
        setMessages([])
        localStorage.removeItem(`chat_history_${userId}`)
    }

    const loadContext = async () => {
        if (!userId) return
        try {
            const fQ = query(
                collection(db, 'users', userId, 'finances'),
                orderBy('date', 'desc'),
                limit(30)
            )
            const fSnap = await getDocs(fQ)
            const transactions = fSnap.docs.map((d) => d.data())
            const realTx = transactions.filter(
                (t) => t.status === 'paid' || !t.status
            )
            const pendingTx = transactions.filter((t) => t.status === 'pending')
            const incomeReal = realTx
                .filter((t) => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0)
            const expenseReal = realTx
                .filter((t) => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0)
            const balance = incomeReal - expenseReal
            const debtPending = pendingTx
                .filter((t) => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0)
            const collectPending = pendingTx
                .filter((t) => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0)
            const transactionsListText = transactions
                .slice(0, 20)
                .map((t) => {
                    const tipo = t.type === 'income' ? 'INGRESO' : 'GASTO'
                    const estado =
                        t.status === 'pending' ? '[PENDIENTE]' : '[REAL]'
                    return `- ${t.date}: ${tipo} de $${t.amount} (${t.description}) ${estado}`
                })
                .join('\n')
            const financeContext = `
RESUMEN DE TOTALES:
- Dinero Real: $${balance.toFixed(2)}
- Deudas Por Pagar: $${debtPending.toFixed(2)}
- Dinero Por Cobrar: $${collectPending.toFixed(2)}
DETALLE:
${transactionsListText}
        `.trim()
            const today = new Date().toISOString().split('T')[0]
            const aQ = query(
                collection(db, 'users', userId, 'agenda'),
                where('date', '>=', today),
                orderBy('date', 'asc'),
                limit(5)
            )
            const aSnap = await getDocs(aQ)
            const agendaList = aSnap.empty
                ? 'Agenda vacía.'
                : aSnap.docs
                      .map(
                          (d) =>
                              `- ${d.data().date} a las ${d.data().time}: ${
                                  d.data().title
                              }`
                      )
                      .join('\n')
            const nQ = query(
                collection(db, 'users', userId, 'notes'),
                where('isPinned', '==', true),
                limit(5)
            )
            const nSnap = await getDocs(nQ)
            const notesList = nSnap.empty
                ? 'Ninguna.'
                : nSnap.docs
                      .map(
                          (d) =>
                              `- ${d.data().title}: ${d
                                  .data()
                                  .content.substring(0, 60)}...`
                      )
                      .join('\n')
            const hQ = query(
                collection(db, 'users', userId, 'history'),
                orderBy('createdAt', 'desc'),
                limit(10)
            )
            const hSnap = await getDocs(hQ)
            const historyList = hSnap.empty
                ? 'Vacío.'
                : hSnap.docs
                      .map((d) => {
                          const item = d.data()
                          const date = new Date(
                              item.createdAt
                          ).toLocaleDateString('en-CA')
                          if (item.category === 'invoice')
                              return `[FACTURA] ${date} - Cliente: ${item.clientName}`
                          if (item.category === 'logo')
                              return `[LOGO] ${date} - Marca: ${item.clientName} - Estilo: ${item.type}`
                          const snippet = (item.content || '')
                              .substring(0, 100)
                              .replace(/\n/g, ' ')
                          return `[DOC] ${date} - ${item.clientName} - "${snippet}..."`
                      })
                      .join('\n')
            const now = new Date()
            const timeString = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
            setContextData({
                finances: financeContext,
                agenda: agendaList,
                notes: notesList,
                history: historyList,
                currentTime: timeString,
                currentDate: now.toLocaleDateString('en-CA'),
            })
        } catch (e) {
            console.error('Error cargando contexto', e)
        }
    }

    const executeAIAction = async (jsonString: string) => {
        if (!userId) return 'Error: No user ID'
        try {
            const cleanJson = jsonString
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim()
            const action = JSON.parse(cleanJson)
            if (action.action === 'create_event') {
                await addDoc(collection(db, 'users', userId, 'agenda'), {
                    title: action.title,
                    date: action.date,
                    time: action.time || '',
                    desc: action.desc || 'Creado por FreelanceBot',
                    link: '',
                    createdAt: new Date().toISOString(),
                })
                return `✅ **Evento Agendado:** ${action.title} para el ${action.date} a las ${action.time}.`
            }
            if (action.action === 'create_note') {
                await addDoc(collection(db, 'users', userId, 'notes'), {
                    title: action.title || 'Nota IA',
                    content: action.content,
                    color: 'bg-yellow-100',
                    isPinned: false,
                    isPrivate: false,
                    createdAt: serverTimestamp(),
                    order: 0,
                })
                return `✅ **Nota Creada:** "${action.title}" guardada en tus notas.`
            }
            return 'No reconocí la acción solicitada.'
        } catch (e) {
            console.error('Error ejecutando acción IA', e)
            return 'Intenté realizar la acción pero hubo un error con los datos.'
        }
    }

    const handleSend = async (overrideText?: string) => {
        const textToSend = overrideText || input
        if (!textToSend.trim()) return
        const canProceed = await onUsage(1)
        if (!canProceed) return
        setInput('')
        setMessages((prev) => [...prev, { role: 'user', text: textToSend }])
        setLoading(true)
        try {
            const rawReply = await chatWithAssistant(
                textToSend,
                messages,
                contextData
            )
            if (
                rawReply.trim().startsWith('{') ||
                rawReply.trim().startsWith('```json')
            ) {
                const actionResult = await executeAIAction(rawReply)
                setMessages((prev) => [
                    ...prev,
                    { role: 'model', text: actionResult },
                ])
                loadContext()
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'model', text: rawReply },
                ])
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'model', text: '⚠️ Error de conexión.' },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    return (
        <>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmClearHistory}
            />

            <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none font-sans">
                <div
                    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mb-3 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
                        isOpen
                            ? `opacity-100 scale-100 pointer-events-auto ${
                                  isExpanded
                                      ? 'fixed inset-0 z-[70] w-full h-full md:inset-auto md:right-6 md:bottom-6 md:w-[600px] md:h-[600px] rounded-none md:rounded-2xl'
                                      : 'w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[70vh]'
                              }`
                            : 'opacity-0 scale-95 h-0 w-0 pointer-events-none'
                    }`}
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">
                                    FreelanceBot
                                </h3>
                                <p className="text-[10px] text-indigo-100 flex items-center gap-1 opacity-90">
                                    <Sparkles className="w-2 h-2" /> Asistente
                                    Inteligente
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="hover:bg-white/10 p-1.5 rounded transition-colors text-indigo-100 hover:text-white"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/20 mx-1"></div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="hidden md:block hover:bg-white/10 p-1.5 rounded transition-colors"
                            >
                                {isExpanded ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/10 p-1.5 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-white dark:bg-slate-700 p-4 rounded-full shadow-sm mb-4">
                                    <Bot className="w-8 h-8 text-indigo-500" />
                                </div>
                                <h3 className="text-slate-700 dark:text-slate-200 font-bold mb-1">
                                    ¡Hola, Freelancer! 👋
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                                    ¿Qué agendamos hoy?
                                </p>
                                <div className="grid gap-2 w-full">
                                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(q)}
                                            className="text-xs text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 p-3 rounded-xl transition-all shadow-sm flex items-center gap-2 group"
                                        >
                                            <MessageSquare className="w-3 h-3 opacity-50 group-hover:opacity-100 text-indigo-500" />
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${
                                    m.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-tl-none'
                                    }`}
                                >
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                            placeholder="Escribe aquí..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm active:scale-95 transform"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto p-4 rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-all duration-300 group hover:shadow-indigo-500/30 ${
                        isOpen
                            ? 'rotate-90 scale-0 opacity-0'
                            : 'scale-100 opacity-100'
                    }`}
                >
                    <Bot className="w-7 h-7 group-hover:animate-pulse" />
                </button>
                {isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="pointer-events-auto p-4 rounded-full shadow-xl bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition-all duration-300 animate-in zoom-in spin-in-90"
                    >
                        <X className="w-7 h-7" />
                    </button>
                )}
            </div>
        </>
    )
}
