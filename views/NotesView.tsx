import React, { useState, useEffect } from 'react'
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
} from 'firebase/firestore'
import { db } from '../firebase'
import {
    Plus,
    X,
    Pin,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    Check,
    StickyNote,
    Save,
} from 'lucide-react'

interface NotesViewProps {
    userId?: string
}

export interface Note {
    // Exportamos para usarla en el Dashboard luego
    id: string
    title: string
    content: string
    color: string
    isPinned: boolean
    isPrivate: boolean
    createdAt: any
}

export const NotesView: React.FC<NotesViewProps> = ({ userId }) => {
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState({ title: '', content: '' })
    const [selectedColor, setSelectedColor] = useState('bg-yellow-100')
    const [isInputExpanded, setIsInputExpanded] = useState(false)

    // ESTADO PARA EDICIÓN
    const [editingNote, setEditingNote] = useState<Note | null>(null)

    const colors = [
        {
            name: 'Amarillo',
            class: 'bg-yellow-100',
            border: 'border-yellow-200',
        },
        { name: 'Verde', class: 'bg-green-100', border: 'border-green-200' },
        { name: 'Azul', class: 'bg-blue-100', border: 'border-blue-200' },
        { name: 'Rojo', class: 'bg-red-100', border: 'border-red-200' },
        { name: 'Morado', class: 'bg-purple-100', border: 'border-purple-200' },
        { name: 'Gris', class: 'bg-slate-100', border: 'border-slate-200' },
    ]

    // 1. CARGA DE NOTAS
    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'notes'),
            orderBy('createdAt', 'desc')
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedNotes = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Note[]
            loadedNotes.sort((a, b) =>
                a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1
            )
            setNotes(loadedNotes)
        })
        return () => unsubscribe()
    }, [userId])

    // 2. CREAR NOTA
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.content.trim() || !userId) return
        await addDoc(collection(db, 'users', userId, 'notes'), {
            title: newNote.title,
            content: newNote.content,
            color: selectedColor,
            isPinned: false,
            isPrivate: false,
            createdAt: serverTimestamp(),
        })
        setNewNote({ title: '', content: '' })
        setIsInputExpanded(false)
    }

    // 3. ACTUALIZAR NOTA (NUEVO)
    const handleUpdateNote = async () => {
        if (!editingNote || !userId) return
        await updateDoc(doc(db, 'users', userId, 'notes', editingNote.id), {
            title: editingNote.title,
            content: editingNote.content,
            color: editingNote.color,
        })
        setEditingNote(null) // Cerrar modal
    }

    const handleDelete = async (id: string) => {
        if (userId) await deleteDoc(doc(db, 'users', userId, 'notes', id))
    }

    const togglePin = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation() // Evitar abrir el editor al dar click al pin
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
        <div className="max-w-6xl mx-auto min-h-screen pb-20">
            <div className="flex items-center gap-3 mb-8">
                <StickyNote className="w-8 h-8 text-brand-600" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Notas Rápidas
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Haz clic en una nota para editarla.
                    </p>
                </div>
            </div>

            {/* INPUT CREAR NOTA */}
            <div
                className={`mx-auto transition-all duration-300 ease-in-out mb-10 ${
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
                            placeholder="Título (Opcional)"
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
                            setNewNote({ ...newNote, content: e.target.value })
                        }
                    />
                    {isInputExpanded && (
                        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100 gap-4">
                            <div className="flex gap-1">
                                {colors.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() =>
                                            setSelectedColor(c.class)
                                        }
                                        className={`w-6 h-6 rounded-full border ${
                                            c.border
                                        } ${c.class} ${
                                            selectedColor === c.class
                                                ? 'ring-2 ring-offset-1 ring-slate-400'
                                                : ''
                                        }`}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
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

            {/* GRID DE NOTAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={() => handleDelete(note.id)}
                        onPin={(e) => togglePin(e, note)}
                        onPrivacy={(e) => togglePrivacy(e, note)}
                        onClick={() => setEditingNote(note)} // ABRIR MODAL
                    />
                ))}
            </div>

            {/* --- MODAL DE EDICIÓN --- */}
            {editingNote && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setEditingNote(null)}
                >
                    <div
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${editingNote.color}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4">
                            <input
                                className={`w-full text-xl font-bold bg-transparent outline-none placeholder-slate-500 text-slate-900 mb-2`}
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
                                className={`w-full h-48 bg-transparent outline-none resize-none text-slate-800 leading-relaxed`}
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
                                {colors.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() =>
                                            setEditingNote({
                                                ...editingNote,
                                                color: c.class,
                                            })
                                        }
                                        className={`w-6 h-6 rounded-full border ${c.border} ${c.class} shadow-sm`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleUpdateNote}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                            >
                                <Save className="w-4 h-4" /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const NoteCard = ({
    note,
    onDelete,
    onPin,
    onPrivacy,
    onClick,
}: {
    note: Note
    onDelete: (id: string) => void
    onPin: (e: any) => void
    onPrivacy: (e: any) => void
    onClick: () => void
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const borderColor = note.color
        .replace('bg-', 'border-')
        .replace('100', '200')

    return (
        <div
            onClick={onClick}
            className={`group relative p-5 rounded-xl border ${borderColor} ${note.color} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {note.isPinned && (
                <div className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1 rounded-full shadow-sm text-brand-600 z-10">
                    <Pin className="w-3 h-3 fill-current" />
                </div>
            )}
            {note.title && (
                <h3 className="font-bold text-slate-800 mb-2 pr-6">
                    {note.title}
                </h3>
            )}
            <div
                className={`text-sm text-slate-700 whitespace-pre-wrap leading-relaxed ${
                    note.isPrivate && !isHovered ? 'blur-sm select-none' : ''
                }`}
            >
                {note.content}
            </div>

            <div
                className={`absolute bottom-2 right-2 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <button
                    onClick={onPin}
                    className={`p-1.5 rounded hover:bg-white ${
                        note.isPinned ? 'text-brand-600' : 'text-slate-500'
                    }`}
                >
                    <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={onPrivacy}
                    className={`p-1.5 rounded hover:bg-white ${
                        note.isPrivate ? 'text-slate-800' : 'text-slate-500'
                    }`}
                >
                    {note.isPrivate ? (
                        <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                        <Eye className="w-3.5 h-3.5" />
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
