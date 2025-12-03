import React from 'react'
import {
    Loader2,
    Lock,
    Check,
    X,
    Zap,
    Crown,
    Infinity,
    ShieldCheck,
} from 'lucide-react'

// --- Button ---
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
            'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm',
        outline:
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-500',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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

// --- Confirmation Modal (Lo agregamos aquí por si lo necesitas centralizado) ---
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
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-slate-600 text-sm">{message}</p>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                    {cancelText && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-brand-600 hover:bg-brand-700'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

// --- Pricing Modal (CORREGIDO RESPONSIVE) ---
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
    const [showCrypto, setShowCrypto] = React.useState(false)
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                // CAMBIOS AQUÍ: max-h-[90vh] y overflow-y-auto
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar flotante (Sticky para que baje con el scroll) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-20 bg-black/20 p-1 rounded-full backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Premium */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-8 text-center text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30 transform rotate-3">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                            ModoFreelance
                            <span className="text-brand-400">PRO</span>
                        </h2>
                        <p className="text-slate-300 text-sm font-medium">
                            Desbloquea el potencial total de tu negocio.
                        </p>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg text-slate-400 line-through font-medium">
                                $19.99
                            </span>
                            <span className="text-5xl font-extrabold text-slate-900">
                                $10
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-2">
                            <Infinity className="w-3 h-3" /> Pago Mensual
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <BenefitItem
                            text="Créditos ILIMITADOS en todas las herramientas."
                            highlighted
                        />
                        <BenefitItem
                            text="Asistente Personal IA 24/7 (Chatbot Conectado)."
                            highlighted
                        />
                        <Button
                            variant="primary"
                            className="w-full text-lg py-4 shadow-xl shadow-brand-200 mb-4"
                            onClick={onSubscribe}
                        >
                            <Zap className="w-5 h-5 mr-2 fill-current" /> Pago
                            automático con tarjeta
                        </Button>
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">
                                Métodos Manuales (Requiere verificación)
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {/* PAYPAL */}
                                <button
                                    onClick={() => {
                                        window.open(
                                            'https://www.paypal.com/ncp/payment/3Z97NWK3L8E5C',
                                            '_blank'
                                        )
                                        // Opcional: Abrir WhatsApp después de un momento
                                    }}
                                    className="flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-100"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                                        className="h-3.5"
                                        alt="PayPal"
                                    />
                                    PayPal
                                </button>

                                {/* CRYPTO */}
                                <button
                                    onClick={() => setShowCrypto(!showCrypto)}
                                    className="flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-bold transition-colors border border-green-100"
                                >
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-[8px]">
                                        T
                                    </div>
                                    USDT / Crypto
                                </button>
                            </div>

                            {/* SECCIÓN CRYPTO DESPLEGABLE */}
                            {showCrypto && (
                                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center text-xs animate-in fade-in">
                                    <img
                                        src="/binance-wallet.jpg"
                                        alt="Binance-wallet"
                                    />
                                    <p className="text-slate-500 mb-1">
                                        Red: <strong>BEP20</strong> (Tron)
                                    </p>
                                    <div className="bg-white p-2 rounded border border-slate-200 font-mono text-slate-800 select-all break-all mb-2">
                                        0x9040bc7c127d84fd0e0302762bd4a074899a9670
                                    </div>
                                </div>
                            )}

                            {/* BOTÓN DE CONFIRMACIÓN WHATSAPP (Clave para el proceso manual) */}
                            <div className="mt-4 text-center">
                                <p className="text-[10px] text-slate-400 mb-2">
                                    Una vez realizado el pago:
                                </p>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://wa.me/584144515357?text=${encodeURIComponent(
                                                'Hola, acabo de pagar el Plan PRO de ModoFreelanceOS vía PayPal/Crypto. Aquí está mi comprobante:'
                                            )}`,
                                            '_blank'
                                        )
                                    }
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                    >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    Enviar Comprobante por WhatsApp
                                </button>
                            </div>
                        </div>
                        <BenefitItem text="Módulo de Finanzas & Auditoría IA." />
                        <BenefitItem text="Generador de Logos HD (Modelo Flux)." />
                        <BenefitItem text="Analizador de Contratos con IA." />
                        <BenefitItem text="Descargas ilimitadas (Facturas, QR, Imágenes)." />
                        <BenefitItem text="Soporte prioritario y actualizaciones." />
                    </ul>

                    {/* <Button
                        variant="primary"
                        className="w-full text-lg py-4 shadow-xl shadow-brand-200 mb-4"
                        onClick={onSubscribe}
                    >
                        <Zap className="w-5 h-5 mr-2 fill-current" /> Obtener
                        Acceso Total
                    </Button> */}

                    <div className="text-center">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Pago seguro vía
                            Gumroad, PayPal o Crypto.
                        </p>
                    </div>
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
                ? 'bg-brand-50 p-2 rounded-lg border border-brand-100'
                : 'px-1'
        }`}
    >
        <div
            className={`mt-0.5 p-1 rounded-full ${
                highlighted
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-brand-600'
            }`}
        >
            <Check className="w-3 h-3" />
        </div>
        <span
            className={`text-sm ${
                highlighted
                    ? 'font-bold text-brand-900'
                    : 'text-slate-600 font-medium'
            }`}
        >
            {text}
        </span>
    </li>
)
