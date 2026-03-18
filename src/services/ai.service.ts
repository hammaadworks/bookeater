import { generateObject, LanguageModelV1 } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { AIProvider, AI_PROMPTS } from '../constants';
import { LessonSchema, Lesson } from '../types/lesson';

export class AIService {
  private static getModel(
    provider: AIProvider, 
    apiKey: string, 
    modelId?: string, 
    baseUrl?: string
  ): LanguageModelV1 {
    // Sanitize baseUrl: If user accidentally pasted the full /models/... URL, strip it out.
    let sanitizedBaseUrl = baseUrl;
    if (sanitizedBaseUrl && sanitizedBaseUrl.includes('/models/')) {
      sanitizedBaseUrl = sanitizedBaseUrl.split('/models/')[0];
    }
    // Also remove trailing slash if any
    if (sanitizedBaseUrl && sanitizedBaseUrl.endsWith('/')) {
      sanitizedBaseUrl = sanitizedBaseUrl.slice(0, -1);
    }

    if (provider === AIProvider.GOOGLE) {
      const google = createGoogleGenerativeAI({ 
        apiKey,
        baseURL: sanitizedBaseUrl || undefined
      });
      return google(modelId || 'gemini-2.5-flash');
    } else {
      const openai = createOpenAI({ 
        apiKey,
        baseURL: sanitizedBaseUrl || undefined
      });
      return openai(modelId || 'gpt-4o');
    }
  }

  static async generateLesson(
    pageImageBase64: string,
    pageContextText: string,
    provider: AIProvider,
    apiKey: string,
    modelId?: string,
    baseUrl?: string
  ): Promise<Lesson> {
    console.log(`[AIService.generateLesson] Started. Provider: ${provider}, ModelId: ${modelId || 'default'}, BaseUrl: ${baseUrl || 'default'}`);
    try {
      const model = this.getModel(provider, apiKey, modelId, baseUrl);
      console.log(`[AIService.generateLesson] Model initialized. Image payload length: ${pageImageBase64.length}`);

      const { object } = await generateObject({
        model,
        schema: LessonSchema,
        system: AI_PROMPTS.SYSTEM,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: AI_PROMPTS.USER_PREFIX + pageContextText },
              { type: 'image', image: pageImageBase64 }
            ]
          }
        ]
      });

      console.log('[AIService.generateLesson] AI generation successful. Object received:', Object.keys(object));

      if (object.diagram) {
        object.diagram = object.diagram.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
      }

      return object;
    } catch (error: any) {
      console.error('[AIService.generateLesson] CRITICAL ERROR:', error);
      console.error('[AIService.generateLesson] Error Name:', error?.name);
      console.error('[AIService.generateLesson] Error Message:', error?.message);
      if (error?.cause) console.error('[AIService.generateLesson] Error Cause:', error.cause);
      throw error;
    }
  }
}
