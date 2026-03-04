import { AIService } from './ai.service';
import { StorageModule } from './storage.service';
import { Lesson } from '../types/lesson';
import { AIProvider } from '../constants';

export interface LessonRequest {
  sessionId: string;
  pageNumber: number;
  pageImageBase64: string;
  pageContextText: string;
  provider: AIProvider;
  apiKey: string;
  modelId?: string;
  baseUrl?: string;
  forceRefresh?: boolean;
}

/**
 * LessonModule: A deep module for the Lesson lifecycle.
 * Leverage: Consolidates caching and AI generation logic.
 * Locality: All logic for providing a Lesson to the UI.
 */
export const LessonModule = {
  async getLesson(request: LessonRequest): Promise<Lesson> {
    const { sessionId, pageNumber, pageImageBase64, pageContextText, provider, apiKey, modelId, baseUrl, forceRefresh } = request;

    if (!forceRefresh) {
      const cached = await StorageService.getPageCache(sessionId, pageNumber);
      if (cached) {
        return cached.content;
      }
    }

    // Generate new lesson
    const lesson = await AIService.generateLesson(
      pageImageBase64, 
      pageContextText, 
      provider, 
      apiKey, 
      modelId, 
      baseUrl
    );

    // Cache it
    await StorageService.savePageCache(sessionId, pageNumber, lesson, lesson.cleanedSourceText);

    return lesson;
  }
};
