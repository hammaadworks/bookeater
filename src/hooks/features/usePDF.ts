import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BookSession, Shelf, SourceType } from '../../types/session';
import { db } from '../../core/db';
import { StorageService } from '../../services/storage.service';
import { ParserModule } from '../../services/parser.service';
import { AIProvider, APP_CONFIG } from '../../constants';

const CURRENT_SESSION_KEY = 'bookeater_current_session_id';

export function usePDF() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [pageText, setPageText] = useState<string>('');
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

      const result = await ParserModule.getPage(
        fileData.data, 
        session.bookName || session.name, 
        pageNum,
        session.sourceType
      );
      setPageImage(result.image);
      setPageText(result.text);
      setPageContextText(result.contextText);
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
    setIsRendering(true);
    try {
      const isVideo = file.name.match(/\.(mp4|mkv|mov|webm)$/i);
      const arrayBuffer = await file.arrayBuffer();
      const id = crypto.randomUUID();
      
      let sourceType: SourceType = 'file';
      let bookName = file.name;
      let finalData: ArrayBuffer = arrayBuffer;

      if (isVideo) {
        sourceType = 'local-video';
        const { VideoService } = await import('../../services/video.service');
        const { AIService } = await import('../../services/ai.service');

        // Extract audio for AI analysis and synced playback
        const audioBlob = await VideoService.extractAudio(file);
        const audioBuffer = await audioBlob.arrayBuffer();
        
        // Try to generate an initial transcript/index from audio if API key is present
        const apiKey = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;
        const provider = (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROVIDER) as AIProvider) || AIProvider.GOOGLE;
        
        if (apiKey) {
          // This would ideally send the audio file, but for a tracer bullet, 
          // we'll assume the AI can reconstruct context if we provide enough metadata
          // or use the multimodal capabilities of the models.
          // For now, let's placeholder this with a "Sense-Making" pass.
          const metadataText = `Video File: ${file.name}, Duration: Unknown. Please provide a structured study guide based on the content.`;
          const processedText = await AIService.reconstructTranscript(
            metadataText, 
            provider, 
            apiKey
          );
          finalData = new TextEncoder().encode(processedText).buffer;
        } else {
          finalData = audioBuffer;
        }
        
        bookName = `${file.name} (Audio)`;
      }

      const session: BookSession = {
        id,
        shelfId,
        name: file.name.split('.')[0],
        bookName,
        sourceType,
        lastOpened: Date.now(),
        totalPages: 0,
        currentPage: 1,
      };

      await StorageService.saveSession(session, finalData);
      await loadSession(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRendering(false);
    }
  }, [loadSession]);

  const loadYoutube = useCallback(async (url: string, shelfId: string = 'default') => {
    setIsRendering(true);
    try {
      const { YoutubeService } = await import('../../services/youtube.service');
      const { AIService } = await import('../../services/ai.service');
      
      const videoId = YoutubeService.extractVideoId(url);
      if (!videoId) throw new Error("Invalid YouTube URL");

      const metadata = await YoutubeService.getMetadata(videoId);
      const transcriptData = await YoutubeService.getTranscript(videoId);
      const rawText = transcriptData.map(t => t.text).join(' ');
      
      // Get AI Settings for Reconstruction
      const apiKey = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;
      const provider = (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROVIDER) as AIProvider) || AIProvider.GOOGLE;
      const modelId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MODEL) || undefined;
      const baseUrl = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.BASE_URL) || undefined;

      let processedText = rawText;
      if (apiKey) {
        // Perform Deep Reconstruction
        processedText = await AIService.reconstructTranscript(
          rawText,
          provider,
          apiKey,
          modelId,
          baseUrl
        );
      }
      
      const id = crypto.randomUUID();
      const session: BookSession = {
        id,
        shelfId,
        name: metadata.title,
        bookName: `YouTube: ${metadata.title}`,
        sourceType: 'youtube',
        sourceUrl: url,
        lastOpened: Date.now(),
        totalPages: 0,
        currentPage: 1,
      };

      // Store transcript as the "file data"
      const textEncoder = new TextEncoder();
      await StorageService.saveSession(session, textEncoder.encode(processedText).buffer);
      await loadSession(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRendering(false);
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
    sessions, shelves, currentSessionId, loadSession, loadPDF, loadYoutube,
    updateSession, deleteSession, createShelf, updateShelf, deleteShelf,
    pageImage, pageText, pageContextText, currentPage, totalPages, isRendering, error, 
    goToNextPage, goToPrevPage 
  };
}
