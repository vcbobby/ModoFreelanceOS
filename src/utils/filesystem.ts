import { Filesystem, Directory } from '@capacitor/filesystem'
import { isWeb } from './platform'

export async function saveFile(
    filename: string,
    data: string | Blob,
    mimeType: string,
) {
    if (isWeb) {
        // Web: Download directo
        const blob = typeof data === 'string' ? new Blob([data]) : data
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    } else {
        // Android/Windows: Capacitor Filesystem
        const base64 =
            typeof data === 'string' ? btoa(data) : await blobToBase64(data)

        await Filesystem.writeFile({
            path: filename,
            data: base64,
            directory: Directory.Documents,
        })
    }
}

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            resolve(base64.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}
