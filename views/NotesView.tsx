import React, { useState, useEffect, useRef } from 'react'
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import {
    Plus,
    Pin,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    Check,
    StickyNote,
    Save,
    Calendar as CalIcon,
    Clock,
    Video,
    X,
    ChevronLeft,
    ChevronRight,
    AlignLeft,
    GripVertical,
    AlertCircle,
} from 'lucide-react'

interface NotesViewProps {
    userId?: string
    autoOpenAgenda?: boolean
}

export interface Note {
    id: string
    title: string
    content: string
    color: string
    isPinned: boolean
    isPrivate: boolean
    order: number
    createdAt: any
}

const COLOR_MAP: Record<
    string,
    { bg: string; border: string; gradient: string }
> = {
    'bg-yellow-100': {
        bg: 'bg-yellow-100',
        border: 'border-yellow-200',
        gradient: 'from-yellow-100',
    },
    'bg-green-100': {
        bg: 'bg-green-100',
        border: 'border-green-200',
        gradient: 'from-green-100',
    },
    'bg-blue-100': {
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        gradient: 'from-blue-100',
    },
    'bg-red-100': {
        bg: 'bg-red-100',
        border: 'border-red-200',
        gradient: 'from-red-100',
    },
    'bg-purple-100': {
        bg: 'bg-purple-100',
        border: 'border-purple-200',
        gradient: 'from-purple-100',
    },
    'bg-slate-100': {
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        gradient: 'from-slate-100',
    },
}

export const NotesView: React.FC<NotesViewProps> = ({
    userId,
    autoOpenAgenda,
}) => {
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState({ title: '', content: '' })
    const [selectedColor, setSelectedColor] = useState('bg-yellow-100')
    const [isInputExpanded, setIsInputExpanded] = useState(false)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [showAgenda, setShowAgenda] = useState(false)
    const dragItem = useRef<number | null>(null)
    const dragOverItem = useRef<number | null>(null)

    useEffect(() => {
        if (autoOpenAgenda) setShowAgenda(true)
    }, [autoOpenAgenda])

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'notes'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let loadedNotes = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Note[]
            loadedNotes = loadedNotes.map((n, index) => ({
                ...n,
                order: n.order !== undefined ? n.order : 9999 + index,
            }))
            const pinned = loadedNotes
                .filter((n) => n.isPinned)
                .sort((a, b) => b.createdAt - a.createdAt)
            const unpinned = loadedNotes
                .filter((n) => !n.isPinned)
                .sort((a, b) => {
                    if (a.order < 9000 && b.order < 9000)
                        return a.order - b.order
                    return b.createdAt - a.createdAt
                })
            setNotes([...pinned, ...unpinned])
        })
        return () => unsubscribe()
    }, [userId])

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.content.trim() || !userId) return
        const newOrder = notes.length + 1
        await addDoc(collection(db, 'users', userId, 'notes'), {
            title: newNote.title,
            content: newNote.content,
            color: selectedColor,
            isPinned: false,
            isPrivate: false,
            order: newOrder,
            createdAt: serverTimestamp(),
        })
        setNewNote({ title: '', content: '' })
        setIsInputExpanded(false)
    }

    const handleDragStart = (e: React.DragEvent, position: number) => {
        dragItem.current = position
        e.currentTarget.classList.add('opacity-50')
    }
    const handleDragEnter = (e: React.DragEvent, position: number) => {
        dragOverItem.current = position
        e.preventDefault()
    }
    const handleDragEnd = async (e: React.DragEvent) => {
        e.currentTarget.classList.remove('opacity-50')
        if (
            dragItem.current === null ||
            dragOverItem.current === null ||
            !userId
        )
            return
        const _notes = [...notes]
        const draggedItemContent = _notes[dragItem.current]
        const targetItemContent = _notes[dragOverItem.current]
        if (draggedItemContent.isPinned || targetItemContent.isPinned) return
        _notes.splice(dragItem.current, 1)
        _notes.splice(dragOverItem.current, 0, draggedItemContent)
        setNotes(_notes)
        try {
            const batch = writeBatch(db)
            const unpinnedNotes = _notes.filter((n) => !n.isPinned)
            unpinnedNotes.forEach((note, index) => {
                const ref = doc(db, 'users', userId, 'notes', note.id)
                batch.update(ref, { order: index })
            })
            await batch.commit()
        } catch (error) {
            console.error(error)
        }
        dragItem.current = null
        dragOverItem.current = null
    }

    const handleUpdateNote = async () => {
        if (editingNote && userId) {
            await updateDoc(doc(db, 'users', userId, 'notes', editingNote.id), {
                title: editingNote.title,
                content: editingNote.content,
                color: editingNote.color,
            })
            setEditingNote(null)
        }
    }
    const handleDelete = async (id: string) => {
        if (userId) await deleteDoc(doc(db, 'users', userId, 'notes', id))
    }
    const togglePin = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation()
        if (userId)
            await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
                isPinned: !note.isPinned,
            })
    }
    const togglePrivacy = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation()
        if (userId)
            await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
                isPrivate: !note.isPrivate,
            })
    }

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <StickyNote className="w-8 h-8 text-brand-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Tablero de Notas
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Organización visual para tu día a día.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAgenda(!showAgenda)}
                    className={`md:hidden w-full flex items-center justify-center gap-2 text-white py-2 rounded-lg font-bold text-sm transition-colors ${
                        showAgenda ? 'bg-brand-600' : 'bg-slate-900'
                    }`}
                >
                    <CalIcon className="w-4 h-4" />{' '}
                    {showAgenda ? 'Volver a las Notas' : 'Ver Agenda'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div
                    className={`flex-1 w-full min-w-0 ${
                        showAgenda ? 'hidden lg:block' : 'block'
                    }`}
                >
                    <div
                        className={`mx-auto transition-all duration-300 ease-in-out mb-8 ${
                            isInputExpanded ? 'max-w-xl' : 'max-w-lg'
                        }`}
                    >
                        <form
                            onSubmit={handleAddNote}
                            className={`bg-white border shadow-sm rounded-2xl overflow-hidden transition-all ${
                                isInputExpanded
                                    ? 'ring-2 ring-brand-500 shadow-lg'
                                    : 'border-slate-200'
                            }`}
                            onClick={() => setIsInputExpanded(true)}
                        >
                            {isInputExpanded && (
                                <input
                                    type="text"
                                    placeholder="Título..."
                                    className="w-full px-4 pt-4 pb-2 text-lg font-bold text-slate-800 outline-none placeholder:text-slate-400"
                                    value={newNote.title}
                                    onChange={(e) =>
                                        setNewNote({
                                            ...newNote,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            )}
                            <textarea
                                placeholder="Escribe una nota..."
                                className={`w-full px-4 py-3 resize-none outline-none text-slate-700 placeholder:text-slate-500 ${
                                    isInputExpanded ? 'h-32' : 'h-12'
                                }`}
                                value={newNote.content}
                                onChange={(e) =>
                                    setNewNote({
                                        ...newNote,
                                        content: e.target.value,
                                    })
                                }
                            />
                            {isInputExpanded && (
                                <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100 gap-4">
                                    <div className="flex gap-1">
                                        {Object.keys(COLOR_MAP).map(
                                            (colorKey) => (
                                                <button
                                                    key={colorKey}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            colorKey
                                                        )
                                                    }
                                                    className={`w-6 h-6 rounded-full border ${
                                                        COLOR_MAP[colorKey]
                                                            .border
                                                    } ${
                                                        COLOR_MAP[colorKey].bg
                                                    } ${
                                                        selectedColor ===
                                                        colorKey
                                                            ? 'ring-2 ring-offset-1 ring-slate-400'
                                                            : ''
                                                    }`}
                                                />
                                            )
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsInputExpanded(false)
                                            }}
                                            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newNote.content.trim()}
                                            className="px-4 py-1 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min items-start">
                        {notes.map((note, index) => (
                            <div
                                key={note.id}
                                draggable={!note.isPinned}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`mb-4 break-inside-avoid inline-block w-full h-fit transition-transform ${
                                    !note.isPinned
                                        ? 'cursor-grab active:cursor-grabbing'
                                        : ''
                                }`}
                            >
                                <NoteCard
                                    note={note}
                                    onDelete={() => handleDelete(note.id)}
                                    onPin={(e) => togglePin(e, note)}
                                    onPrivacy={(e) => togglePrivacy(e, note)}
                                    onClick={() => setEditingNote(note)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    className={`w-full lg:w-96 shrink-0 ${
                        !showAgenda ? 'hidden lg:block' : 'block'
                    }`}
                >
                    <AgendaWidget userId={userId} />
                </div>
            </div>

            {editingNote && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setEditingNote(null)}
                >
                    <div
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                            COLOR_MAP[editingNote.color]?.bg || 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <input
                                className={`w-full text-xl font-bold bg-transparent outline-none text-slate-900 mb-2`}
                                value={editingNote.title}
                                onChange={(e) =>
                                    setEditingNote({
                                        ...editingNote,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Título"
                            />
                            <textarea
                                className={`w-full h-64 bg-transparent outline-none resize-none text-slate-800 leading-relaxed`}
                                value={editingNote.content}
                                onChange={(e) =>
                                    setEditingNote({
                                        ...editingNote,
                                        content: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-white/50 border-t border-black/5">
                            <div className="flex gap-1">
                                {Object.keys(COLOR_MAP).map((colorKey) => (
                                    <button
                                        key={colorKey}
                                        type="button"
                                        onClick={() =>
                                            setEditingNote({
                                                ...editingNote,
                                                color: colorKey,
                                            })
                                        }
                                        className={`w-6 h-6 rounded-full border ${COLOR_MAP[colorKey].border} ${COLOR_MAP[colorKey].bg} shadow-sm`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleUpdateNote}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                            >
                                <Save className="w-4 h-4" /> Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const NoteCard = ({ note, onDelete, onPin, onPrivacy, onClick }: any) => {
    const [isHovered, setIsHovered] = useState(false)
    const [copied, setCopied] = useState(false)
    const styles = COLOR_MAP[note.color] || COLOR_MAP['bg-yellow-100']
    const isLongContent =
        note.content.length > 200 || note.content.split('\n').length > 6

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`${note.title}\n${note.content}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    const handlePrivacyClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onPrivacy(e)
        setIsHovered(false)
    }

    return (
        <div
            onClick={onClick}
            className={`group relative p-5 rounded-xl border ${styles.border} ${styles.bg} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none h-full flex flex-col`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
        >
            {note.isPinned && (
                <div className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm text-brand-600 z-30">
                    <Pin className="w-4 h-4 fill-current" />
                </div>
            )}
            {!note.isPinned && isHovered && (
                <div className="absolute top-2 right-2 text-slate-400/50">
                    <GripVertical className="w-4 h-4" />
                </div>
            )}
            {note.title && (
                <h3 className="font-bold text-slate-800 mb-2 pr-6">
                    {note.title}
                </h3>
            )}
            <div
                className={`relative text-sm text-slate-700 whitespace-pre-wrap leading-relaxed transition-all duration-300 ${
                    note.isPrivate && !isHovered
                        ? 'blur-md opacity-50'
                        : 'blur-0 opacity-100'
                } overflow-hidden`}
            >
                <div className={isLongContent ? 'line-clamp-[6] max-h-40' : ''}>
                    {note.content}
                </div>
                {isLongContent && !note.isPrivate && (
                    <div
                        className={`absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t ${styles.gradient} to-transparent flex items-end justify-start pl-4 pb-1`}
                    >
                        <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-white/20">
                            Ver más...
                        </span>
                    </div>
                )}
            </div>
            <div
                className={`absolute bottom-2 right-2 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm z-20`}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onPin(e)
                    }}
                    className={`p-1.5 rounded hover:bg-white ${
                        note.isPinned ? 'text-brand-600' : 'text-slate-500'
                    }`}
                >
                    <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handlePrivacyClick}
                    className={`p-1.5 rounded hover:bg-white ${
                        note.isPrivate
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-500'
                    }`}
                >
                    {note.isPrivate ? (
                        <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                        <Eye className="w-3.5 h-3.5" />
                    )}
                </button>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded hover:bg-white text-slate-500 hover:text-blue-600"
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(note.id)
                    }}
                    className="p-1.5 rounded hover:bg-white text-slate-500 hover:text-red-600"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

// --- AGENDA WIDGET CORREGIDO (LÓGICA TEMPORAL) ---
const AgendaWidget = ({ userId }: { userId?: string }) => {
    const [events, setEvents] = useState<any[]>([])
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: new Date().toLocaleDateString('en-CA'),
        time: '',
        link: '',
        desc: '',
    })
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date()) // Reloj interno

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'agenda'),
            orderBy('date', 'asc')
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            )
        })
        return () => unsubscribe()
    }, [userId])

    // RELOJ: Actualiza cada 30 segundos para que las alertas se refresquen
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 30000)
        return () => clearInterval(interval)
    }, [])

    // --- LÓGICA DE ALERTAS CORREGIDA ---
    const getEventStatus = (dateStr: string, timeStr: string) => {
        if (!timeStr) return null

        // Creamos fechas comparables
        const eventDate = new Date(`${dateStr}T${timeStr}`)
        const now = new Date()

        // Diferencia en minutos
        const diffMs = eventDate.getTime() - now.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        // 1. AVISO PREVIO: Si faltan entre 0 y 60 min
        if (diffMins > 0 && diffMins <= 60) {
            return {
                type: 'soon',
                label: `En ${diffMins} min`,
                color: 'text-orange-600 bg-orange-50 border-orange-200',
                animate: true,
            }
        }

        // 2. EN CURSO: Desde el minuto 0 hasta 60 min después (-60)
        // Ejemplo: Si son las 10:30 y el evento fue 10:00, diffMins es -30. (Mostrar "En curso")
        // Si son las 11:01, diffMins es -61. (Ocultar)
        if (diffMins <= 0 && diffMins > -60) {
            return {
                type: 'now',
                label: 'En curso',
                color: 'text-red-600 bg-red-50 border-red-200',
                animate: true,
            }
        }

        // Si diffMins < -60 (ya pasó hace más de una hora), retorna null (sin alerta)
        return null
    }

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId || !newEvent.title) return
        await addDoc(collection(db, 'users', userId, 'agenda'), {
            ...newEvent,
            createdAt: new Date().toISOString(),
        })
        setNewEvent((prev) => ({
            title: '',
            date: selectedDate || prev.date,
            time: '',
            link: '',
            desc: '',
        }))
    }
    const handleDeleteEvent = async (id: string) => {
        if (userId) await deleteDoc(doc(db, 'users', userId, 'agenda', id))
    }
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        return { days, firstDay }
    }
    const { days, firstDay } = getDaysInMonth(currentDate)
    const monthName = currentDate.toLocaleString('es-ES', {
        month: 'long',
        year: 'numeric',
    })

    // Corregimos la comparación de fechas usando Strings simples para evitar problemas de zona horaria
    const todayStr = new Date().toLocaleDateString('en-CA')

    const displayEvents = selectedDate
        ? events.filter((e) => e.date === selectedDate)
        : events.filter((e) => e.date >= todayStr)

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            {/* (El resto del JSX del calendario se mantiene igual) */}
            <div className="bg-slate-50 p-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    currentDate.setMonth(
                                        currentDate.getMonth() - 1
                                    )
                                )
                            )
                        }
                        className="p-1 hover:bg-slate-200 rounded"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-slate-800 capitalize text-sm">
                        {monthName}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    currentDate.setMonth(
                                        currentDate.getMonth() + 1
                                    )
                                )
                            )
                        }
                        className="p-1 hover:bg-slate-200 rounded"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs gap-1 mb-1">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                        <span key={i} className="text-slate-400 font-bold">
                            {d}
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array(firstDay)
                        .fill(null)
                        .map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                    {Array(days)
                        .fill(null)
                        .map((_, i) => {
                            const day = i + 1
                            const dateObj = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                day
                            )
                            const dateStr = dateObj.toLocaleDateString('en-CA')
                            const hasEvent = events.some(
                                (e) => e.date === dateStr
                            )
                            const isSelected = selectedDate === dateStr
                            const isToday = dateStr === todayStr
                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        setSelectedDate(
                                            isSelected ? null : dateStr
                                        )
                                        if (!isSelected)
                                            setNewEvent((prev) => ({
                                                ...prev,
                                                date: dateStr,
                                            }))
                                    }}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs relative transition-all ${
                                        isSelected
                                            ? 'bg-brand-600 text-white font-bold'
                                            : isToday
                                            ? 'bg-brand-100 text-brand-700 font-bold'
                                            : 'hover:bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {day}
                                    {hasEvent && !isSelected && (
                                        <span className="absolute bottom-1 w-1 h-1 bg-brand-500 rounded-full"></span>
                                    )}
                                </button>
                            )
                        })}
                </div>
                {selectedDate && (
                    <div className="mt-3 text-center">
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-xs text-brand-600 hover:underline"
                        >
                            Ver todos los eventos
                        </button>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                <form
                    onSubmit={handleAddEvent}
                    className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200"
                >
                    <input
                        type="text"
                        required
                        placeholder="Título..."
                        className="w-full p-2 text-sm border rounded"
                        value={newEvent.title}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                        }
                    />
                    <div className="relative">
                        <textarea
                            placeholder="Descripción (Opcional)"
                            className="w-full p-2 text-sm border rounded h-16 resize-none"
                            value={newEvent.desc}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    desc: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            required
                            className="flex-1 p-2 text-sm border rounded"
                            value={newEvent.date}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    date: e.target.value,
                                })
                            }
                        />
                        <input
                            type="time"
                            className="w-20 p-2 text-sm border rounded"
                            value={newEvent.time}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    time: e.target.value,
                                })
                            }
                        />
                    </div>
                    <input
                        type="url"
                        placeholder="Link de Reunión (Meet/Zoom)"
                        className="w-full p-2 text-sm border rounded"
                        value={newEvent.link}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, link: e.target.value })
                        }
                    />
                    <button
                        type="submit"
                        className="w-full bg-slate-800 text-white py-1.5 rounded text-xs font-bold hover:bg-black flex items-center justify-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Agregar a la agenda
                    </button>
                </form>
                {displayEvents.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-4">
                        No hay eventos para esta fecha.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {displayEvents.map((ev) => {
                            // AQUÍ LLAMAMOS A LA FUNCIÓN QUE SE ACTUALIZA CON 'currentTime'
                            const status = getEventStatus(ev.date, ev.time)

                            return (
                                <div
                                    key={ev.id}
                                    className={`group relative flex flex-col gap-1 p-3 rounded-lg border transition-colors bg-white ${
                                        status?.type === 'now'
                                            ? 'border-red-300 shadow-sm'
                                            : 'border-slate-100 hover:border-brand-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-center bg-slate-100 px-2 py-1 rounded min-w-[40px]">
                                                <span className="block text-[10px] text-slate-500 uppercase">
                                                    {new Date(
                                                        ev.date
                                                    ).toLocaleString('es-ES', {
                                                        month: 'short',
                                                        timeZone: 'UTC',
                                                    })}
                                                </span>
                                                <span className="block text-sm font-bold text-slate-800">
                                                    {new Date(
                                                        ev.date
                                                    ).getUTCDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                                    {ev.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {ev.time && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Clock className="w-3 h-3" />{' '}
                                                            {ev.time}
                                                        </span>
                                                    )}
                                                    {/* ALERTA VISUAL */}
                                                    {status && (
                                                        <span
                                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 relative ${status.color}`}
                                                        >
                                                            {status.animate && (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                                            )}
                                                            <AlertCircle className="w-3 h-3" />{' '}
                                                            {status.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteEvent(ev.id)
                                            }
                                            className="text-slate-300 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {ev.desc && (
                                        <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex gap-2 items-start">
                                            <AlignLeft className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                            <p className="leading-relaxed">
                                                {ev.desc}
                                            </p>
                                        </div>
                                    )}
                                    {ev.link && (
                                        <a
                                            href={ev.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 w-fit inline-flex items-center gap-1 text-[10px] text-brand-700 bg-brand-50 px-2 py-1 rounded-full hover:bg-brand-100 border border-brand-100"
                                        >
                                            <Video className="w-3 h-3" /> Unirse
                                            a reunión
                                        </a>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
