import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@config/firebase';
import { notificationService } from '@/services/notificationService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'agenda' | 'finance';
  severity: 'normal' | 'urgent';
  route: string;
}

export const useAgendaNotifications = (userId: string | undefined) => {
  const isE2E = (import.meta as any).env?.VITE_E2E === 'true';
  // Estados internos para separar las fuentes de datos
  const [agendaNotifs, setAgendaNotifs] = useState<AppNotification[]>([]);
  const [financeNotifs, setFinanceNotifs] = useState<AppNotification[]>([]);

  // Solicitar permisos al montar el hook
  useEffect(() => {
    if (!isE2E) {
      notificationService.requestPermission().catch(console.error);
    }
  }, [isE2E]);

  useEffect(() => {
    if (isE2E || !userId) return;

    const today = new Date();
    // Ajustar a medianoche para comparar fechas string correctamente
    // Usamos la fecha local para evitar desfases de zona horaria con 'en-CA'
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`; // YYYY-MM-DD local

    // Fecha límite (Hoy + 2 días)
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 2);
    const lYear = limitDate.getFullYear();
    const lMonth = String(limitDate.getMonth() + 1).padStart(2, '0');
    const lDay = String(limitDate.getDate()).padStart(2, '0');
    const limitStr = `${lYear}-${lMonth}-${lDay}`;

    // --- LISTENER 1: AGENDA ---
    const qAgenda = query(
      collection(db, 'users', userId, 'agenda'),
      where('date', '>=', todayStr),
      where('date', '<=', limitStr)
    );

    const unsubAgenda = onSnapshot(qAgenda, (snap) => {
      const items = snap.docs.map((doc) => {
        const data = doc.data();
        const eventDate = data.date;
        const eventTime = data.time; // Formato HH:mm
        const isToday = eventDate === todayStr;

        // PROGRAMACIÓN PROACTIVA (30 minutos antes)
        if (eventTime && eventDate) {
          const [hours, minutes] = eventTime.split(':').map(Number);
          const startDate = new Date(
            `${eventDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
          );
          const alertDate = new Date(startDate.getTime() - 30 * 60 * 1000); // 30 mins antes

          if (alertDate.getTime() > Date.now()) {
            notificationService
              .scheduleNotification({
                id: `${doc.id}_30min`,
                title: 'Recordatorio Próximo ⏳',
                body: `Tu evento "${data.title}" comienza en 30 minutos.`,
                scheduledDate: alertDate,
              })
              .catch(console.error);
          }

          // También programar notificación de inicio exacto
          if (startDate.getTime() > Date.now()) {
            notificationService
              .scheduleNotification({
                id: doc.id,
                title: '¡Inicia Ahora! 📅',
                body: `${data.title} comienza ya.`,
                scheduledDate: startDate,
              })
              .catch(console.error);
          }
        }

        return {
          id: doc.id,
          title: isToday ? '¡Evento Hoy!' : 'Evento Próximo',
          message: `${data.title} - ${data.time}`,
          date: data.date,
          type: 'agenda' as const,
          severity: (isToday ? 'urgent' : 'normal') as 'urgent' | 'normal',
          route: 'NOTES',
        };
      });
      setAgendaNotifs(items);
    });

    // --- LISTENER 2: FINANZAS ---
    // Incluimos TODO lo pendiente (incluyendo atrasados) para que el badge sea útil
    const qFinance = query(
      collection(db, 'users', userId, 'finances'),
      where('status', '==', 'pending')
      // Quitamos el límite de fecha superior para asegurar que el usuario vea deudas antiguas
    );

    const unsubFinance = onSnapshot(qFinance, (snap) => {
      const items = snap.docs.map((doc) => {
        const data = doc.data();
        const isUrgent = data.date <= todayStr; // Urgente si es hoy o ya pasó
        const msg = `${data.type === 'income' ? 'Cobrar' : 'Pagar'}: $${
          data.amount
        } (${data.description})`;

        // Programar recordatorio para hoy a las 9 AM si vence hoy
        if (data.date === todayStr) {
          const alertDate = new Date();
          alertDate.setHours(9, 0, 0, 0);
          if (alertDate.getTime() > Date.now()) {
            notificationService
              .scheduleNotification({
                id: doc.id,
                title: 'Recordatorio de Pago 💰',
                body: msg,
                scheduledDate: alertDate,
              })
              .catch(console.error);
          }
        }

        return {
          id: doc.id,
          title:
            data.date < todayStr
              ? '¡Atrasado!'
              : data.date === todayStr
                ? 'Vence Hoy'
                : 'Próximamente',
          message: msg,
          date: data.date,
          type: 'finance' as const,
          severity: (isUrgent ? 'urgent' : 'normal') as 'urgent' | 'normal',
          route: 'FINANCES',
        };
      });
      // Filtramos en el cliente para el estado combinado si queremos mantener el límite visual de 2 días
      setFinanceNotifs(items);
    });

    // Limpieza de listeners al desmontar
    return () => {
      unsubAgenda();
      unsubFinance();
    };
  }, [isE2E, userId]);

  // --- UNIFICACIÓN DE ESTADOS ---
  const combined = useMemo(() => {
    if (isE2E || !userId) return [];
    return [...agendaNotifs, ...financeNotifs].sort((a, b) => a.date.localeCompare(b.date));
  }, [agendaNotifs, financeNotifs, isE2E, userId]);

  return combined;
};
