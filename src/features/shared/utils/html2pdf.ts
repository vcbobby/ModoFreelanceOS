let cachedHtml2Pdf: any | null = null;

export const loadHtml2Pdf = async () => {
  if (cachedHtml2Pdf) {
    return cachedHtml2Pdf;
  }

  const mod = await import('html2pdf.js');
  cachedHtml2Pdf = mod.default ?? mod;
  return cachedHtml2Pdf;
};
