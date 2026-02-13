import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Toast } from '@capacitor/toast'

/**
 * Descarga un archivo de forma universal (Web, Android, iOS, Windows)
 * @param url La URL de la imagen o archivo
 * @param filename El nombre con el que se guardará (ej: logo.jpg)
 */
export const downloadFile = async (url: string, filename: string) => {
    try {
        if (import.meta.env.VITE_E2E === 'true') {
            return true
        }
        // 1. LÓGICA PARA ANDROID / IOS (Nativo)
        if (Capacitor.isNativePlatform()) {
            // Convertir la imagen a Base64 porque Filesystem no acepta Blobs directos fácilmente
            const response = await fetch(url)
            const blob = await response.blob()
            const base64Data = (await convertBlobToBase64(blob)) as string

            // Guardar en la carpeta de Documentos del teléfono
            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true,
            })

            // Mostrar mensaje nativo de éxito
            await Toast.show({
                text: `Guardado en Documentos: ${filename}`,
                duration: 'long',
            })

            return savedFile.uri
        }

        // 2. LÓGICA PARA WEB / WINDOWS (Electron)
        else {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)

            return true
        }
    } catch (error) {
        console.error('Error en descarga:', error)
        if (Capacitor.isNativePlatform()) {
            await Toast.show({
                text: 'Error al guardar. Verifica los permisos.',
                duration: 'long',
            })
        }
        throw error
    }
}

// Función auxiliar para convertir Blob a Base64 (Necesario para Capacitor)
const convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            // removemos el prefijo "data:image/jpeg;base64," para guardar el archivo puro
            const result = reader.result as string
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.readAsDataURL(blob)
    })
