import React, { useState } from 'react'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button, Card } from '../components/ui'

interface BriefingToolProps {
    onUsage: () => void
}

export const BriefingTool: React.FC<BriefingToolProps> = ({ onUsage }) => {
    const [step, setStep] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    const steps = [
        {
            title: 'Bienvenida',
            description:
                'Hola! Antes de empezar, necesito entender exactamente qué buscas para no hacerte perder tiempo.',
            type: 'intro',
        },
        {
            title: 'Estilo Visual',
            description: '¿Qué vibra buscas para tu proyecto?',
            type: 'choice',
            options: [
                'Minimalista & Limpio',
                'Colorido & Juguetón',
                'Corporativo & Serio',
                'Lujoso & Elegante',
            ],
        },
        {
            title: 'Recursos Existentes',
            description: '¿Ya tienes logotipo o guía de marca?',
            type: 'choice',
            options: [
                'Sí, tengo todo listo',
                'Tengo logo pero no manual',
                'No tengo nada aún',
            ],
        },
        {
            title: 'Presupuesto Real',
            description:
                'Esto ayuda a definir el alcance realista del proyecto.',
            type: 'budget',
            options: ['<$500', '$500 - $1,000', '$1,000 - $3,000', '$3,000+'],
        },
    ]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            setIsFinished(true)
            onUsage()
        }
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1)
    }

    if (isFinished) {
        return (
            <div className="max-w-2xl mx-auto text-center pt-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    ¡Brief Generado!
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
                    En la versión completa, esto genera un PDF limpio con los
                    requisitos del cliente y te lo envía por email.
                </p>
                <Card className="p-6 bg-slate-50 dark:bg-slate-900 text-left mb-8 border-dashed border-2 border-slate-300 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                        Resumen del Cliente:
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                        <li>• Estilo: Minimalista & Limpio</li>
                        <li>• Recursos: No tengo nada aún</li>
                        <li>• Presupuesto: $1,000 - $3,000</li>
                    </ul>
                </Card>
                <Button
                    onClick={() => {
                        setIsFinished(false)
                        setStep(0)
                    }}
                >
                    Crear otro Brief
                </Button>
            </div>
        )
    }

    const currentStep = steps[step]

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Briefing Wizard
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Así es como tu cliente verá el formulario. Profesional y
                    guiado.
                </p>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mb-8">
                <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>

            <Card className="p-8 md:p-12 min-h-[400px] flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 dark:bg-brand-900/10 rounded-bl-full -z-0" />

                <div className="relative z-10">
                    <span className="text-xs font-bold tracking-wider text-brand-600 dark:text-brand-400 uppercase mb-2 block">
                        Paso {step + 1} de {steps.length}
                    </span>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {currentStep.title}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                        {currentStep.description}
                    </p>

                    {(currentStep.type === 'choice' ||
                        currentStep.type === 'budget') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentStep.options?.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={handleNext}
                                    className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-left transition-all group"
                                >
                                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-400">
                                        {opt}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    {currentStep.type === 'intro' && (
                        <div className="flex items-center justify-center h-32 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                            (Vista previa de contenido introductorio)
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 relative z-10">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Atrás
                    </Button>

                    {currentStep.type === 'intro' && (
                        <Button onClick={handleNext}>
                            Comenzar
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
