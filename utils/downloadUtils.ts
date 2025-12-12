import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Toast } from '@capacitor/toast'

/**
 * Descarga un archivo en Web (PC) o Android/iOS.
 * @param source - Puede ser una URL (https://...) o un DataURI (data:image/png;base64,...)
 * @param filename - Nombre del archivo con extensión (ej: archivo.pdf)
 */
export const downloadFile = async (source: string, filename: string) => {
    // --- 1. MODO WEB (PC/Browser) ---
    if (!Capacitor.isNativePlatform()) {
        const link = document.createElement('a')
        link.href = source
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
    }

    // --- 2. MODO NATIVO (Android) ---
    try {
        let base64Data = ''

        if (source.startsWith('data:')) {
            // Caso A: Es un archivo generado localmente (PDF, QR, Imagen Optimizada)
            // Quitamos el prefijo "data:image/png;base64," para guardar solo los datos
            base64Data = source.split(',')[1]
        } else {
            // Caso B: Es una URL de internet (Cloudinary, etc)
            const response = await fetch(source)
            const blob = await response.blob()
            base64Data = (await convertBlobToBase64(blob)) as string
        }

        // Guardar en la carpeta de Descargas pública
        const savedFile = await Filesystem.writeFile({
            path: `Download/${filename}`,
            data: base64Data,
            directory: Directory.ExternalStorage, // En Android guarda en /storage/emulated/0/Download/
            recursive: true,
        })

        await Toast.show({
            text: `Guardado en Descargas: ${filename}`,
            duration: 'long',
        })
    } catch (error) {
        console.error('Error descargando:', error)
        await Toast.show({
            text: 'Error al guardar. Verifica permisos de almacenamiento.',
            duration: 'long',
        })
    }
}

// Helper interno
const convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            const result = reader.result as string
            // Filesystem necesita el string sin el prefijo "data:..."
            const base64Raw = result.split(',')[1]
            resolve(base64Raw)
        }
        reader.readAsDataURL(blob)
    })
