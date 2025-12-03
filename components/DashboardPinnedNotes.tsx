import React, { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { StickyNote, ArrowRight, X } from 'lucide-react'

interface DashboardPinnedNotesProps {
    userId: string
    onGoToNotes: () => void
}

export const DashboardPinnedNotes: React.FC<DashboardPinnedNotesProps> = ({
    userId,
    onGoToNotes,
}) => {
    const [pinnedNotes, setPinnedNotes] = useState<any[]>([])
    const [selectedNote, setSelectedNote] = useState<any>(null) // Estado para el modal

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'users', userId, 'notes'),
            where('isPinned', '==', true)
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPinnedNotes(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            )
        })
        return () => unsubscribe()
    }, [userId])

    if (pinnedNotes.length === 0) return null

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-brand-600" /> Fijado
                </h3>
                <button
                    onClick={onGoToNotes}
                    className="text-sm text-brand-600 hover:underline flex items-center gap-1"
                >
                    Ver todas <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => {
                    const borderColor = note.color
                        .replace('bg-', 'border-')
                        .replace('100', '200')
                    return (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)} // Abrir modal al clic
                            className={`p-4 rounded-xl border ${borderColor} ${note.color} shadow-sm cursor-pointer hover:shadow-md transition-all h-32 flex flex-col`}
                        >
                            {note.title && (
                                <h4 className="font-bold text-slate-800 mb-1 truncate">
                                    {note.title}
                                </h4>
                            )}
                            <p
                                className={`text-sm text-slate-700 line-clamp-3 overflow-hidden flex-1 ${
                                    note.isPrivate ? 'blur-sm select-none' : ''
                                }`}
                            >
                                {note.content}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* MODAL DE LECTURA RÁPIDA */}
            {selectedNote && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedNote(null)}
                >
                    <div
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${selectedNote.color} relative`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedNote(null)}
                            className="absolute top-3 right-3 p-1 rounded-full bg-black/10 hover:bg-black/20 text-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {selectedNote.title && (
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    {selectedNote.title}
                                </h3>
                            )}
                            <div
                                className={`text-slate-800 text-base whitespace-pre-wrap leading-relaxed ${
                                    selectedNote.isPrivate
                                        ? 'blur-md hover:blur-0 transition-all'
                                        : ''
                                }`}
                            >
                                {selectedNote.content}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white/40 border-t border-black/5 flex justify-between items-center text-xs text-slate-600">
                            <span>
                                Creada el{' '}
                                {new Date(
                                    selectedNote.createdAt?.seconds * 1000
                                ).toLocaleDateString()}
                            </span>
                            <button
                                onClick={onGoToNotes}
                                className="font-bold hover:underline"
                            >
                                Editar en Notas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
