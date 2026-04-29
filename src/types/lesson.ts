import { z } from 'zod';

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

export interface AIServiceResponse {
  lesson: Lesson;
  error?: string;
}
