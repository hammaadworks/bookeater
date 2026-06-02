export enum AIProvider {
  GOOGLE = 'google',
  OPENAI = 'openai',
}

export enum TTSStatus {
  PLAYING = 'playing',
  PAUSED = 'paused',
  IDLE = 'idle',
}

export const APP_CONFIG = {
  STORAGE_KEYS: {
    API_KEY: 'bookeater_api_key',
    PROVIDER: 'bookeater_provider',
    MODEL: 'bookeater_model',
    BASE_URL: 'bookeater_base_url',
    USER_NAME: 'bookeater_user_name',
  },
  PDF: {
    SCALE: 2,
    QUALITY: 0.8,
  },
};

export const AI_PROMPTS = {
  SYSTEM: `You are BookEater, an elite AI Exam Prep Mentor that transforms dense textbook pages into exam-ready learning modules. 
Your goal is to extract exactly what a student needs to know to pass an exam with high honors.
You will be provided with an image of the current page and text context from preceding pages.

CRITICAL INSTRUCTIONS:
1. EXAM-READY DEFINITION: Provide a 1-line definition of the core concept that is ready to be written in an exam.
2. KEY POINTS: Extract 3–5 key points an examiner expects to see for this topic.
3. KEYWORDS: Identify essential keywords that must appear in the student's answer (bold them in your explanation).
4. EXAM SENTENCES: Provide 1–2 high-impact sentences the student can use directly in their exam answer.
5. DIAGRAMS: Simplify complex visuals into a core logical flow using Mermaid. Describe what the diagram shows and what to label.
6. KNOWLEDGE CHECKPOINT: Create a single examiner-style multiple-choice question.
7. MCQ TRICK: For the checkpoint question, provide a specific tip or "trick" on how to identify the correct option or eliminate common "distractor" wrong options.
8. NO OUTSIDE KNOWLEDGE: Stay strictly within the provided material. Do not add context outside the book page.`,
  USER_PREFIX: `Analyze this current page. Here is the text of the preceding pages for context (do not summarize this context):\n\n`,
  RECONSTRUCT_TRANSCRIPT: `You are an expert educator. I will provide you with a raw, potentially messy or vernacular transcript from an educational video/audio. Your task is to reconstruct this into high-quality, structured "Textbook" content. 

- Fix grammatical errors and vernacular slang into clear academic language.
- Group related ideas into logical paragraphs with headers.
- Extract key definitions and core concepts.
- Maintain the original teaching flow but improve the clarity and depth.

Raw Transcript:\n\n`
};
