import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase'

export interface AppNotification {
    id: string
    type: 'agenda' | 'finance'
    title: string
    message: string
    route: string
    severity: 'warning' | 'urgent'
}

export const useAgendaNotifications = (userId: string | undefined) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([])

    useEffect(() => {
        if (!userId) return

        const today = new Date()
        // Normalizamos "hoy" a las 00:00:00 para comparar fechas puras
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toLocaleDateString('en-CA') // YYYY-MM-DD

        // 1. ESCUCHAR AGENDA (Eventos de HOY)
        // Filtramos desde la base de datos para traer solo los de hoy
        const qAgenda = query(
            collection(db, 'users', userId, 'agenda'),
            where('date', '==', todayStr)
        )

        const unsubAgenda = onSnapshot(qAgenda, (snapshot) => {
            const now = new Date()
            const agendaAlerts: AppNotification[] = []

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                if (data.time) {
                    const eventDate = new Date(`${data.date}T${data.time}`)
                    const diffMs = eventDate.getTime() - now.getTime()
                    const diffMins = Math.floor(diffMs / 60000)

                    // LOGICA MÁS AMPLIA:
                    // - Si faltan menos de 3 horas (180 min)
                    // - O si ya pasó hace menos de 1 hora (-60 min)
                    if (diffMins > -60) {
                        agendaAlerts.push({
                            id: doc.id,
                            type: 'agenda',
                            title:
                                diffMins <= 0
                                    ? 'En curso / Reciente'
                                    : 'Evento Hoy',
                            message: `${data.title} - ${data.time}`,
                            route: 'NOTES',
                            severity: diffMins <= 15 ? 'urgent' : 'warning', // Urgente si faltan 15 min
                        })
                    }
                } else {
                    // Si es un evento de todo el día (sin hora), mostrarlo siempre
                    agendaAlerts.push({
                        id: doc.id,
                        type: 'agenda',
                        title: 'Evento de Hoy',
                        message: data.title,
                        route: 'NOTES',
                        severity: 'warning',
                    })
                }
            })

            // Actualizamos estado combinando
            setNotifications((prev) => {
                const others = prev.filter((n) => n.type !== 'agenda')
                return [...others, ...agendaAlerts]
            })
        })

        // 2. ESCUCHAR FINANZAS (Pagos Pendientes)
        // Buscamos TODO lo que tenga status "pending"
        const qFinance = query(
            collection(db, 'users', userId, 'finances'),
            where('status', '==', 'pending')
        )

        const unsubFinance = onSnapshot(qFinance, (snapshot) => {
            const financeAlerts: AppNotification[] = []

            // Fecha de hoy normalizada (re-declarada por si acaso dentro del scope)
            const nowPure = new Date()
            nowPure.setHours(0, 0, 0, 0)

            snapshot.docs.forEach((doc) => {
                const data = doc.data()

                // Convertimos la fecha guardada "YYYY-MM-DD" a objeto Date
                // Agregamos "T00:00:00" para evitar líos de zona horaria al convertir
                const dueDate = new Date(data.date + 'T00:00:00')

                // Diferencia en días
                const diffTime = dueDate.getTime() - nowPure.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // CASO A: VENCIDO (Fecha menor a hoy) -> ROJO
                if (diffDays < 0) {
                    financeAlerts.push({
                        id: doc.id,
                        type: 'finance',
                        title:
                            data.type === 'income'
                                ? '¡Cobro Atrasado!'
                                : '¡Pago Vencido!',
                        message: `${data.description} ($${
                            data.amount
                        }) - Venció hace ${Math.abs(diffDays)} días`,
                        route: 'FINANCES',
                        severity: 'urgent',
                    })
                }
                // CASO B: PROXIMO (Hoy, Mañana, Pasado mañana) -> NARANJA
                else if (diffDays >= 0 && diffDays <= 3) {
                    financeAlerts.push({
                        id: doc.id,
                        type: 'finance',
                        title:
                            diffDays === 0
                                ? 'Vence HOY'
                                : `Vence en ${diffDays} días`,
                        message: `${data.description} ($${data.amount})`,
                        route: 'FINANCES',
                        severity: diffDays === 0 ? 'urgent' : 'warning',
                    })
                }
            })

            setNotifications((prev) => {
                const others = prev.filter((n) => n.type !== 'finance')
                return [...others, ...financeAlerts]
            })
        })

        return () => {
            unsubAgenda()
            unsubFinance()
        }
    }, [userId])

    return notifications
}
