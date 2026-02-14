import { useEffect } from 'react';
import { messaging, db } from '@config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAppDispatch } from '@/app/hooks/storeHooks';
import { addToast } from '@/app/slices/uiSlice';

export const usePushNotifications = (userId: string | undefined) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId || window.location.protocol === 'file:') return;

    const requestPermission = async () => {
      try {
        // Solo pedir permiso en navegadores (Web)
        // Para Android/Capacitor se requiere configuración adicional en el repo nativo
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Necesitarás esta variable
            });

            if (token) {
              // Guardar token en Firestore
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
              });
            }
          }
        }
      } catch (error) {
        console.error('Error al registrar notificaciones push:', error);
      }
    };

    requestPermission();

    // Escuchar mensajes en primer plano
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('FCM: Mensaje recibido en primer plano!', payload);

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

    return () => unsubscribe();
  }, [userId]);
};
