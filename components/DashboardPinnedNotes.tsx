import React, { useState, useEffect } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
} from 'firebase/firestore'
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
    const [selectedNote, setSelectedNote] = useState<any>(null)

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

    // --- LÓGICA DE TACHADO MEJORADA ---
    const handleToggleCheck = async (note: any, lineIndex: number) => {
        if (!userId) return

        // 1. Clonar el array de líneas para modificarlo
        const lines = note.content.split('\n')
        const currentLine = lines[lineIndex]

        let newLine = currentLine
        if (currentLine.includes('☐')) {
            newLine = currentLine.replace('☐', '☑')
        } else if (currentLine.includes('☑')) {
            newLine = currentLine.replace('☑', '☐')
        } else {
            return // No es un checkbox, salir.
        }

        lines[lineIndex] = newLine
        const newContent = lines.join('\n')

        // 2. Actualizar el estado local del MODAL para que se vea el cambio inmediatamente
        setSelectedNote((prev: any) => ({ ...prev, content: newContent }))

        // 3. Actualizar la base de datos en segundo plano
        await updateDoc(doc(db, 'users', userId, 'notes', note.id), {
            content: newContent,
        })
    }

    if (pinnedNotes.length === 0) return null

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-brand-600" /> Fijado
                </h3>
                <button
                    onClick={onGoToNotes}
                    className="text-sm text-brand-600 hover:underline flex items-center gap-1 dark:text-brand-400"
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
                            onClick={() => setSelectedNote(note)}
                            className={`p-4 rounded-xl border ${borderColor} ${note.color} shadow-sm cursor-pointer hover:shadow-md transition-all h-32 flex flex-col`}
                        >
                            {note.title && (
                                <h4 className="font-bold text-slate-800 mb-1 truncate">
                                    {note.title}
                                </h4>
                            )}
                            <div className="text-sm text-slate-700 overflow-hidden flex-1 opacity-80">
                                {note.content
                                    .split('\n')
                                    .slice(0, 3)
                                    .map((l: string, i: number) => (
                                        <div key={i} className="truncate">
                                            {l}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* MODAL DE LECTURA E INTERACCIÓN */}
            {selectedNote && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedNote(null)}
                >
                    <div
                        // Nota: Mantenemos el color original de la nota, no aplicamos dark mode aquí
                        // porque los post-its suelen ser de colores específicos.
                        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${selectedNote.color} relative animate-in zoom-in-95 duration-200`}
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
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 pr-8">
                                    {selectedNote.title}
                                </h3>
                            )}

                            <div className="text-slate-800 text-base leading-relaxed">
                                {selectedNote.content
                                    .split('\n')
                                    .map((line: string, idx: number) => {
                                        // PENDIENTE
                                        if (line.trim().startsWith('☐')) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 rounded-lg cursor-pointer transition-colors"
                                                    onClick={() =>
                                                        handleToggleCheck(
                                                            selectedNote,
                                                            idx
                                                        )
                                                    }
                                                >
                                                    <span className="text-slate-900 font-bold scale-125 mt-0.5">
                                                        ☐
                                                    </span>
                                                    <span>
                                                        {line
                                                            .replace('☐', '')
                                                            .trim()}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        // COMPLETADA
                                        if (line.trim().startsWith('☑')) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-3 py-1.5 px-2 -mx-2 hover:bg-black/5 rounded-lg cursor-pointer transition-colors opacity-50"
                                                    onClick={() =>
                                                        handleToggleCheck(
                                                            selectedNote,
                                                            idx
                                                        )
                                                    }
                                                >
                                                    <span className="text-green-800 font-bold scale-125 mt-0.5">
                                                        ☑
                                                    </span>
                                                    <span className="line-through decoration-slate-600">
                                                        {line
                                                            .replace('☑', '')
                                                            .trim()}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        // TEXTO NORMAL
                                        return (
                                            <div
                                                key={idx}
                                                className="min-h-[1.5em] mb-1"
                                            >
                                                {line}
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white/40 border-t border-black/5 flex justify-between items-center text-xs text-slate-600">
                            <span>Toca para completar.</span>
                            <button
                                onClick={onGoToNotes}
                                className="font-bold hover:underline bg-white/50 px-3 py-1.5 rounded-lg"
                            >
                                Ver en Tablero
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
