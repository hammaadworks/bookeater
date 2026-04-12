import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite will resolve this correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export function usePDF() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setError(null);
      await renderPage(pdf, 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load PDF');
    }
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    setIsRendering(true);
    try {
      const page = await pdf.getPage(pageNumber);
      const scale = 2; // Render at 2x scale for better clarity on high DPI screens
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context");
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      // Convert to JPEG base64 to save size when sending to AI
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPageImage(dataUrl);
      setCurrentPage(pageNumber);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to render page');
    } finally {
      setIsRendering(false);
    }
  };

  const goToNextPage = () => {
    if (pdfDoc && currentPage < totalPages && !isRendering) {
      renderPage(pdfDoc, currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (pdfDoc && currentPage > 1 && !isRendering) {
      renderPage(pdfDoc, currentPage - 1);
    }
  };

  return { loadPDF, pageImage, currentPage, totalPages, isRendering, error, goToNextPage, goToPrevPage };
}
