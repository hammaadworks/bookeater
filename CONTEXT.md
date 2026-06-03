# BookEater Context

## Design Philosophy: AI as an Agent Provocateur

BookEater follows a **"Tool for Thought"** philosophy, inspired by researchers like Advait Sarkar. Unlike AI "Assistants" that summarize content to save time (often at the cost of critical thinking), BookEater aims to protect and enhance human intelligence through the following principles:

- **Active Reading First**: The goal is for the user to do the actual reading, page by page. AI should never be used to bypass the material.
- **Productive Resistance**: The AI acts as an **Agent Provocateur**. It provides "friction" by asking challenging questions, offering critiques, and forcing the user to engage deeply with the text.
- **Anti-Outsourcing**: We prevent users from becoming "middle managers for their own thoughts." AI is used to stimulate metacognition, not to provide pre-digested answers.
- **Page-by-Page Engagement**: Learning happens in the struggle with the material. AI-generated lessons (Explanations, Diagrams, Checkpoints) are designed to provoke thought about the *current* page, not to summarize the entire book.

## Domain Language

- **Shelf**: A container or category used to organize multiple Sessions.
- **Session (LearningSession)**: A learning journey tied to a specific source. Tracks progress and metadata.
- **Source**: Any learning material supported by the system (PDF, Image, Text, YouTube Video, Local Video).
- **Virtual Book**: The internal representation of non-paginated sources (like videos or long text) as a series of logical pages.
- **Transcript Reconstruction**: The AI process of transforming raw, messy, or vernacular speech from videos/audio into structured, textbook-quality content.
- **Lesson**: An AI-generated learning unit (Explanation, Diagram, Checkpoint) derived from a Source page.
- **Source Pane**: Displays the original document (Page View or Text View). Can be collapsed to focus on the lesson.
- **Lesson Pane**: Displays the AI-generated learning unit. Can be collapsed to focus on the source document.

## Architecture

- **Storage Module**: Manages local-first persistence in IndexedDB.
- **Parser Module**: A multi-modal adapter system that transforms raw data (PDFs, Transcripts, Images) into a unified Page interface.
- **AI Service**: Orchestrates interactions with LLMs (Google Gemini, OpenAI) for lesson generation and transcript reconstruction.
- **Media System**: Leverages `ffmpeg.wasm` for local video audio extraction and `youtube-transcript` for video ingestion.

## Design Decisions (ADRs)

### ADR 000: UI & UX Standards
The application's visual design, color palette, and interaction patterns are strictly governed by the constraints defined in `docs/UI_GUIDELINES.md`. All new components must adhere to the 'Dark Mode (OLED)' and 'Content First' principles outlined there.

### ADR 001: Audio-First Deep Learning for Video
We prioritize audio/transcripts over video streaming for learning. Videos are "Bookified" into Virtual Books to maintain a consistent UX and focus on high-density information transfer.

### ADR 002: Local-First Media Processing
Local videos are processed in-browser using FFmpeg WASM to maintain privacy and offline capability.
