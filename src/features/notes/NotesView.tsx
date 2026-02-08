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
import { db } from '@config/firebase'
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
    Edit3,
    ListChecks,
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
        bg: 'bg-yellow-100 dark:bg-yellow-900/40',
        border: 'border-yellow-200 dark:border-yellow-700',
        gradient: 'from-yellow-100 dark:from-yellow-900',
    },
    'bg-green-100': {
        bg: 'bg-green-100 dark:bg-green-900/40',
        border: 'border-green-200 dark:border-green-700',
        gradient: 'from-green-100 dark:from-green-900',
    },
    'bg-blue-100': {
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        border: 'border-blue-200 dark:border-blue-700',
        gradient: 'from-blue-100 dark:from-blue-900',
    },
    'bg-red-100': {
        bg: 'bg-red-100 dark:bg-red-900/40',
        border: 'border-red-200 dark:border-red-700',
        gradient: 'from-red-100 dark:from-red-900',
    },
    'bg-purple-100': {
        bg: 'bg-purple-100 dark:bg-purple-900/40',
        border: 'border-purple-200 dark:border-purple-700',
        gradient: 'from-purple-100 dark:from-purple-900',
    },
    'bg-slate-100': {
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-200 dark:border-slate-600',
        gradient: 'from-slate-100 dark:from-slate-800',
    },
}

export const NotesView: React.FC<NotesViewProps> = ({
    userId,
    autoOpenAgenda,
}) => {
    const isE2E = import.meta.env.VITE_E2E === 'true'
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState({ title: '', content: '' })
    const [selectedColor, setSelectedColor] = useState('bg-yellow-100')
    const [isInputExpanded, setIsInputExpanded] = useState(false)

    // Estado para el modal de edición
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [editMode, setEditMode] = useState<'view' | 'edit'>('view') // Nuevo estado para alternar vista

    const [showAgenda, setShowAgenda] = useState(false)
    const dragItem = useRef<number | null>(null)
    const dragOverItem = useRef<number | null>(null)

    const getE2eKey = (id?: string) => `e2e_notes_${id || 'anon'}`
    const loadE2eNotes = () => {
        if (!userId) return [] as Note[]
        try {
            const raw = localStorage.getItem(getE2eKey(userId))
            if (!raw) return [] as Note[]
            return JSON.parse(raw) as Note[]
        } catch (error) {
            console.error('Error leyendo notas E2E', error)
            return [] as Note[]
        }
    }
    const saveE2eNotes = (nextNotes: Note[]) => {
        if (!userId) return
        localStorage.setItem(getE2eKey(userId), JSON.stringify(nextNotes))
    }

    useEffect(() => {
        if (autoOpenAgenda) setShowAgenda(true)
    }, [autoOpenAgenda])

    useEffect(() => {
        if (!userId) return
        if (isE2E) {
            setNotes(loadE2eNotes())
            return
        }
        const q = query(
            collection(db, 'users', userId, 'notes'),
            orderBy('createdAt', 'desc'),
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
    }, [isE2E, userId])

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.content.trim() || !userId) return
        const newOrder = notes.length + 1
        if (isE2E) {
            const createdAt = Date.now()
            const nextNotes = [
                {
                    id: `${createdAt}`,
                    title: newNote.title,
                    content: newNote.content,
                    color: selectedColor,
                    isPinned: false,
                    isPrivate: false,
                    order: newOrder,
                    createdAt,
                },
                ...notes,
            ]
            setNotes(nextNotes)
            saveE2eNotes(nextNotes)
        } else {
            await addDoc(collection(db, 'users', userId, 'notes'), {
                title: newNote.title,
                content: newNote.content,
                color: selectedColor,
                isPinned: false,
                isPrivate: false,
                order: newOrder,
                createdAt: serverTimestamp(),
            })
        }
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
        if (isE2E) {
            saveE2eNotes(_notes)
        } else {
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
        }
        dragItem.current = null
        dragOverItem.current = null
    }

    // --- FUNCIÓN UNIFICADA PARA TACHAR TAREAS ---
    const handleToggleCheck = async (
        note: Note,
        lineIndex: number,
        isEditingModal = false,
    ) => {
        if (!userId) return
        const lines = note.content.split('\n')
        const line = lines[lineIndex]

        if (line.includes('☐')) {
            lines[lineIndex] = line.replace('☐', '☑')
        } else if (line.includes('☑')) {
            lines[lineIndex] = line.replace('☑', '☐')
        } else {
            return
        }

        const newContent = lines.join('\n')

        // Si estamos en el modal, actualizamos su estado local también
        if (isEditingModal && editingNote) {
            setEditingNote({ ...editingNote, content: newContent })
        }

        if (isE2E) {
            const nextNotes = notes.map((n) =>
                n.id === note.id ? { ...n, content: newContent } : n,
            )
            setNotes(nextNotes)
            saveE2eNotes(nextNotes)
        } else {
            // Actualizar en Firebase (esto disparará el onSnapshot y actualizará la lista principal)
            await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
                content: newContent,
            })
        }
    }

    const handleUpdateNote = async () => {
        if (editingNote && userId) {
            if (isE2E) {
                const nextNotes = notes.map((n) =>
                    n.id === editingNote.id ? editingNote : n,
                )
                setNotes(nextNotes)
                saveE2eNotes(nextNotes)
            } else {
                await updateDoc(doc(db, 'users', userId, 'notes', editingNote.id), {
                    title: editingNote.title,
                    content: editingNote.content,
                    color: editingNote.color,
                })
            }
            setEditingNote(null)
        }
    }
    const handleDelete = async (id: string) => {
        if (!userId) return
        if (isE2E) {
            const nextNotes = notes.filter((note) => note.id !== id)
            setNotes(nextNotes)
            saveE2eNotes(nextNotes)
        } else {
            await deleteDoc(doc(db, 'users', userId, 'notes', id))
        }
    }
    const togglePin = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation()
        if (!userId) return
        if (isE2E) {
            const nextNotes = notes.map((n) =>
                n.id === note.id ? { ...n, isPinned: !note.isPinned } : n,
            )
            setNotes(nextNotes)
            saveE2eNotes(nextNotes)
        } else {
            await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
                isPinned: !note.isPinned,
            })
        }
    }
    const togglePrivacy = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation()
        if (!userId) return
        if (isE2E) {
            const nextNotes = notes.map((n) =>
                n.id === note.id ? { ...n, isPrivate: !note.isPrivate } : n,
            )
            setNotes(nextNotes)
            saveE2eNotes(nextNotes)
        } else {
            await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
                isPrivate: !note.isPrivate,
            })
        }
    }

    // Al abrir una nota, decidimos si mostrar vista o edición
    const openNoteModal = (note: Note) => {
        setEditingNote(note)
        // Si tiene checkboxes, abrimos en modo "vista" para que sea interactivo.
        // Si es texto plano, abrimos en modo "edit" directamente.
        if (note.content.includes('☐') || note.content.includes('☑')) {
            setEditMode('view')
        } else {
            setEditMode('edit')
        }
    }
    const insertCheckbox = () => {
        if (!editingNote) return
        // Añadimos el checkbox al final o en una nueva línea
        const currentContent = editingNote.content
        const newContent =
            currentContent +
            (currentContent.endsWith('\n') || currentContent === ''
                ? ''
                : '\n') +
            '☐ '
        setEditingNote({ ...editingNote, content: newContent })
        // Forzamos modo edición para que el usuario escriba
        setEditMode('edit')
    }

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <StickyNote className="w-8 h-8 text-brand-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Tablero de Notas
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                            className={`bg-white dark:bg-slate-800 border shadow-sm rounded-2xl overflow-hidden transition-all ${
                                isInputExpanded
                                    ? 'ring-2 ring-brand-500 shadow-lg'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                            onClick={() => setIsInputExpanded(true)}
                        >
                            {isInputExpanded && (
                                <input
                                    type="text"
                                    placeholder="Título..."
                                    className="w-full px-4 pt-4 pb-2 text-lg font-bold text-slate-800 dark:text-white dark:bg-slate-800 outline-none placeholder:text-slate-400"
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
                                className={`w-full px-4 py-3 resize-none outline-none text-slate-700 dark:text-slate-200 dark:bg-slate-800 placeholder:text-slate-500 ${
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
                                <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 gap-4">
                                    <div className="flex gap-1">
                                        {Object.keys(COLOR_MAP).map(
                                            (colorKey) => (
                                                <button
                                                    key={colorKey}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            colorKey,
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
                                            ),
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setIsInputExpanded(false)
                                            }}
                                            className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
                                    onClick={() => openNoteModal(note)}
                                    onCheck={(lineIdx) =>
                                        handleToggleCheck(note, lineIdx)
                                    }
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

            {/* MODAL DE EDICIÓN MEJORADO */}
            {editingNote && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setEditingNote(null)}
                >
                    <div
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
                            COLOR_MAP[editingNote.color]?.bg || 'bg-white'
                        } flex flex-col max-h-[80vh]`}
                        data-testid="note-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header con Título y Switch de Modo */}
                        <div className="p-4 flex flex-wrap justify-between items-center border-b border-black/5 dark:border-white/10 shrink-0">
                            <input
                                className={`flex-1 min-w-[50%] text-xl font-bold bg-transparent outline-none text-slate-900 dark:text-white mr-4`}
                                value={editingNote.title}
                                onChange={(e) =>
                                    setEditingNote({
                                        ...editingNote,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Título"
                            />

                            {/* FIX DE UI: Usamos flex-none para que el contenedor de botones no se encoja */}
                            <div className="flex bg-black/5 dark:bg-white/10 rounded-lg p-1 flex-none mt-2 md:mt-0">
                                <button
                                    onClick={insertCheckbox}
                                    className="p-1.5 rounded-md text-slate-500 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 transition-colors mr-2"
                                    title="Agregar Tarea"
                                >
                                    <span className="font-bold text-lg leading-none">
                                        +☐
                                    </span>
                                </button>

                                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                                <button
                                    onClick={() => setEditMode('view')}
                                    className={`p-1.5 rounded-md transition-colors ${
                                        editMode === 'view'
                                            ? 'bg-white dark:bg-slate-700 shadow-sm'
                                            : 'text-slate-500'
                                    }`}
                                    title="Modo Interactivo (Checklist)"
                                >
                                    <ListChecks className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditMode('edit')}
                                    className={`p-1.5 rounded-md transition-colors ${
                                        editMode === 'edit'
                                            ? 'bg-white dark:bg-slate-700 shadow-sm'
                                            : 'text-slate-500'
                                    }`}
                                    title="Modo Edición de Texto"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Cuerpo (Scrollable) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            {editMode === 'edit' ? (
                                <textarea
                                    className={`w-full h-full min-h-[300px] bg-transparent outline-none resize-none text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-sm`}
                                    value={editingNote.content}
                                    onChange={(e) =>
                                        setEditingNote({
                                            ...editingNote,
                                            content: e.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                                    {editingNote.content
                                        .split('\n')
                                        .map((line: string, idx: number) => {
                                            // MODO INTERACTIVO DE CHECKBOXES
                                            if (line.trim().startsWith('☐')) {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                                                        onClick={() =>
                                                            handleToggleCheck(
                                                                editingNote,
                                                                idx,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <span className="text-slate-900 font-bold scale-125 mt-0.5">
                                                            ☐
                                                        </span>
                                                        <span>
                                                            {line
                                                                .replace(
                                                                    '☐',
                                                                    '',
                                                                )
                                                                .trim()}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            if (line.trim().startsWith('☑')) {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors opacity-50"
                                                        onClick={() =>
                                                            handleToggleCheck(
                                                                editingNote,
                                                                idx,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <span className="text-green-800 font-bold scale-125 mt-0.5">
                                                            ☑
                                                        </span>
                                                        <span className="line-through decoration-slate-600">
                                                            {line
                                                                .replace(
                                                                    '☑',
                                                                    '',
                                                                )
                                                                .trim()}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div
                                                    key={idx}
                                                    className="min-h-[1.5em] mb-1 whitespace-pre-wrap"
                                                >
                                                    {line}
                                                </div>
                                            )
                                        })}
                                    {!editingNote.content && (
                                        <p className="text-slate-400 italic">
                                            Escribe algo...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer (Colores y Guardar) */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-slate-900/50 border-t border-black/5 dark:border-white/10 shrink-0">
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
                                        className={`w-6 h-6 rounded-full border ${
                                            COLOR_MAP[colorKey].border
                                        } ${
                                            COLOR_MAP[colorKey].bg
                                        } shadow-sm transition-transform hover:scale-110 ${
                                            editingNote.color === colorKey
                                                ? 'ring-2 ring-slate-400'
                                                : ''
                                        }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleUpdateNote}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold hover:bg-black dark:hover:bg-slate-600 transition-colors shadow-lg"
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

// ... NoteCard y AgendaWidget (se mantienen igual que antes, asegúrate de copiarlos si no están) ...
const NoteCard = ({
    note,
    onDelete,
    onPin,
    onPrivacy,
    onClick,
    onCheck,
}: any) => {
    // ... Copia el contenido de NoteCard del mensaje anterior ...
    // (Por brevedad asumo que ya lo tienes, es el que tiene la lógica de renderizado de checkboxes)
    const [isHovered, setIsHovered] = useState(false)
    const [copied, setCopied] = useState(false)
    const styles = COLOR_MAP[note.color] || COLOR_MAP['bg-yellow-100']

    const lines = note.content.split('\n')
    const isLongContent = lines.length > 8 || note.content.length > 250

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
            data-testid="note-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
        >
            {note.isPinned && (
                <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-full shadow-sm text-brand-600 z-30">
                    <Pin className="w-4 h-4 fill-current" />
                </div>
            )}
            {!note.isPinned && isHovered && (
                <div className="absolute top-2 right-2 text-slate-400/50">
                    <GripVertical className="w-4 h-4" />
                </div>
            )}
            {note.title && (
                <h3 className="font-bold text-slate-800 dark:text-white mb-2 pr-6">
                    {note.title}
                </h3>
            )}
            <div
                className={`relative text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed transition-all duration-300 ${
                    note.isPrivate && !isHovered
                        ? 'blur-md opacity-50'
                        : 'blur-0 opacity-100'
                } overflow-hidden`}
            >
                <div className={isLongContent ? 'line-clamp-[8] max-h-60' : ''}>
                    {lines.map((line: string, idx: number) => {
                        if (line.trim().startsWith('☐')) {
                            return (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCheck(idx)
                                    }}
                                >
                                    <span className="text-brand-600 font-bold">
                                        ☐
                                    </span>
                                    <span>{line.replace('☐', '').trim()}</span>
                                </div>
                            )
                        }
                        if (line.trim().startsWith('☑')) {
                            return (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer transition-colors opacity-60"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCheck(idx)
                                    }}
                                >
                                    <span className="text-green-600 font-bold">
                                        ☑
                                    </span>
                                    <span className="line-through decoration-slate-400">
                                        {line.replace('☑', '').trim()}
                                    </span>
                                </div>
                            )
                        }
                        return <div key={idx}>{line}</div>
                    })}
                </div>
                {isLongContent && !note.isPrivate && (
                    <div
                        className={`absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t ${styles.gradient} to-transparent flex items-end justify-start pl-4 pb-1`}
                    >
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-white/20">
                            Ver más...
                        </span>
                    </div>
                )}
            </div>
            <div
                className={`absolute bottom-2 right-2 flex gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm z-20`}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onPin(e)
                    }}
                    className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 ${
                        note.isPinned
                            ? 'text-brand-600'
                            : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                    <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handlePrivacyClick}
                    className={`p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 ${
                        note.isPrivate
                            ? 'text-slate-900 dark:text-white font-bold'
                            : 'text-slate-500 dark:text-slate-400'
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
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
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
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

const AgendaWidget = ({ userId }: { userId?: string }) => {
    // ... (Copia el AgendaWidget que ya tenías, funciona bien)
    // Para ahorrar espacio, asumo que usas el mismo de la respuesta anterior
    // Si necesitas que lo pegue de nuevo, avísame.
    // ...
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
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'agenda'),
            orderBy('date', 'asc'),
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            )
        })
        return () => unsubscribe()
    }, [userId])

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 30000)
        return () => clearInterval(interval)
    }, [])

    const getEventStatus = (dateStr: string, timeStr: string) => {
        if (!timeStr) return null
        const eventDate = new Date(`${dateStr}T${timeStr}`)
        const now = new Date()
        const diffMs = eventDate.getTime() - now.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins > 0 && diffMins <= 60) {
            return {
                type: 'soon',
                label: `En ${diffMins} min`,
                color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
                animate: true,
            }
        }
        if (diffMins <= 0 && diffMins > -60) {
            return {
                type: 'now',
                label: 'En curso',
                color: 'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
                animate: true,
            }
        }
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
    const todayStr = new Date().toLocaleDateString('en-CA')
    const displayEvents = selectedDate
        ? events.filter((e) => e.date === selectedDate)
        : events.filter((e) => e.date >= todayStr)

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    currentDate.setMonth(
                                        currentDate.getMonth() - 1,
                                    ),
                                ),
                            )
                        }
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-white capitalize text-sm">
                        {monthName}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    currentDate.setMonth(
                                        currentDate.getMonth() + 1,
                                    ),
                                ),
                            )
                        }
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs gap-1 mb-1">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                        <span
                            key={i}
                            className="text-slate-400 dark:text-slate-500 font-bold"
                        >
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
                                day,
                            )
                            const dateStr = dateObj.toLocaleDateString('en-CA')
                            const hasEvent = events.some(
                                (e) => e.date === dateStr,
                            )
                            const isSelected = selectedDate === dateStr
                            const isToday = dateStr === todayStr
                            return (
                                <button
                                    key={day}
                                    onClick={() => {
                                        setSelectedDate(
                                            isSelected ? null : dateStr,
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
                                            ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
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
                            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                        >
                            Ver todos los eventos
                        </button>
                    </div>
                )}
            </div>
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                <form
                    onSubmit={handleAddEvent}
                    className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                    <input
                        type="text"
                        required
                        placeholder="Título..."
                        className="w-full p-2 text-sm border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded"
                        value={newEvent.title}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                        }
                    />
                    <div className="relative">
                        <textarea
                            placeholder="Descripción (Opcional)"
                            className="w-full p-2 text-sm border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded h-16 resize-none"
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
                            className="flex-1 p-2 text-sm border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded"
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
                            className="w-20 p-2 text-sm border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded"
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
                        className="w-full p-2 text-sm border dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded"
                        value={newEvent.link}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, link: e.target.value })
                        }
                    />
                    <button
                        type="submit"
                        className="w-full bg-slate-800 dark:bg-slate-700 text-white py-1.5 rounded text-xs font-bold hover:bg-black dark:hover:bg-slate-600 flex items-center justify-center gap-1"
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
                            const status = getEventStatus(ev.date, ev.time)
                            return (
                                <div
                                    key={ev.id}
                                    className={`group relative flex flex-col gap-1 p-3 rounded-lg border transition-colors bg-white dark:bg-slate-800 ${
                                        status?.type === 'now'
                                            ? 'border-red-300 dark:border-red-800 shadow-sm'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded min-w-[40px]">
                                                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                                                    {new Date(
                                                        ev.date,
                                                    ).toLocaleString('es-ES', {
                                                        month: 'short',
                                                        timeZone: 'UTC',
                                                    })}
                                                </span>
                                                <span className="block text-sm font-bold text-slate-800 dark:text-white">
                                                    {new Date(
                                                        ev.date,
                                                    ).getUTCDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                                    {ev.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {ev.time && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <Clock className="w-3 h-3" />{' '}
                                                            {ev.time}
                                                        </span>
                                                    )}
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
                                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-700 flex gap-2 items-start">
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
                                            className="mt-1 w-fit inline-flex items-center gap-1 text-[10px] text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-100 dark:border-brand-800"
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


