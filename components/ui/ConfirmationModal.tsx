import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean // Para poner el botón rojo si es borrar
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = false,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`p-3 rounded-full shrink-0 ${
                                isDanger
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-brand-100 text-brand-600'
                            }`}
                        >
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                    {/* Si cancelText está vacío, no renderizamos este botón */}
                    {cancelText && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
