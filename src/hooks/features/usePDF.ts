import { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useLiveQuery } from 'dexie-react-hooks';
import { APP_CONFIG } from '../../constants';
import { BookSession, Wrap } from '../../types/session';
import { db } from '../../core/db';

// @ts-ignore - Vite will resolve this correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const CURRENT_SESSION_KEY = 'bookeater_current_session_id';

export function usePDF() {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pageContextText, setPageContextText] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => localStorage.getItem(CURRENT_SESSION_KEY));

  // Automatically fetch sorted sessions from Dexie
  const sessions = useLiveQuery(
    () => db.books.orderBy('lastOpened').reverse().toArray(),
    []
  ) || [];

  const wraps = useLiveQuery(
    () => db.wraps.orderBy('updatedAt').reverse().toArray(),
    []
  ) || [];

  // Init last session
  useEffect(() => {
    let isMounted = true;
    async function init() {
      const lastSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
      if (lastSessionId) {
        const exists = await db.books.get(lastSessionId);
        if (exists && isMounted) {
          await loadSession(lastSessionId);
        }
      }
    }
    // Only load automatically if we haven't loaded a document yet
    if (!pdfDoc) {
      init();
    }
    return () => { isMounted = false; };
  }, []); // Run once on mount

  const extractContextText = async (pdf: pdfjsLib.PDFDocumentProxy, targetPage: number) => {
    try {
      const startPage = Math.max(1, targetPage - 9);
      let combinedText = '';
      
      for (let i = startPage; i <= targetPage; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        combinedText += `\n--- Page ${i} ---\n${pageText}`;
      }
      
      return combinedText.trim();
    } catch (err) {
      console.error('Failed to extract context text', err);
      return '';
    }
  };

  const renderPage = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, sessionId: string) => {
    setIsRendering(true);
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: APP_CONFIG.PDF.SCALE });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context");
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', APP_CONFIG.PDF.QUALITY);
      setPageImage(dataUrl);
      setCurrentPage(pageNumber);

      // Extract text context for AI
      const contextText = await extractContextText(pdf, pageNumber);
      setPageContextText(contextText);
      
      // Update session in Dexie with new page and last opened time
      await db.books.update(sessionId, {
        currentPage: pageNumber,
        lastOpened: Date.now()
      });

    } catch (err: any) {
      console.error('PDF Render Error:', err);
      setError(err.message || 'Failed to render page');
    } finally {
      setIsRendering(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const session = await db.books.get(sessionId);
      if (!session) throw new Error("Session not found in DB");

      const fileData = await db.bookFiles.get(sessionId);
      if (!fileData) throw new Error("PDF data not found in DB");

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileData.data) });
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      
      setCurrentSessionId(sessionId);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      
      // session.currentPage was added in new schema, fallback to 1
      const pageToRender = session.currentPage || 1;
      await renderPage(pdf, pageToRender, sessionId);
    } catch (err: any) {
      console.error('Failed to load session:', err);
      setError(err.message);
    }
  }, [renderPage]);

  const loadPDF = useCallback(async (file: File, wrapId: string = 'default') => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Clone buffer to avoid detachment issues
      const bufferForPdf = arrayBuffer.slice(0);
      const bufferForDb = arrayBuffer.slice(0);

      const sessionId = crypto.randomUUID();

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bufferForPdf) });
      const pdf = await loadingTask.promise;
      
      const newSession: BookSession = {
        id: sessionId,
        wrapId: wrapId,
        name: file.name,
        lastOpened: Date.now(),
        totalPages: pdf.numPages,
        currentPage: 1,
      };

      // Save binary to bookFiles table
      await db.bookFiles.put({ id: sessionId, data: bufferForDb });
      
      // Save metadata to books table
      await db.books.put(newSession);
      
      setCurrentSessionId(sessionId);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setError(null);
      await renderPage(pdf, 1, sessionId);
    } catch (err: any) {
      console.error('PDF Load Error:', err);
      setError(err.message || 'Failed to load PDF');
    }
  }, [renderPage]);

  const goToNextPage = useCallback(() => {
    if (pdfDoc && currentPage < totalPages && !isRendering && currentSessionId) {
      renderPage(pdfDoc, currentPage + 1, currentSessionId);
    }
  }, [pdfDoc, currentPage, totalPages, isRendering, renderPage, currentSessionId]);

  const goToPrevPage = useCallback(() => {
    if (pdfDoc && currentPage > 1 && !isRendering && currentSessionId) {
      renderPage(pdfDoc, currentPage - 1, currentSessionId);
    }
  }, [pdfDoc, currentPage, isRendering, renderPage, currentSessionId]);

  const updateSession = useCallback(async (id: string, updates: Partial<BookSession>) => {
    try {
      await db.books.update(id, updates);
    } catch (err) {
      console.error('Failed to update session', err);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      // Transactional delete to ensure everything related is wiped clean
      await db.transaction('rw', db.books, db.bookFiles, db.lessons, async () => {
        await db.books.delete(id);
        await db.bookFiles.delete(id);
        await db.lessons.where('bookId').equals(id).delete();
      });

      if (currentSessionId === id) {
        setPdfDoc(null);
        setCurrentSessionId(null);
        setPageImage(null);
        setPageContextText('');
        setCurrentPage(1);
        setTotalPages(0);
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  }, [currentSessionId]);

  const createWrap = useCallback(async (wrapData: Omit<Wrap, 'id'>) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.wraps.put({ ...wrapData, id, createdAt: now, updatedAt: now } as Wrap);
    return id;
  }, []);

  const updateWrap = useCallback(async (id: string, updates: Partial<Wrap>) => {
    try {
      await db.wraps.update(id, { ...updates, updatedAt: Date.now() });
    } catch (err) {
      console.error('Failed to update wrap', err);
    }
  }, []);

  const deleteWrap = useCallback(async (id: string) => {
    try {
      await db.transaction('rw', db.wraps, db.books, db.bookFiles, db.lessons, async () => {
        await db.wraps.delete(id);
        
        const wrapBooks = await db.books.where('wrapId').equals(id).toArray();
        const bookIds = wrapBooks.map(b => b.id);
        
        await db.books.bulkDelete(bookIds);
        await db.bookFiles.bulkDelete(bookIds);
        
        for (const bId of bookIds) {
          await db.lessons.where('bookId').equals(bId).delete();
        }
      });
      
      if (currentSessionId) {
        const exists = await db.books.get(currentSessionId);
        if (!exists) {
          setPdfDoc(null);
          setCurrentSessionId(null);
          setPageImage(null);
          setPageContextText('');
          setCurrentPage(1);
          setTotalPages(0);
          localStorage.removeItem(CURRENT_SESSION_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to delete wrap', err);
    }
  }, [currentSessionId]);

  return { 
    sessions,
    wraps,
    currentSessionId,
    loadSession,
    loadPDF, 
    updateSession,
    deleteSession,
    createWrap,
    updateWrap,
    deleteWrap,
    pageImage,
    pageContextText,
    currentPage, 
    totalPages, 
    isRendering, 
    error, 
    goToNextPage, 
    goToPrevPage 
  };
}
