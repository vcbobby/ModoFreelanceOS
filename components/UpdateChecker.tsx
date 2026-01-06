import React, { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app' // <--- IMPORTANTE
import { ConfirmationModal } from './ui'

export const UpdateChecker = () => {
    const [showUpdate, setShowUpdate] = useState(false)
    const [updateData, setUpdateData] = useState<any>(null)

    // Detectar Electron (Windows) de forma sencilla
    const isElectron = navigator.userAgent.toLowerCase().includes(' electron/')

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // 1. Obtener la versión que dice el servidor (version.json)
                // Usamos timestamp para evitar que el navegador guarde caché vieja
                const res = await fetch(`/version.json?t=${Date.now()}`)
                const serverData = await res.json()

                let currentNativeVersion = '0.0.0'

                // 2. Obtener la versión REAL instalada en el dispositivo
                if (Capacitor.isNativePlatform()) {
                    const info = await App.getInfo()
                    currentNativeVersion = info.version // Ej: "1.0"

                    // Pequeño fix: a veces Android devuelve "1.0", y el json es "1.0.0"
                    // Normalizamos agregando .0 si falta
                    if (currentNativeVersion.split('.').length === 2) {
                        currentNativeVersion += '.0'
                    }
                } else if (isElectron) {
                    // En Electron Web Wrapper, es difícil leer el .exe sin IPC.
                    // Usaremos una constante de fallback o lógica web por ahora.
                    // Si quieres forzar update en windows, cambias esto manualmente antes de subir.
                    currentNativeVersion = '1.0.0' // Asumimos que los viejos son 1.0.0
                } else {
                    return // Si es web normal, no hacemos nada
                }

                console.log(
                    `Versión Instalada: ${currentNativeVersion} vs Nueva: ${serverData.version}`
                )

                // 3. Comparar
                if (isNewerVersion(currentNativeVersion, serverData.version)) {
                    setUpdateData(serverData)
                    setShowUpdate(true)
                }
            } catch (e) {
                console.error('Error verificando actualizaciones', e)
            }
        }

        checkVersion()
    }, [isElectron])

    // Función comparadora (Semantic Versioning)
    const isNewerVersion = (oldVer: string, newVer: string) => {
        const oldParts = oldVer.split('.').map(Number)
        const newParts = newVer.split('.').map(Number)

        for (let i = 0; i < Math.max(oldParts.length, newParts.length); i++) {
            const v1 = oldParts[i] || 0
            const v2 = newParts[i] || 0
            if (v2 > v1) return true
            if (v2 < v1) return false
        }
        return false
    }

    const handleUpdate = () => {
        if (!updateData) return

        if (Capacitor.isNativePlatform()) {
            // Android: Abrir enlace externo
            window.open(updateData.apkUrl, '_system')
        } else if (isElectron) {
            // Windows: Abrir enlace externo
            window.open(updateData.exeUrl, '_blank')
        }
    }

    return (
        <ConfirmationModal
            isOpen={showUpdate}
            onClose={() => {
                if (!updateData?.critical) setShowUpdate(false)
            }}
            onConfirm={handleUpdate}
            title="¡Actualización Necesaria! 🚀"
            message={
                updateData?.message ||
                'Hay una nueva versión de la app con funciones mejoradas.'
            }
            confirmText="Descargar e Instalar"
            cancelText={updateData?.critical ? '' : 'Más tarde'}
            isDanger={false}
        />
    )
}
