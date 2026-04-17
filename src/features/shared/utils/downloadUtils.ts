import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { fetchWithRetry, logFetchError } from '../../../utils/fetchUtils';

/**
 * Valida si una URL es válida
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Descarga un archivo de forma universal (Web, Android, iOS, Windows)
 * @param url La URL de la imagen o archivo
 * @param filename El nombre con el que se guardará (ej: logo.jpg)
 */
export const downloadFile = async (url: string, filename: string) => {
  try {
    if (import.meta.env.VITE_E2E === 'true') {
      return true;
    }

    // Validar URL
    if (!isValidUrl(url)) {
      throw new Error('URL inválida para descarga');
    }

    const isDataUri = url.startsWith('data:');

    // 1. LÓGICA PARA ANDROID / IOS (Nativo)
    if (Capacitor.isNativePlatform()) {
      let base64Data = '';
      if (isDataUri) {
        base64Data = url.split(',')[1];
      } else {
        const response = await fetchWithRetry(url, {
          timeout: 60000, // 60 segundos para archivos grandes
          retries: 3,
          retryDelay: 1000,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`[Download] Retry attempt ${attempt} for ${filename}:`, error.message);
          },
        });

        if (!response.ok) {
          throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        base64Data = (await convertBlobToBase64(blob)) as string;
      }

      // Guardar en la carpeta de Documentos del teléfono
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      // Mostrar mensaje nativo de éxito
      await Toast.show({
        text: `Guardado en Documentos: ${filename}`,
        duration: 'long',
      });

      return savedFile.uri;
    }

    // 2. LÓGICA PARA WEB / WINDOWS (Electron)
    else {
      let downloadUrl = url;
      let blobUrl = null;

      if (isDataUri) {
        // Convertir data URI a Blob para evitar que el navegador lo bloquee por tamaño
        const [header, base64Data] = url.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const binary = atob(base64Data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        blobUrl = window.URL.createObjectURL(blob);
        downloadUrl = blobUrl;
      } else {
        const response = await fetchWithRetry(url, {
          timeout: 60000, // 60 segundos para archivos grandes
          retries: 3,
          retryDelay: 1000,
          onRetry: (attempt: number, error: Error) => {
            console.warn(`[Download] Retry attempt ${attempt} for ${filename}:`, error.message);
          },
        });

        if (!response.ok) {
          throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        blobUrl = window.URL.createObjectURL(blob);
        downloadUrl = blobUrl;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }

      return true;
    }
  } catch (error) {
    logFetchError(error as Error, `downloadFile - ${filename}`);

    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: 'Error al guardar. Verifica los permisos y tu conexión.',
        duration: 'long',
      });
    } else {
      // En web/Windows, mostrar error en consola
      console.error('Error en descarga:', error);
    }
    throw error;
  }
};

// Función auxiliar para convertir Blob a Base64 (Necesario para Capacitor)
const convertBlobToBase64 = (blob: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      // removemos el prefijo "data:image/jpeg;base64," para guardar el archivo puro
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
