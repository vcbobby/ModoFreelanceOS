type Html2PdfFactory = () => {
  set: (options: unknown) => {
    from: (element: HTMLElement | null) => {
      outputPdf: (mode: string) => Promise<string>;
    };
  };
};

let cachedHtml2Pdf: Html2PdfFactory | null = null;

export const loadHtml2Pdf = async () => {
  if (cachedHtml2Pdf) {
    return cachedHtml2Pdf;
  }

  const mod = await import('html2pdf.js');
  cachedHtml2Pdf = mod.default ?? mod;
  return cachedHtml2Pdf;
};
