import * as pdfjsLib from 'pdfjs-dist'

// ESTA ES LA FORMA CORRECTA PARA VITE:
// Importamos el worker como una URL explícita
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer()

        // Cargamos el documento
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        // Si el PDF tiene 0 páginas o está vacío
        if (pdf.numPages === 0) {
            throw new Error('El PDF parece estar vacío.')
        }

        // Leemos página por página
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()

            // Unimos las palabras de la página
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ')

            fullText += pageText + '\n\n'
        }

        // Validación extra: Si el texto está vacío, probablemente es un PDF escaneado (Imagen)
        if (!fullText.trim()) {
            throw new Error(
                'No se pudo extraer texto. Es posible que el PDF sea una imagen escaneada.'
            )
        }

        return fullText
    } catch (error) {
        console.error('Error interno PDF:', error)
        throw error // Re-lanzamos para que lo capture el modal en la vista
    }
}
