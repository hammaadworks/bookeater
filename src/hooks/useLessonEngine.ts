import { useState, useCallback } from 'react';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

export const LessonSchema = z.object({
  title: z.string().describe('A short, engaging title for this lesson'),
  context: z.string().describe('Brief introduction to the context of this page or section'),
  coreContent: z.string().describe('The primary concept or quote extracted directly from the book page'),
  explanation: z.string().describe('A clear, simple explanation of the core concept. Use analogies if helpful.'),
  diagram: z.string().optional().describe('Optional Mermaid diagram syntax to visually explain the concept. Use ONLY if a flowchart, sequence, or mindmap would aid understanding. Return RAW mermaid code without markdown code blocks.'),
  checkpoint: z.object({
    question: z.string().describe('A single multiple-choice question to verify understanding before moving on'),
    options: z.array(z.string()).length(4).describe('Exactly 4 options'),
    correctAnswerIndex: z.number().min(0).max(3).describe('Index of the correct option (0-3)')
  }).describe('A checkpoint quiz to force comprehension')
});

export type Lesson = z.infer<typeof LessonSchema>;

export function useLessonEngine() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = useCallback(async (pageImageBase64: string | null) => {
    if (!pageImageBase64) return;
    
    const apiKey = localStorage.getItem('bookeater_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    const provider = localStorage.getItem('bookeater_provider') || 'google';

    if (!apiKey) {
      alert('Please set your API key in Settings first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLesson(null);

    try {
      let model;
      if (provider === 'google') {
        const google = createGoogleGenerativeAI({ apiKey });
        model = google('gemini-1.5-flash-latest');
      } else {
        const openai = createOpenAI({ apiKey });
        model = openai('gpt-4o');
      }

      const { object } = await generateObject({
        model,
        schema: LessonSchema,
        system: "You are BookEater, a strict but helpful AI Mentor. Your goal is to force the user to understand the book bite by bite. You will be provided with an image of a page from a book. Extract the core idea, explain it simply, provide a Mermaid diagram if it helps visualize it, and end with a checkpoint question. DO NOT skip content. Base everything strictly on the provided image.",
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Generate a structured lesson for this page.' },
              { type: 'image', image: pageImageBase64 }
            ] 
          }
        ]
      });

      // Clean up mermaid code if it accidentally included markdown backticks
      if (object.diagram) {
        object.diagram = object.diagram.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
      }

      setLesson(object);
    } catch (err: any) {
      console.error('Lesson generation error:', err);
      setError(err.message || 'Failed to generate lesson.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { lesson, generateLesson, isGenerating, error, setLesson };
}
