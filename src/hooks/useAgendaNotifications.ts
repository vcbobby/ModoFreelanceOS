import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export interface AppNotification {
    id: string
    title: string
    message: string
    date: string
    type: 'agenda' | 'finance'
    severity: 'normal' | 'urgent'
    route: string
}

export const useAgendaNotifications = (userId: string | undefined) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([])

    // Estados internos para separar las fuentes de datos
    const [agendaNotifs, setAgendaNotifs] = useState<AppNotification[]>([])
    const [financeNotifs, setFinanceNotifs] = useState<AppNotification[]>([])

    // Función auxiliar para notificaciones nativas (Solo móvil)
    const triggerNativeNotification = async (
        idStr: string,
        title: string,
        body: string,
    ) => {
        if (!Capacitor.isNativePlatform()) return

        // Generar ID numérico único seguro
        let hash = 0
        for (let i = 0; i < idStr.length; i++) {
            hash = (hash << 5) - hash + idStr.charCodeAt(i)
            hash |= 0
        }
        const notifId = Math.abs(hash)

        try {
            // Verificar si ya fue programada hoy para no spamear (Lógica simplificada)
            const pending = await LocalNotifications.getPending()
            const exists = pending.notifications.find((n) => n.id === notifId)

            if (!exists) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title,
                            body,
                            id: notifId,
                            schedule: { at: new Date(Date.now() + 1000) }, // En 1 segundo
                            smallIcon: 'ic_stat_icon_config_sample',
                            actionTypeId: '',
                            extra: null,
                        },
                    ],
                })
            }
        } catch (e) {
            console.error('Error notif nativa', e)
        }
    }

    useEffect(() => {
        if (!userId) {
            setNotifications([])
            return
        }

        const today = new Date()
        // Ajustar a medianoche para comparar fechas string correctamente
        // Usamos la fecha local para evitar desfases de zona horaria con 'en-CA'
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const todayStr = `${year}-${month}-${day}` // YYYY-MM-DD local

        // Fecha límite (Hoy + 2 días)
        const limitDate = new Date(today)
        limitDate.setDate(limitDate.getDate() + 2)
        const lYear = limitDate.getFullYear()
        const lMonth = String(limitDate.getMonth() + 1).padStart(2, '0')
        const lDay = String(limitDate.getDate()).padStart(2, '0')
        const limitStr = `${lYear}-${lMonth}-${lDay}`

        // --- LISTENER 1: AGENDA ---
        const qAgenda = query(
            collection(db, 'users', userId, 'agenda'),
            where('date', '>=', todayStr),
            where('date', '<=', limitStr),
        )

        const unsubAgenda = onSnapshot(qAgenda, (snap) => {
            const items = snap.docs.map((doc) => {
                const data = doc.data()
                const isUrgent = data.date === todayStr

                if (isUrgent)
                    triggerNativeNotification(
                        doc.id,
                        'Agenda Hoy 📅',
                        `${data.title} a las ${data.time}`,
                    )

                return {
                    id: doc.id,
                    title: isUrgent ? '¡Evento Hoy!' : 'Evento Próximo',
                    message: `${data.title} - ${data.time}`,
                    date: data.date,
                    type: 'agenda' as const,
                    severity: isUrgent ? 'urgent' : ('normal' as const),
                    route: 'NOTES',
                }
            })
            setAgendaNotifs(items)
        })

        // --- LISTENER 2: FINANZAS ---
        const qFinance = query(
            collection(db, 'users', userId, 'finances'),
            where('status', '==', 'pending'),
            where('date', '>=', todayStr),
            where('date', '<=', limitStr),
        )

        const unsubFinance = onSnapshot(qFinance, (snap) => {
            const items = snap.docs.map((doc) => {
                const data = doc.data()
                const isUrgent = data.date === todayStr
                const msg = `${data.type === 'income' ? 'Cobrar' : 'Pagar'}: $${
                    data.amount
                } (${data.description})`

                if (isUrgent)
                    triggerNativeNotification(doc.id, 'Finanzas 💰', msg)

                return {
                    id: doc.id,
                    title: isUrgent ? 'Vence Hoy' : 'Vence Pronto',
                    message: msg,
                    date: data.date,
                    type: 'finance' as const,
                    severity: isUrgent ? 'urgent' : ('normal' as const),
                    route: 'FINANCES',
                }
            })
            setFinanceNotifs(items)
        })

        // Limpieza de listeners al desmontar
        return () => {
            unsubAgenda()
            unsubFinance()
        }
    }, [userId])

    // --- UNIFICACIÓN DE ESTADOS ---
    useEffect(() => {
        // Unimos ambas listas y ordenamos por fecha
        const combined = [...agendaNotifs, ...financeNotifs].sort((a, b) =>
            a.date.localeCompare(b.date),
        )
        setNotifications(combined)
    }, [agendaNotifs, financeNotifs])

    return notifications
}
