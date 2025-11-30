import React, { useState } from 'react'
import {
    HelpCircle,
    X,
    MessageCircle,
    FileText,
    ChevronRight,
    ChevronDown,
    ExternalLink,
} from 'lucide-react'
import { LegalModal } from './ui/LegalModal'
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '../data/legalTexts'

export const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'faq' | 'support' | 'legal'>(
        'faq'
    )
    const [legalModalOpen, setLegalModalOpen] = useState(false)
    const [legalContent, setLegalContent] = useState({ title: '', text: '' })
    // DATOS: Preguntas Frecuentes
    const faqs = [
        {
            q: '¿Cómo funcionan los créditos?',
            a: 'Cada herramienta consume una cantidad diferente. Propuestas = 1 crédito, Logos = 2 créditos, Facturas = 3 créditos. Los usuarios FREE reciben 3 semanales. Los PRO son ilimitados.',
        },
        {
            q: '¿Cómo descargo una factura?',
            a: "Ve al generador, llena los datos y haz clic en 'Descargar'. Se guardará en tu historial automáticamente.",
        },
        {
            q: '¿Mis datos están seguros?',
            a: 'Sí, usamos autenticación segura de Google y tus datos se guardan en servidores encriptados.',
        },
        {
            q: '¿Cómo cancelo mi suscripción?',
            a: 'En esta versión, las suscripciones no se renuevan automaticamente, asi que no correras el riesgo de que se efectuen cargos en tu cuenta no deseados.',
        },
    ]
    const openLegal = (type: 'terms' | 'privacy') => {
        if (type === 'terms') {
            setLegalContent({
                title: 'Términos y Condiciones',
                text: TERMS_AND_CONDITIONS,
            })
        } else {
            setLegalContent({
                title: 'Política de Privacidad',
                text: PRIVACY_POLICY,
            })
        }
        setLegalModalOpen(true)
    }
    // DATOS: Mensajes predefinidos para WhatsApp
    const supportOptions = [
        {
            label: 'Reportar un error técnico',
            text: 'Hola, quiero reportar un error en la app...',
        },
        {
            label: 'Problema con mi pago',
            text: 'Hola, tuve un problema con mi pago o suscripción...',
        },
        {
            label: 'Sugerir una función',
            text: 'Hola, me gustaría sugerir una nueva función...',
        },
        {
            label: 'Contacto directo',
            text: 'Hola, necesito asistencia personalizada.',
        },
    ]

    const openWhatsApp = (text: string) => {
        const phone = '584144515357'
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* VENTANA DEL WIDGET */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 flex flex-col max-h-[500px]">
                    {/* HEADER */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                        <h3 className="font-bold flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-brand-400" />{' '}
                            Centro de Ayuda
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-slate-700 p-1 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-slate-100 shrink-0">
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
                                activeTab === 'faq'
                                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Preguntas
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
                                activeTab === 'support'
                                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Soporte
                        </button>
                        <button
                            onClick={() => setActiveTab('legal')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${
                                activeTab === 'legal'
                                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Legal
                        </button>
                    </div>

                    {/* CONTENIDO SCROLLABLE */}
                    <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                        {/* 1. SECCIÓN FAQ */}
                        {activeTab === 'faq' && (
                            <div className="space-y-3">
                                {faqs.map((item, i) => (
                                    <FAQItem
                                        key={i}
                                        question={item.q}
                                        answer={item.a}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 2. SECCIÓN SOPORTE (WHATSAPP) */}
                        {activeTab === 'support' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800 mb-4">
                                    <p>
                                        Estamos disponibles de Lunes a Viernes
                                        para ayudarte.
                                    </p>
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                                    Selecciona tu motivo:
                                </p>
                                {supportOptions.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => openWhatsApp(opt.text)}
                                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 hover:text-green-900 transition-all flex items-center justify-between group"
                                    >
                                        <span className="text-sm font-medium">
                                            {opt.label}
                                        </span>
                                        <MessageCircle className="w-4 h-4 text-slate-300 group-hover:text-green-500" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 3. SECCIÓN LEGAL */}
                        {activeTab === 'legal' && (
                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4" />{' '}
                                        Términos y Condiciones
                                    </h4>
                                    <p className="text-xs leading-relaxed mb-2">
                                        Al usar ModoFreelanceOS, aceptas usar
                                        las herramientas de manera ética. No nos
                                        hacemos responsables por el uso indebido
                                        de las propuestas generadas...
                                    </p>
                                    <button
                                        onClick={() => openLegal('terms')}
                                        className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        Leer documento completo{' '}
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4" />{' '}
                                        Política de Privacidad
                                    </h4>
                                    <p className="text-xs leading-relaxed mb-2">
                                        Respetamos tu privacidad. Tus datos de
                                        facturación y logos se guardan de forma
                                        segura y no se comparten con terceros.
                                        Solo tú tienes acceso a tu historial...
                                    </p>
                                    <button
                                        onClick={() => openLegal('privacy')}
                                        className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        Leer documento completo{' '}
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BOTÓN FLOTANTE */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg shadow-brand-200 transition-all duration-300 flex items-center justify-center ${
                    isOpen
                        ? 'bg-slate-800 rotate-90'
                        : 'bg-brand-600 hover:bg-brand-700 hover:scale-110'
                }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <HelpCircle className="w-6 h-6 text-white" />
                )}
            </button>
            <LegalModal
                isOpen={legalModalOpen}
                onClose={() => setLegalModalOpen(false)}
                title={legalContent.title}
                content={legalContent.text}
            />
        </div>
    )
}

// Componente Accordion para FAQ
const FAQItem = ({
    question,
    answer,
}: {
    question: string
    answer: string
}) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left bg-white hover:bg-slate-50 transition-colors"
            >
                <span className="text-sm font-semibold text-slate-700">
                    {question}
                </span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
            </button>
            {isOpen && (
                <div className="p-3 bg-slate-50 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    )
}
