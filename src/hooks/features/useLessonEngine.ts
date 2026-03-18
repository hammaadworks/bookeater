import { useState, useCallback, useEffect } from 'react';
import { AIService } from '../../services/ai.service';
import { Lesson } from '../../types/lesson';
import { AIProvider, APP_CONFIG } from '../../constants';
import { db } from '../../core/db';

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
        const cachedLesson = await db.lessons.get([sessionId, currentPage]);
        if (cachedLesson) {
          setLesson(cachedLesson.content);
        } else {
          setLesson(null);
        }
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
    setLesson(null);

    try {
      console.log('[useLessonEngine] Calling AIService.generateLesson');
      const result = await AIService.generateLesson(pageImageBase64, pageContextText, provider, apiKey, modelId, baseUrl);
      console.log('[useLessonEngine] Lesson generated successfully. Saving to state.');
      setLesson(result);
      
      // Save to cache
      console.log(`[useLessonEngine] Saving lesson to IndexedDB cache for page ${currentPage}, session ${sessionId}`);
      
      await db.lessons.put({
        bookId: sessionId,
        pageNumber: currentPage,
        content: result,
        generatedAt: Date.now()
      });
      
      console.log('[useLessonEngine] Lesson saved to IndexedDB cache successfully.');
    } catch (err: any) {
      console.error('[useLessonEngine] Error caught during generation:', err);
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred.';
      setError(`Error: ${errorMessage}. Check console logs for details.`);
    } finally {
      setIsGenerating(false);
    }
  }, [currentPage, sessionId]);

  return { lesson, generateLesson, isGenerating, error, setLesson };
}
