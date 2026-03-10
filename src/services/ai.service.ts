import { generateObject, LanguageModelV1 } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { AIProvider, AI_PROMPTS } from '../constants';
import { LessonSchema, Lesson } from '../types/lesson';

export class AIService {
  private static sanitizeBaseUrl(baseUrl?: string): string | undefined {
    if (!baseUrl) return undefined;
    
    let sanitized = baseUrl;
    if (sanitized.includes('/models/')) {
      sanitized = sanitized.split('/models/')[0];
    }
    
    return sanitized.endsWith('/') ? sanitized.slice(0, -1) : sanitized;
  }

  private static getModel(
    provider: AIProvider, 
    apiKey: string, 
    modelId?: string, 
    baseUrl?: string
  ): LanguageModelV1 {
    const baseURL = this.sanitizeBaseUrl(baseUrl);

    if (provider === AIProvider.GOOGLE) {
      const google = createGoogleGenerativeAI({ apiKey, baseURL });
      return google(modelId || 'gemini-2.0-flash');
    }

    const openai = createOpenAI({ apiKey, baseURL });
    return openai(modelId || 'gpt-4o');
  }

  static async generateLesson(
    pageImageBase64: string,
    pageContextText: string,
    provider: AIProvider,
    apiKey: string,
    modelId?: string,
    baseUrl?: string
  ): Promise<Lesson> {
    try {
      const model = this.getModel(provider, apiKey, modelId, baseUrl);

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

      if (object.diagram) {
        object.diagram = this.cleanMermaidDiagram(object.diagram);
      }

      return object;
    } catch (error: any) {
      this.logError('generateLesson', error);
      throw error;
    }
  }

  private static cleanMermaidDiagram(diagram: string): string {
    return diagram
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  }

  private static logError(context: string, error: any) {
    console.error(`[AIService.${context}] Error:`, {
      name: error?.name,
      message: error?.message,
      cause: error?.cause
    });
  }
}
