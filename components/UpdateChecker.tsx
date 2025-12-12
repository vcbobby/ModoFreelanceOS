import React, { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { ConfirmationModal } from './ui' // Tu modal existente
import { Download } from 'lucide-react'

// Esta versión debe coincidir con la que pongas en tu package.json
const CURRENT_APP_VERSION = '1.0.0'

export const UpdateChecker = () => {
    const [showUpdate, setShowUpdate] = useState(false)
    const [updateData, setUpdateData] = useState<any>(null)

    useEffect(() => {
        // Solo chequear si estamos en la App nativa (Android)
        if (!Capacitor.isNativePlatform()) return

        const checkVersion = async () => {
            try {
                // Fetch con timestamp para evitar caché
                const res = await fetch(`/version.json?t=${Date.now()}`)
                const data = await res.json()

                if (isNewerVersion(CURRENT_APP_VERSION, data.version)) {
                    setUpdateData(data)
                    setShowUpdate(true)
                }
            } catch (e) {
                console.error('Error buscando actualizaciones', e)
            }
        }

        checkVersion()
    }, [])

    // Función simple para comparar versiones (ej: 1.1.0 > 1.0.0)
    const isNewerVersion = (oldVer: string, newVer: string) => {
        const oldParts = oldVer.split('.').map(Number)
        const newParts = newVer.split('.').map(Number)

        for (let i = 0; i < oldParts.length; i++) {
            if (newParts[i] > oldParts[i]) return true
            if (newParts[i] < oldParts[i]) return false
        }
        return false
    }

    const handleUpdate = () => {
        if (updateData?.apkUrl) {
            // Abrir en el navegador externo para descargar
            window.open(updateData.apkUrl, '_system')
        }
    }

    return (
        <ConfirmationModal
            isOpen={showUpdate}
            onClose={() => {
                // Si no es crítica, permitimos cerrar. Si es crítica, obligamos a actualizar.
                if (!updateData?.critical) setShowUpdate(false)
            }}
            onConfirm={handleUpdate}
            title="Actualización Disponible 🚀"
            message={
                updateData?.message ||
                'Hay una nueva versión mejorada de la app.'
            }
            confirmText="Descargar e Instalar"
            cancelText={updateData?.critical ? '' : 'Más tarde'} // Ocultar cancelar si es crítica
            isDanger={false}
        />
    )
}
