import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookSession, Shelf } from '../../types/session';
import { db } from '../../core/db';
import { StorageModule } from '../../services/storage.service';
import { ParserModule } from '../../services/parser.service';

const CURRENT_SESSION_KEY = 'bookeater_current_session_id';

export function usePDF() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pageContextText, setPageContextText] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => localStorage.getItem(CURRENT_SESSION_KEY));

  const sessions = useLiveQuery(() => db.books.orderBy('lastOpened').reverse().toArray(), []) || [];
  const shelves = useLiveQuery(() => db.shelves.orderBy('updatedAt').reverse().toArray(), []) || [];

  const loadPage = useCallback(async (bookId: string, pageNum: number) => {
    setIsRendering(true);
    try {
      const session = await db.books.get(bookId);
      const fileData = await db.bookFiles.get(bookId);
      if (!session || !fileData) throw new Error("Session or file not found");

      const result = await ParserModule.getPage(fileData.data, session.bookName || session.name, pageNum);
      setPageImage(result.image);
      setPageContextText(result.text);
      setTotalPages(result.totalPages);
      setCurrentPage(pageNum);
      
      await StorageService.updateSession(bookId, { 
        currentPage: pageNum, 
        lastOpened: Date.now() 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRendering(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const session = await StorageService.getSession(sessionId);
      if (!session) throw new Error("Session not found");

      setCurrentSessionId(sessionId);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      await loadPage(sessionId, session.currentPage || 1);
    } catch (err: any) {
      setError(err.message);
    }
  }, [loadPage]);

  const loadPDF = useCallback(async (file: File, shelfId: string = 'default') => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const id = crypto.randomUUID();
      
      const session: BookSession = {
        id,
        shelfId,
        name: file.name.split('.')[0],
        bookName: file.name,
        lastOpened: Date.now(),
        totalPages: 0, // Will be set after first parse
        currentPage: 1,
      };

      await StorageService.saveSession(session, arrayBuffer);
      await loadSession(id);
    } catch (err: any) {
      setError(err.message);
    }
  }, [loadSession]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages && !isRendering && currentSessionId) {
      loadPage(currentSessionId, currentPage + 1);
    }
  }, [currentPage, totalPages, isRendering, currentSessionId, loadPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1 && !isRendering && currentSessionId) {
      loadPage(currentSessionId, currentPage - 1);
    }
  }, [currentPage, isRendering, currentSessionId, loadPage]);

  // Delegated Storage Ops
  const updateSession = (id: string, updates: Partial<BookSession>) => StorageService.updateSession(id, updates);
  const deleteSession = (id: string) => {
    StorageService.deleteSession(id);
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setPageImage(null);
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  };
  const createShelf = async (data: Omit<Shelf, 'id'>) => {
    const id = crypto.randomUUID();
    return await StorageService.saveShelf({ ...data, id } as Shelf);
  };
  const updateShelf = (id: string, updates: Partial<Shelf>) => StorageService.saveShelf({ ...updates, id } as Shelf);
  const deleteShelf = (id: string) => StorageService.deleteShelf(id);

  return { 
    sessions, shelves, currentSessionId, loadSession, loadPDF, 
    updateSession, deleteSession, createShelf, updateShelf, deleteShelf,
    pageImage, pageContextText, currentPage, totalPages, isRendering, error, 
    goToNextPage, goToPrevPage 
  };
}
