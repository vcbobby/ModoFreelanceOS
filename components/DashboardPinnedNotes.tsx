import React, { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { StickyNote, ArrowRight } from 'lucide-react'

interface DashboardPinnedNotesProps {
    userId: string
    onGoToNotes: () => void
}

export const DashboardPinnedNotes: React.FC<DashboardPinnedNotesProps> = ({
    userId,
    onGoToNotes,
}) => {
    const [pinnedNotes, setPinnedNotes] = useState<any[]>([])

    useEffect(() => {
        if (!userId) return
        // Buscamos solo donde isPinned == true
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

    if (pinnedNotes.length === 0) return null // Si no hay notas fijadas, no mostramos nada

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
                            className={`p-4 rounded-xl border ${borderColor} ${note.color} shadow-sm`}
                        >
                            {note.title && (
                                <h4 className="font-bold text-slate-800 mb-1">
                                    {note.title}
                                </h4>
                            )}
                            <p
                                className={`text-sm text-slate-700 line-clamp-3 ${
                                    note.isPrivate ? 'blur-sm select-none' : ''
                                }`}
                            >
                                {note.content}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
