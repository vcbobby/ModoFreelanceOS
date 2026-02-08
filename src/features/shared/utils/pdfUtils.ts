const loadPdfJs = async () => {
  const [pdfjsLib, pdfWorker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
  return pdfjsLib;
};

export const preloadPdfJs = async () => {
  await loadPdfJs();
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await loadPdfJs();

    // Cargamos el documento
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Si el PDF tiene 0 paginas o esta vacio
    if (pdf.numPages === 0) {
      throw new Error('El PDF parece estar vacio.');
    }

    // Leemos pagina por pagina
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Unimos las palabras de la pagina
      const pageText = textContent.items.map((item: any) => item.str).join(' ');

      fullText += pageText + '\n\n';
    }

    // Validacion extra: Si el texto esta vacio, probablemente es un PDF escaneado (Imagen)
    if (!fullText.trim()) {
      throw new Error('No se pudo extraer texto. Es posible que el PDF sea una imagen escaneada.');
    }

    return fullText;
  } catch (error) {
    console.error('Error interno PDF:', error);
    throw error; // Re-lanzamos para que lo capture el modal en la vista
  }
};
