import React from 'react'
import { X, FileText, ShieldCheck } from 'lucide-react'

interface LegalModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    content: string
}

export const LegalModal: React.FC<LegalModalProps> = ({
    isOpen,
    onClose,
    title,
    content,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        {title.includes('Privacidad') ? (
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                        ) : (
                            <FileText className="w-5 h-5 text-brand-400" />
                        )}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* CONTENIDO (SCROLL) */}
                <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    )
}
