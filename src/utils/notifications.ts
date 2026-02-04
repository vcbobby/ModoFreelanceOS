import { LocalNotifications } from '@capacitor/local-notifications'
import { isWeb } from './platform'

export async function showNotification(title: string, body: string) {
    if (isWeb) {
        // Web: Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
        }
    } else {
        // Android/Windows: Capacitor
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + 100) },
                },
            ],
        })
    }
}

export async function requestNotificationPermission() {
    if (isWeb) {
        return await Notification.requestPermission()
    } else {
        const result = await LocalNotifications.requestPermissions()
        return result.display
    }
}
