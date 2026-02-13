import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { stopTimer, tick, resumeTimer } from '@/app/slices/pomodoroSlice';
import { addToast } from '@/app/slices/uiSlice';

export const PomodoroController = () => {
  const dispatch = useAppDispatch();
  const { isActive, timeLeft, mode } = useAppSelector((state) => state.pomodoro);

  // Persistence: Restore timer on mount
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_session');
    if (!saved) return;

    try {
      const { endTime, mode: savedMode } = JSON.parse(saved);
      const remaining = Math.round((endTime - Date.now()) / 1000);

      if (remaining > 0) {
        dispatch(resumeTimer({ timeLeft: remaining, mode: savedMode }));
      } else {
        localStorage.removeItem('pomodoro_session');
      }
    } catch (_e) {
      localStorage.removeItem('pomodoro_session');
    }
  }, [dispatch]);

  // Persistence: Save timer on changes
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem('pomodoro_session', JSON.stringify({ endTime, mode }));
    } else if (!isActive) {
      localStorage.removeItem('pomodoro_session');
    }
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch, isActive]);

  useEffect(() => {
    if (!isActive || timeLeft > 0) return;

    localStorage.removeItem('pomodoro_session');
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

      dispatch(
        addToast({
          title,
          message: body,
          type: 'success',
        })
      );

      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch((error) => {
        void error;
      });
    };

    triggerNotifications().catch((error) => {
      void error;
    });
    dispatch(stopTimer());
  }, [dispatch, isActive, mode, timeLeft]);

  return null;
};
