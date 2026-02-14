import { LocalNotifications } from '@capacitor/local-notifications';
import { isMobile, isElectron, isWeb } from '../utils/platformDetection';

export interface NotificationOptions {
  id?: string;
  title: string;
  body: string;
  scheduledDate?: Date;
}

/**
 * Servicio unificado de notificaciones que funciona en todas las plataformas
 */
class NotificationService {
  private hasPermission = false;

  /**
   * Solicita permisos para mostrar notificaciones
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (isMobile()) {
        // Android/iOS con Capacitor
        const result = await LocalNotifications.requestPermissions();
        this.hasPermission = result.display === 'granted';
        return this.hasPermission;
      } else if (isElectron()) {
        // Electron no requiere permisos explícitos
        this.hasPermission = true;
        return true;
      } else if (isWeb()) {
        // Web con Notification API
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          this.hasPermission = permission === 'granted';
          return this.hasPermission;
        }
      }
      return false;
    } catch (error) {
      console.error('[NotificationService] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Muestra una notificación inmediata
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    try {
      if (isMobile()) {
        await this.showMobileNotification(options);
      } else if (isElectron()) {
        await this.showElectronNotification(options);
      } else if (isWeb()) {
        await this.showWebNotification(options);
      }
    } catch (error) {
      console.error('[NotificationService] Error showing notification:', error);
    }
  }

  /**
   * Programa una notificación para una fecha futura
   */
  async scheduleNotification(options: NotificationOptions): Promise<void> {
    if (!this.hasPermission) {
      await this.requestPermission();
    }

    if (!options.scheduledDate) {
      // Si no hay fecha programada, mostrar inmediatamente
      return this.showNotification(options);
    }

    // No programar en el pasado
    if (options.scheduledDate.getTime() < Date.now()) {
      return;
    }

    try {
      if (isMobile()) {
        await this.scheduleMobileNotification(options);
      } else if (isElectron()) {
        await this.scheduleElectronNotification(options);
      } else if (isWeb()) {
        await this.scheduleWebNotification(options);
      }
    } catch (error) {
      console.error('[NotificationService] Error scheduling notification:', error);
    }
  }

  // ==================== MOBILE (Android/iOS) ====================

  private async showMobileNotification(options: NotificationOptions): Promise<void> {
    const notifId = this.generateNumericId(options.id || `notif-${Date.now()}`);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: options.title,
          body: options.body,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo después
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  private async scheduleMobileNotification(options: NotificationOptions): Promise<void> {
    const notifId = this.generateNumericId(options.id || `notif-${Date.now()}`);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: options.title,
          body: options.body,
          schedule: { at: options.scheduledDate! },
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  // ==================== ELECTRON (Windows/Mac/Linux) ====================

  private async showElectronNotification(options: NotificationOptions): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.showNotification({
        title: options.title,
        body: options.body,
      });
    } else {
      console.warn('[NotificationService] Electron API not available');
    }
  }

  private async scheduleElectronNotification(options: NotificationOptions): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.scheduleNotification({
        title: options.title,
        body: options.body,
        scheduledTime: options.scheduledDate!.getTime(),
      });
    } else {
      console.warn('[NotificationService] Electron API not available');
    }
  }

  // ==================== WEB (Navegador) ====================

  private async showWebNotification(options: NotificationOptions): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, { body: options.body });
    }
  }

  private async scheduleWebNotification(options: NotificationOptions): Promise<void> {
    // Para Web, usamos setTimeout ya que Service Workers tienen limitaciones
    const delay = options.scheduledDate!.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        this.showWebNotification(options);
      }, delay);
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Genera un ID numérico único a partir de un string
   * (Requerido por LocalNotifications de Capacitor)
   */
  private generateNumericId(idStr: string): number {
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash << 5) - hash + idStr.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();
