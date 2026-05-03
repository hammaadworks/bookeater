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
  SYSTEM: `You are BookEater, an elite AI Mentor that breaks down complex book pages into easy-to-digest learning modules. 
Your goal is to guide the user from "overwhelmed" to "understood" with high logical clarity.
You will be provided with an image of the current page and text context from preceding pages.

CRITICAL INSTRUCTIONS:
1. INTELLIGENT OCR: Focus strictly on the primary conceptual text. Ignore page numbers, headers, footers, and fragmented text labels inside diagrams or illustrations that would break the narrative flow.
2. CORE CONTENT: Extract the primary concept or a pivotal quote from the page.
3. EXPLANATION: Break down the concept using simple, structural, and logical language. Use analogies.
4. DIAGRAMS: If the page contains a complex diagram, your Mermaid diagram should SIMPLIFY it into its core logical flow or relationship.
5. COMPREHENSION: Ensure the explanation is so clear that a beginner would understand it.
6. CHECKPOINT: End with a single, highly specific multiple-choice question about the current page's core concept.`,
  USER_PREFIX: `Analyze this current page. Here is the text of the preceding pages for context (do not summarize this context):\n\n`,
};
