import { z } from 'zod';

export const LessonSchema = z.object({
  title: z.string().describe('A short, engaging title for this lesson'),
  context: z.string().describe('Brief introduction to the context of this page or section'),
  coreContent: z.string().describe('The primary concept or quote extracted directly from the book page'),
  explanation: z.string().describe('A clear, simple 1-line definition of the core concept — exam-ready.'),
  keyPoints: z.array(z.string()).describe('3–5 key points an examiner expects for this concept'),
  keywords: z.array(z.string()).describe('Important keywords to use in an exam answer for this topic'),
  examSentences: z.array(z.string()).describe('1–2 sentences the student can directly write in their exam answer'),
  cleanedSourceText: z.string().describe('A cleaned, readable version of the original source text from this page. Remove noise, headers, and broken sentences. Maintain the original meaning but make it pleasant to read.'),
  diagram: z.string().optional().describe('Optional Mermaid diagram syntax to visually explain the concept. Use ONLY if a flowchart, sequence, or mindmap would aid understanding. Return RAW mermaid code without markdown code blocks.'),
  checkpoint: z.object({
    question: z.string().describe('A single examiner-style multiple-choice question to verify understanding before moving on'),
    options: z.array(z.string()).length(4).describe('Exactly 4 options'),
    correctAnswerIndex: z.number().min(0).max(3).describe('Index of the correct option (0-3)'),
    mcqTrick: z.string().describe('A trick or tip on how to identify the correct option or eliminate wrong ones for this specific question')
  }).describe('A checkpoint quiz to force comprehension')
});

export type Lesson = z.infer<typeof LessonSchema>;

export interface AIServiceResponse {
  lesson: Lesson;
  error?: string;
}
