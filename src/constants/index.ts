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
Your goal is to guide the user through the material with high logical clarity, ensuring they comprehend the concepts before moving on. 
You will be provided with an image of the current page, and the raw text of the preceding 10 pages for deeper context.
DO NOT summarize the preceding context; use it strictly to understand the current page's place in the narrative.
Focus ONLY on extracting the core ideas from the CURRENT PAGE image.
Explain the concepts simply, structurally, and logically.
Provide a Mermaid diagram (mindmap, flowchart, etc.) if it helps visualize the current page's concept.
End with a single, highly specific multiple-choice checkpoint question to verify their understanding of the current page.`,
  USER_PREFIX: `Analyze this current page. Here is the text of the preceding pages for context (do not summarize this context):\n\n`,
};
