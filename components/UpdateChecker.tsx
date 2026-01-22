import React, { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { ConfirmationModal } from './ui'
import packageJson from '../package.json'

export const UpdateChecker = () => {
    const [showUpdate, setShowUpdate] = useState(false)
    const [updateData, setUpdateData] = useState<any>(null)

    // Detectar plataformas
    const isAndroid = Capacitor.getPlatform() === 'android'
    const isElectron = navigator.userAgent.toLowerCase().includes(' electron/')

    // --- CAMBIO 1: PON TU DOMINIO REAL AQUÍ ---
    // Si usas Vercel o Render, pon esa URL exacta (sin barra al final)
    const APP_DOMAIN = 'https://app.modofreelanceos.com'

    useEffect(() => {
        // --- CAMBIO 2: SI ES WEB NORMAL, NO HACEMOS NADA ---
        if (!isAndroid && !isElectron) return

        const checkVersion = async () => {
            try {
                // Consultamos el JSON al dominio remoto, no local
                const res = await fetch(
                    `${APP_DOMAIN}/version.json?t=${Date.now()}`,
                )
                const serverData = await res.json()

                let installedVersion = packageJson.version

                if (isAndroid) {
                    const info = await App.getInfo()
                    installedVersion = info.version
                    // Normalizar versiones tipo "1.3" a "1.3.0" si es necesario
                    if (installedVersion.split('.').length === 2) {
                        installedVersion += '.0'
                    }
                }

                console.log(
                    `Instalada: ${installedVersion} | Nueva: ${serverData.version}`,
                )

                if (isNewerVersion(installedVersion, serverData.version)) {
                    setUpdateData(serverData)
                    setShowUpdate(true)
                }
            } catch (e) {
                console.error('Error verificando actualizaciones:', e)
            }
        }

        checkVersion()
    }, [isAndroid, isElectron])

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

        const url = isAndroid ? updateData.apkUrl : updateData.exeUrl

        if (url) {
            // --- CAMBIO 3: SIEMPRE USAR _SYSTEM PARA DESCARGAS ---
            // Esto obliga a Android y Windows a abrir Chrome/Edge para descargar
            window.open(url, '_system')
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
            confirmText="Descargar Ahora"
            cancelText={updateData?.critical ? '' : 'Más tarde'}
            isDanger={false}
        />
    )
}
