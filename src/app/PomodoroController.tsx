import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useAppDispatch, useAppSelector } from '@/app/hooks/storeHooks';
import { stopTimer, tick, resumeTimer } from '@/app/slices/pomodoroSlice';
import { addToast } from '@/app/slices/uiSlice';

export const PomodoroController = () => {
  const dispatch = useAppDispatch();
  const { isActive, timeLeft, mode } = useAppSelector((state) => state.pomodoro);

  // 1. Sync Timer on Resume & Request Permissions
  useEffect(() => {
    // Request Permissions on Mount
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    }

    const handleResume = async () => {
      const saved = localStorage.getItem('pomodoro_session');
      if (!saved) return;

      try {
        const { endTime, mode: savedMode } = JSON.parse(saved);
        const now = Date.now();
        const remaining = Math.round((endTime - now) / 1000);

        if (remaining > 0) {
          // Timer running, update remaining time
          if (isActive || remaining !== timeLeft) {
            dispatch(resumeTimer({ timeLeft: remaining, mode: savedMode }));
          }
        } else {
          // Timer finished in background
          dispatch(resumeTimer({ timeLeft: 0, mode: savedMode }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    let sub: any;
    if (Capacitor.isNativePlatform()) {
      sub = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) handleResume();
      });
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleResume();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (sub) sub.then((s: any) => s.remove());
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dispatch, isActive, timeLeft]);

  // 2. Persistence & Notification Scheduling
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem('pomodoro_session', JSON.stringify({ endTime, mode }));

      // Schedule background notification for when timer ends (Native Only)
      if (Capacitor.isNativePlatform()) {
        // Cancel previous to avoid duplicates
        LocalNotifications.cancel({ notifications: [{ id: 1001 }] }).then(() => {
          LocalNotifications.schedule({
            notifications: [
              {
                id: 1001,
                title: mode === 'work' ? '¡Tiempo de descanso!' : '¡A trabajar!',
                body:
                  mode === 'work' ? 'Tu sesión de enfoque ha terminado.' : 'El descanso terminó.',
                schedule: { at: new Date(endTime) },
                smallIcon: 'ic_stat_icon_config_sample', // Android specific icon if available
                sound: 'beep.wav',
              },
            ],
          }).catch(() => {});
        });
      }
    } else if (!isActive && timeLeft > 0) {
      // Paused manually
      localStorage.removeItem('pomodoro_session');
      if (Capacitor.isNativePlatform()) {
        LocalNotifications.cancel({ notifications: [{ id: 1001 }] }).catch(() => {});
      }
    }
  }, [isActive, timeLeft, mode]); // Trigger when timer state changes

  // 3. Ticker (Active Interval)
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch, isActive]);

  // 4. Timer Finished (Foreground handling)
  useEffect(() => {
    if (!isActive || timeLeft > 0) return;

    localStorage.removeItem('pomodoro_session');

    // Clear scheduled notification since we are handling it now
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.cancel({ notifications: [{ id: 1001 }] }).catch(() => {});
    }

    const title = mode === 'work' ? '¡Tiempo de descanso!' : '¡A trabajar!';
    const body = mode === 'work' ? 'Tómate 5 minutos.' : 'Hora de enfocarse.';

    const triggerNotifications = async () => {
      // Foreground Notification (if not native, or redundant)
      if (!Capacitor.isNativePlatform()) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') new Notification(title, { body });
          });
        }
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
