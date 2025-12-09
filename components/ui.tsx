import React from 'react'
import {
    Loader2,
    X,
    Zap,
    Crown,
    Infinity,
    ShieldCheck,
    Check,
    AlertTriangle,
} from 'lucide-react'

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles =
        'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary:
            'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm',
        secondary:
            'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 focus:ring-slate-900 shadow-sm',
        outline:
            'border focus:ring-brand-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
        ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    )
}

// --- CARD ---
export const Card: React.FC<{
    children: React.ReactNode
    className?: string
}> = ({ children, className = '' }) => (
    <div
        className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
    >
        {children}
    </div>
)

// --- CONFIRMATION MODAL ---
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700 scale-100"
                onClick={(e) => e.stopPropagation()}
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
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
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
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all ${
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

// --- PRICING MODAL ---
interface PricingModalProps {
    isOpen: boolean
    onClose: () => void
    onSubscribe: () => void
    isPro?: boolean
}

export const PricingModal: React.FC<PricingModalProps> = ({
    isOpen,
    onClose,
    onSubscribe,
    isPro = false,
}) => {
    if (!isOpen) return null
    const GUMROAD_MANAGE_URL = 'https://app.gumroad.com/library'
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col dark:border dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-1 rounded-full backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Premium */}
                <div
                    className={`p-8 text-center text-white relative overflow-hidden shrink-0 ${
                        isPro
                            ? 'bg-gradient-to-br from-green-600 to-emerald-800'
                            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900'
                    }`}
                >
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm transform rotate-3">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                            {isPro ? '¡Eres PRO!' : 'ModoFreelance PRO'}
                        </h2>
                        <p className="text-white/80 text-sm font-medium">
                            {isPro
                                ? 'Gracias por apoyar el proyecto.'
                                : 'Desbloquea el potencial total de tu negocio.'}
                        </p>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {/* CONTENIDO DINÁMICO: SI ES PRO vs SI NO LO ES */}

                    {isPro ? (
                        // VISTA PARA USUARIOS PRO (GESTIÓN)
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                <p className="text-green-800 dark:text-green-300 font-bold mb-1">
                                    Tu suscripción está activa ✅
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Tienes acceso ilimitado a todas las
                                    herramientas de IA.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    ¿Necesitas actualizar tu tarjeta o cancelar?
                                </p>
                                <Button
                                    onClick={() =>
                                        window.open(
                                            GUMROAD_MANAGE_URL,
                                            '_blank'
                                        )
                                    }
                                    className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800"
                                >
                                    Gestionar Suscripción en Gumroad
                                </Button>
                                <p className="text-xs text-slate-400 mt-2">
                                    Serás redirigido a tu biblioteca de Gumroad.
                                </p>
                            </div>
                        </div>
                    ) : (
                        // VISTA DE VENTA (LA ORIGINAL)
                        <>
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg text-slate-400 dark:text-slate-500 line-through font-medium">
                                        $19.99
                                    </span>
                                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
                                        $10
                                    </span>
                                    <span className="text-md text-slate-400 dark:text-slate-300 font-medium">
                                        USD / mes
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-2">
                                    <Infinity className="w-3 h-3" /> Acceso
                                    Total
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <BenefitItem
                                    text="Créditos ILIMITADOS en todas las herramientas."
                                    highlighted
                                />
                                <BenefitItem
                                    text="Generador de Videos Cortos (Shorts) con IA."
                                    highlighted
                                />
                                <BenefitItem text="Asistente Personal IA 24/7 con memoria." />
                                <BenefitItem text="Generador de Portafolios & Casos de Estudio." />
                                <BenefitItem text="Checklists Automáticos desde Briefs." />
                                <BenefitItem text="Finanzas Avanzadas & Auditoría." />
                            </ul>

                            <Button
                                variant="primary"
                                className="w-full text-lg py-4 shadow-xl shadow-brand-200 dark:shadow-none mb-4"
                                onClick={onSubscribe}
                            >
                                <Zap className="w-5 h-5 mr-2 fill-current" />{' '}
                                Pagar seguro con Gumroad
                            </Button>

                            <div className="text-center">
                                <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />{' '}
                                    Procesado por Gumroad.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Componente interno para lista de beneficios
const BenefitItem = ({
    text,
    highlighted = false,
}: {
    text: string
    highlighted?: boolean
}) => (
    <li
        className={`flex items-start gap-3 ${
            highlighted
                ? 'bg-brand-50 dark:bg-brand-900/10 p-2 rounded-lg border border-brand-100 dark:border-brand-800'
                : 'px-1'
        }`}
    >
        <div
            className={`mt-0.5 p-1 rounded-full ${
                highlighted
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400'
            }`}
        >
            <Check className="w-3 h-3" />
        </div>
        <span
            className={`text-sm ${
                highlighted
                    ? 'font-bold text-brand-900 dark:text-brand-100'
                    : 'text-slate-600 dark:text-slate-300 font-medium'
            }`}
        >
            {text}
        </span>
    </li>
)
