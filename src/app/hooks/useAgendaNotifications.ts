import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@config/firebase';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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

  // Función auxiliar para notificaciones nativas (Solo móvil)
  const triggerNativeNotification = async (
    idStr: string,
    title: string,
    body: string,
    scheduledDate?: Date
  ) => {
    if (!Capacitor.isNativePlatform()) {
      // Si estamos en Web/Electron y la app está abierta, disparamos una notificación de navegador inmediata si es el momento
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        // Si no hay fecha programada (es inmediata) o si la fecha programada es AHORA
        const isNow = !scheduledDate || Math.abs(scheduledDate.getTime() - Date.now()) < 60000;
        if (isNow) {
          new Notification(title, { body });
        }
      }
      return;
    }

    // Generar ID numérico único seguro
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash << 5) - hash + idStr.charCodeAt(i);
      hash |= 0;
    }
    const notifId = Math.abs(hash);

    try {
      if (scheduledDate && scheduledDate.getTime() < Date.now()) return; // No programar en el pasado

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: notifId,
            schedule: { at: scheduledDate || new Date(Date.now() + 1000) },
            // smallIcon: 'ic_stat_icon_config_sample', // Comentado por seguridad (recurso faltante)
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (e) {
      void e;
    }
  };

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
            triggerNativeNotification(
              `${doc.id}_30min`,
              'Recordatorio Próximo ⏳',
              `Tu evento "${data.title}" comienza en 30 minutos.`,
              alertDate
            );
          }

          // También programar notificación de inicio exacto
          if (startDate.getTime() > Date.now()) {
            triggerNativeNotification(
              doc.id,
              '¡Inicia Ahora! 📅',
              `${data.title} comienza ya.`,
              startDate
            );
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
            triggerNativeNotification(doc.id, 'Recordatorio de Pago 💰', msg, alertDate);
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
