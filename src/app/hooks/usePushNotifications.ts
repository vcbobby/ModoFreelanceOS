import { useEffect } from 'react';
import { messaging, db } from '@config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAppDispatch } from '@/app/hooks/storeHooks';
import { addToast } from '@/app/slices/uiSlice';

declare global {
  interface Window {
    electronAPI?: {
      showNotification: (title: string, body: string) => void;
    };
  }
}

export const usePushNotifications = (userId: string | undefined) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const requestPermission = async () => {
      try {
        // Si estamos en Electron, usar la API puenteada
        if (window.electronAPI) {
          // No necesitamos pedir permiso en Electron, suele estar concedido o manejado por el OS
          return;
        }

        // Evitar ejecución en Electron/Desktop si no tenemos el puente (fallback)
        const isElectron = navigator.userAgent.toLowerCase().includes(' electron/');
        if (typeof window === 'undefined' || !('Notification' in window) || isElectron) {
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Verificar si tenemos la key antes de llamar a getToken
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          if (!vapidKey) return;

          const token = await getToken(messaging, {
            vapidKey: vapidKey,
          });

          if (token) {
            try {
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
              });
            } catch (e) {
              // Silently fail if Firestore update fails
            }
          }
        }
      } catch (error) {
        // Silently ensure we don't spam console on errors
      }
    };

    requestPermission();

    // Escuchar mensajes en primer plano
    return onMessage(messaging, (payload) => {
      if (payload.notification) {
        dispatch(
          addToast({
            title: payload.notification.title || 'Recordatorio',
            message: payload.notification.body || '',
            type: 'info',
          })
        );
      }
    });
  }, [userId]);
};
