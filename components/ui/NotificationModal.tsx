import React from 'react'
import { Calendar, DollarSign, X, BellOff, ArrowRight } from 'lucide-react'
import { AppNotification } from '../../hooks/useAgendaNotifications'

interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
    notifications: AppNotification[]
    onNavigate: (route: string) => void
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    notifications,
    onNavigate,
}) => {
    if (!isOpen) return null

    return (
        <>
            {/* Overlay transparente para cerrar al hacer clic fuera */}
            <div className="fixed inset-0 z-[60]" onClick={onClose}></div>

            {/* Dropdown (Posicionado absolutamente respecto al botón o fijo en mobile) */}
            <div className="absolute top-12 right-0 md:right-auto md:left-0 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wide">
                        Notificaciones ({notifications.length})
                    </span>
                    <button onClick={onClose}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                            <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Todo al día. Relájate 😎</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        onNavigate(notif.route)
                                        onClose()
                                    }}
                                    className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                                        notif.severity === 'urgent'
                                            ? 'border-l-red-500 bg-red-50/50'
                                            : 'border-l-orange-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                            {notif.type === 'agenda' ? (
                                                <Calendar className="w-3 h-3 text-slate-500" />
                                            ) : (
                                                <DollarSign className="w-3 h-3 text-slate-500" />
                                            )}
                                            <span
                                                className={`text-xs font-bold ${
                                                    notif.severity === 'urgent'
                                                        ? 'text-red-600'
                                                        : 'text-orange-600'
                                                }`}
                                            >
                                                {notif.title}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {notif.message}
                                    </p>
                                    <div className="mt-2 flex justify-end">
                                        <span className="text-[10px] text-brand-600 flex items-center gap-1 font-bold">
                                            Ver{' '}
                                            <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
