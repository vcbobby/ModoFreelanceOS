import React from 'react'
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
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
        // 1. CONTENEDOR PRINCIPAL: Fijo a la pantalla, Z-Index alto, Flex para centrar
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 2. EL BACKDROP (Fondo Oscuro): Separado de la tarjeta */}
            {/* Cubre toda la pantalla y cierra el modal al hacer click fuera */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* 3. LA TARJETA DEL MODAL */}
            {/* Debe ser 'relative' para estar encima del backdrop, NO 'absolute inset-0' */}
            <div
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()} // Evita que el click en la tarjeta cierre el modal
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`p-3 rounded-full shrink-0 ${
                                isDanger
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                            }`}
                        >
                            {isDanger ? (
                                <AlertTriangle className="w-6 h-6" />
                            ) : (
                                <CheckCircle2 className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                        {/* Botón X opcional para cerrar arriba a la derecha */}
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                    {cancelText && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all active:scale-95 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200 dark:shadow-none'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
