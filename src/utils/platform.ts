import { Capacitor } from '@capacitor/core'

export const isWeb = !Capacitor.isNativePlatform()
export const isAndroid = Capacitor.getPlatform() === 'android'
export const isIOS = Capacitor.getPlatform() === 'ios'
export const isElectron = !!(window as any).electron

export function getPlatform(): 'web' | 'android' | 'windows' {
    if (isElectron) return 'windows'
    if (isAndroid) return 'android'
    return 'web'
}
