import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { stopTimer, tick } from '@/app/slices/pomodoroSlice';

export const PomodoroController = () => {
  const dispatch = useAppDispatch();
  const { isActive, timeLeft, mode } = useAppSelector((state) => state.pomodoro);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch, isActive]);

  useEffect(() => {
    if (!isActive || timeLeft > 0) return;

    const title = mode === 'work' ? '¡Tiempo de descanso!' : '¡A trabajar!';
    const body = mode === 'work' ? 'Tómate 5 minutos.' : 'Hora de enfocarse.';

    const triggerNotifications = async () => {
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
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') new Notification(title, { body });
        });
      }

      const audio = new Audio(
        'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
      );
      audio.play().catch((error) => console.log('Audio play failed', error));
    };

    triggerNotifications().catch((error) => console.error('Pomodoro notif error', error));
    dispatch(stopTimer());
  }, [dispatch, isActive, mode, timeLeft]);

  return null;
};
