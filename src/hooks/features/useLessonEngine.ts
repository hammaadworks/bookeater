import { useState, useCallback, useEffect } from 'react';
import { Lesson } from '../../types/lesson';
import { AIProvider, APP_CONFIG } from '../../constants';
import { StorageModule } from '../../services/storage.service';
import { LessonModule } from '../../services/lesson.service';

export function useLessonEngine(currentPage: number, sessionId: string | null) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load lesson from cache when page or session changes
  useEffect(() => {
    async function loadLesson() {
      if (!sessionId) {
        setLesson(null);
        return;
      }
      try {
        const cached = await StorageService.getPageCache(sessionId, currentPage);
        setLesson(cached ? cached.content : null);
      } catch (err) {
        console.error('Failed to load lesson cache', err);
        setLesson(null);
      }
    }
    loadLesson();
  }, [currentPage, sessionId]);

  const generateLesson = useCallback(async (pageImageBase64: string | null, pageContextText: string = '') => {
    if (!pageImageBase64 || !sessionId) return;
    
    const apiKey = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;
    const provider = (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROVIDER) as AIProvider) || AIProvider.GOOGLE;
    const modelId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.MODEL) || undefined;
    const baseUrl = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.BASE_URL) || undefined;

    if (!apiKey) {
      alert('Please set your API key in Settings first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await LessonModule.getLesson({
        sessionId,
        pageNumber: currentPage,
        pageImageBase64,
        pageContextText,
        provider,
        apiKey,
        modelId,
        baseUrl,
        forceRefresh: true // Explicitly requested by user action
      });
      setLesson(result);
    } catch (err: any) {
      console.error('[useLessonEngine] Error:', err);
      setError(`Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [currentPage, sessionId]);

  return { lesson, generateLesson, isGenerating, error, setLesson };
}
