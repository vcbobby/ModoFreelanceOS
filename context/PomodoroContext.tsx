import React, { createContext, useContext, useState, useEffect } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

interface PomodoroContextType {
    timeLeft: number
    isActive: boolean
    mode: 'work' | 'short' | 'long'
    toggleTimer: () => void
    switchMode: (mode: 'work' | 'short' | 'long') => void
    resetTimer: () => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
    undefined
)

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [mode, setMode] = useState<'work' | 'short' | 'long'>('work')
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval: any = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
        } else if (timeLeft === 0 && isActive) {
            handleComplete()
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    const handleComplete = async () => {
        setIsActive(false)
        const title = mode === 'work' ? '¡Tiempo de descanso!' : '¡A trabajar!'
        const body =
            mode === 'work' ? 'Tómate 5 minutos.' : 'Hora de enfocarse.'

        if (Capacitor.isNativePlatform()) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: 999,
                        schedule: { at: new Date(Date.now() + 100) },
                    },
                ],
            })
        } else if (
            'Notification' in window &&
            Notification.permission === 'granted'
        ) {
            new Notification(title, { body })
        } else if (
            'Notification' in window &&
            Notification.permission !== 'denied'
        ) {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') new Notification(title, { body })
            })
        }
        // Sonido simple
        const audio = new Audio(
            'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
        )
        audio.play().catch((e) => console.log('Audio play failed', e))
    }

    const toggleTimer = () => setIsActive(!isActive)

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
    }

    const resetTimer = () => switchMode(mode)

    return (
        <PomodoroContext.Provider
            value={{
                timeLeft,
                isActive,
                mode,
                toggleTimer,
                switchMode,
                resetTimer,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    )
}

export const usePomodoro = () => {
    const context = useContext(PomodoroContext)
    if (!context)
        throw new Error('usePomodoro must be used within a PomodoroProvider')
    return context
}
