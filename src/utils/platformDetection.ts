import { Capacitor } from '@capacitor/core';

/**
 * Detecta si la aplicación está corriendo en Electron
 */
export const isElectron = (): boolean => {
    return navigator.userAgent.toLowerCase().includes(' electron/');
};

/**
 * Detecta si la aplicación está corriendo en un navegador web
 * (no es móvil ni Electron)
 */
export const isWeb = (): boolean => {
    return !Capacitor.isNativePlatform() && !isElectron();
};

/**
 * Detecta si la aplicación está corriendo en una plataforma móvil
 * (Android o iOS con Capacitor)
 */
export const isMobile = (): boolean => {
    return Capacitor.isNativePlatform();
};

/**
 * Obtiene el nombre de la plataforma actual
 */
export const getPlatformName = (): 'mobile' | 'electron' | 'web' => {
    if (isMobile()) return 'mobile';
    if (isElectron()) return 'electron';
    return 'web';
};
