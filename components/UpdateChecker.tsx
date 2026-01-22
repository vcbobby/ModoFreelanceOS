import React, { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { ConfirmationModal } from './ui'

// ESTA ES LA VERSIÓN DE TU CÓDIGO ACTUAL
// Cuando subes a Vercel, esto se actualiza automáticamente en todas las apps
const CURRENT_APP_VERSION = '1.3.6'

export const UpdateChecker = () => {
    const [showUpdate, setShowUpdate] = useState(false)
    const [updateData, setUpdateData] = useState<any>(null)

    // Detectar Electron (Windows)
    const isElectron = navigator.userAgent.toLowerCase().includes(' electron/')

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // 1. Consultar la versión más reciente en la nube
                const res = await fetch(`/version.json?t=${Date.now()}`)
                const serverData = await res.json()

                let installedVersion = CURRENT_APP_VERSION // Por defecto usamos la del código (Web/Windows)

                // 2. Si es Android, preguntamos al sistema operativo la versión real del APK
                if (Capacitor.isNativePlatform()) {
                    const info = await App.getInfo()
                    installedVersion = info.version

                    // Fix para formatos tipo "1.3" vs "1.3.0"
                    if (installedVersion.split('.').length === 2) {
                        installedVersion += '.0'
                    }
                }
                // En Windows (isElectron), nos quedamos con CURRENT_APP_VERSION.
                // Como la app de Windows carga el código de Vercel, al hacer git push
                // la versión instalada se "actualiza" lógicamente sola.

                console.log(
                    `Versión Detectada: ${installedVersion} | Nueva: ${serverData.version}`,
                )

                // 3. Comparar
                if (isNewerVersion(installedVersion, serverData.version)) {
                    setUpdateData(serverData)
                    setShowUpdate(true)
                }
            } catch (e) {
                console.error('Error updates', e)
            }
        }

        checkVersion()
    }, [isElectron])

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
            // Android: Descargar APK
            window.open(updateData.apkUrl, '_system')
        } else if (isElectron) {
            // Windows: Descargar EXE
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
            title="¡Actualización Disponible! 🚀"
            message={updateData?.message || 'Hay una nueva versión de la app.'}
            confirmText="Descargar e Instalar"
            cancelText={updateData?.critical ? '' : 'Más tarde'}
            isDanger={false}
        />
    )
}
