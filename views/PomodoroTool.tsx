import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain, Bell } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export const PomodoroTool = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
    const [cycle, setCycle] = useState(0)

    const tips = {
        work: [
            '¡Enfócate en una sola cosa!',
            'Aleja el celular.',
            'Si te distraes, anótalo y sigue.',
            'Estás construyendo tu futuro.',
        ],
        short: [
            'Estira las piernas.',
            'Mira por la ventana (Regla 20-20-20).',
            'Toma un vaso de agua.',
            'Respira profundo 10 veces.',
        ],
        long: [
            'Camina un poco.',
            'No mires pantallas.',
            'Come un snack saludable.',
            'Medita unos minutos.',
        ],
    }
    const [currentTip, setCurrentTip] = useState(tips.work[0])

    useEffect(() => {
        let interval: any = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
        } else if (timeLeft === 0) {
            handleComplete()
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const handleComplete = async () => {
        setIsActive(false)
        const nextMode =
            mode === 'work'
                ? (cycle + 1) % 4 === 0
                    ? 'long'
                    : 'short'
                : 'work'
        if (mode === 'work') setCycle((c) => c + 1)

        // Notificación
        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title:
                            mode === 'work'
                                ? '¡Tiempo de descanso! ☕'
                                : '¡A trabajar! 🚀',
                        body:
                            mode === 'work'
                                ? 'Buen trabajo. Tómate un break.'
                                : 'Hora de enfocarse de nuevo.',
                        id: Math.floor(Math.random() * 1000),
                        schedule: { at: new Date(Date.now() + 100) },
                    },
                ],
            })
        } else if (
            'Notification' in window &&
            Notification.permission === 'granted'
        ) {
            new Notification(mode === 'work' ? '¡Descanso!' : '¡A trabajar!')
        }

        // Cambio automático (o esperar click, aquí esperamos click para cambiar configuración)
        // Solo cambiamos el tiempo, el usuario debe iniciar
        switchMode(nextMode)
    }

    const switchMode = (newMode: 'work' | 'short' | 'long') => {
        setMode(newMode)
        setIsActive(false)
        setTimeLeft(
            newMode === 'work'
                ? 25 * 60
                : newMode === 'short'
                ? 5 * 60
                : 15 * 60
        )
        setCurrentTip(
            tips[newMode][Math.floor(Math.random() * tips[newMode].length)]
        )
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const progress =
        100 -
        (timeLeft / (mode === 'work' ? 1500 : mode === 'short' ? 300 : 900)) *
            100

    return (
        <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-brand-600" /> Pomodoro Focus
            </h2>

            <Card className="p-8 relative overflow-hidden transition-colors duration-500 border-2 border-slate-100 dark:border-slate-700">
                {/* Barra de Progreso Circular (Simulada con CSS simple) */}
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-700">
                    {/* SVG para el circulo de progreso */}
                    <svg
                        className="absolute inset-0 w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="transparent"
                            stroke={mode === 'work' ? '#16a34a' : '#3b82f6'}
                            strokeWidth="8"
                            strokeDasharray="289"
                            strokeDashoffset={289 - (289 * progress) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="text-6xl font-mono font-bold text-slate-800 dark:text-white z-10">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => switchMode('work')}
                        className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                            mode === 'work'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'text-slate-400'
                        }`}
                    >
                        Trabajo
                    </button>
                    <button
                        onClick={() => switchMode('short')}
                        className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                            mode === 'short'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'text-slate-400'
                        }`}
                    >
                        Corto
                    </button>
                    <button
                        onClick={() => switchMode('long')}
                        className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                            mode === 'long'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'text-slate-400'
                        }`}
                    >
                        Largo
                    </button>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="p-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                    >
                        {isActive ? (
                            <Pause className="w-8 h-8" />
                        ) : (
                            <Play className="w-8 h-8 ml-1" />
                        )}
                    </button>
                    <button
                        onClick={() => switchMode(mode)}
                        className="p-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-transform active:scale-95"
                    >
                        <RotateCcw className="w-8 h-8" />
                    </button>
                </div>

                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                        {mode === 'work' ? (
                            <Brain className="w-4 h-4" />
                        ) : (
                            <Coffee className="w-4 h-4" />
                        )}
                        {currentTip}
                    </p>
                </div>
            </Card>
        </div>
    )
}
