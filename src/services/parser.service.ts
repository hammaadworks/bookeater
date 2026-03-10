import * as pdfjsLib from 'pdfjs-dist';
import { APP_CONFIG } from '../constants';
import { db } from '../core/db';

// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PageResult {
  image: string | null;
  text: string;
  totalPages: number;
}

/**
 * Internal rendering logic for different file types.
 */
async function renderPdfPage(data: ArrayBuffer, pageNumber: number): Promise<PageResult> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: APP_CONFIG.PDF.SCALE });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error("Canvas error");
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;
  const image = canvas.toDataURL('image/jpeg', APP_CONFIG.PDF.QUALITY);

  // Extract text context for AI (current page + previous context)
  const startPage = Math.max(1, pageNumber - 9);
  let contextText = '';
  for (let i = startPage; i <= pageNumber; i++) {
    const p = await pdf.getPage(i);
    const content = await p.getTextContent();
    contextText += `\n--- Page ${i} ---\n` + content.items.map((it: any) => it.str).join(' ');
  }

  return { image, text: contextText.trim(), totalPages: pdf.numPages };
}

async function renderImagePage(data: ArrayBuffer): Promise<PageResult> {
  const blob = new Blob([data]);
  const image = URL.createObjectURL(blob);
  return { image, text: 'Image file', totalPages: 1 };
}

async function renderTextPage(data: ArrayBuffer, pageNumber: number): Promise<PageResult> {
  const fullText = new TextDecoder().decode(data);
  const paragraphs = fullText.split(/\n{2,}/);
  const linesPerPage = 50; 
  const pages: string[] = [];
  let current = '';
  let lines = 0;

  for (const p of paragraphs) {
    const pLines = p.split('\n').length + 1;
    if (lines + pLines > linesPerPage && lines > 0) {
      pages.push(current.trim());
      current = p + '\n\n';
      lines = pLines;
    } else {
      current += p + '\n\n';
      lines += pLines;
    }
  }
  if (current) pages.push(current.trim());

  const pageText = pages[pageNumber - 1] || '';
  return { image: null, text: pageText, totalPages: pages.length };
}

/**
 * ParserModule: A deep module for visual and text extraction.
 * Leverage: One call to get everything needed for a page.
 * Depth: Hides rendering complexity for various formats.
 */
export const ParserModule = {
  async getPage(fileData: ArrayBuffer, fileName: string, pageNumber: number): Promise<PageResult> {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = !!fileName.match(/\.(png|jpe?g|gif|webp|svg|bmp)$/i);

    if (isPdf) {
      return renderPdfPage(fileData, pageNumber);
    } else if (isImage) {
      return renderImagePage(fileData);
    } else {
      return renderTextPage(fileData, pageNumber);
    }
  }
};
