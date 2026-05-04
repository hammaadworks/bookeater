# bookeater

A modern learning platform that transforms static documents into interactive, AI-powered lessons.

## Domain Language

### Shelf
A container or category used to organize multiple **Sessions**. Think of it as a physical bookshelf that holds multiple books.

### Session (BookSession)
A learning journey tied to a specific document (PDF, image, text). It tracks the learner's progress, including the current page and metadata about the book. A **Shelf** contains many **Sessions**.

### Lesson
An AI-generated learning unit derived from a specific page or section of a **Session**.
- **Explanation**: A simplified breakdown of the concepts.
- **Diagram**: A visual representation (Mermaid) of the lesson's core concept.
- **Checkpoint**: A quiz to validate comprehension before proceeding.

### Reader Mode
An immersive state where the **Lesson** content is displayed prominently and can be narrated via **Text-to-Speech (TTS)**.

## Architectural Modules

### Document System
The overarching system that manages sessions from upload to display.

### Storage Module
A deep module that handles binary persistence and metadata integrity (Sessions, Shelves, Lessons) in IndexedDB. It hides the complexity of database transactions and provides a unified interface for session management.

### Parser Module
A deep module that transforms raw binary data into a unified **Page** interface (image + text). It is decoupled from persistence, allowing it to render various file formats (PDF, Image, Text) using specialized adapters.

### Lesson Module
A deep module that orchestrates the **Lesson** lifecycle. It leverages the **Storage Module** for caching and the **AI Service** for generation, providing a high-leverage interface for retrieving lessons.
