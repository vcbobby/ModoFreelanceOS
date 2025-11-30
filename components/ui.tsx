import React from 'react'
import { Loader2, Lock, Check } from 'lucide-react'

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
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
            'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm',
        outline:
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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

// --- Card ---
export const Card: React.FC<{
    children: React.ReactNode
    className?: string
}> = ({ children, className = '' }) => (
    <div
        className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
        {children}
    </div>
)

// --- Pricing Modal ---
interface PricingModalProps {
    isOpen: boolean
    onClose: () => void
    onSubscribe: () => void
}

export const PricingModal: React.FC<PricingModalProps> = ({
    isOpen,
    onClose,
    onSubscribe,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 text-brand-600 mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Desbloquea ModoFreelanceOS Pro
                    </h2>
                    <p className="text-slate-600 mt-2">
                        Gana tu próximo proyecto por menos de lo que cuesta una
                        pizza.
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-slate-900">
                            $10
                        </span>
                        <span className="text-slate-500 ml-1">/ mes</span>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-1">
                        Cancela cuando quieras.
                    </p>
                </div>

                <ul className="space-y-3 mb-8">
                    {[
                        'Generador ilimitado de propuestas IA',
                        'Wizard de Briefing para clientes ilimitado',
                        'Plantillas de contratos descargables',
                        'Soporte prioritario',
                    ].map((item, i) => (
                        <li key={i} className="flex items-start">
                            <Check className="w-5 h-5 text-brand-600 mr-3 flex-shrink-0" />
                            <span className="text-slate-700 text-sm">
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    variant="primary"
                    className="w-full text-lg py-3"
                    onClick={onSubscribe}
                >
                    Suscribirme Ahora
                </Button>
                <button
                    onClick={onClose}
                    className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600"
                >
                    Quizás más tarde
                </button>
            </div>
        </div>
    )
}
