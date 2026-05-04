# AGENTS.md

## Project Overview

**bookeater** is a modern learning platform that transforms static documents (PDFs, images, text) into interactive, AI-powered lessons. It focuses on local-first persistence using IndexedDB and leverages AI to generate explanations, diagrams, and checkpoints for specific document sections.

### Key Technologies
- **Frontend**: React 18 (TypeScript), Vite
- **Styling**: Tailwind CSS, Lucide icons
- **Persistence**: Dexie.js (IndexedDB)
- **AI Integration**: Vercel AI SDK (@ai-sdk/openai, @ai-sdk/google)
- **Document Parsing**: pdfjs-dist
- **Visuals**: Mermaid.js (diagrams), React Markdown
- **Testing**: Vitest, React Testing Library

## Domain Language

- **Shelf**: A container or category used to organize multiple Sessions.
- **Session (BookSession)**: A learning journey tied to a specific document. Tracks progress and metadata.
- **Lesson**: An AI-generated learning unit (Explanation, Diagram, Checkpoint) derived from a document page.
- **Reader Mode**: An immersive display state for Lessons, featuring TTS (Text-to-Speech).

## Setup Commands

- **Install dependencies**: `pnpm install`
- **Start development server**: `pnpm dev` (runs on port 3004)
- **Build for production**: `pnpm build`
- **Preview build**: `pnpm preview`
- **Run all tests**: `pnpm test`

## Development Workflow

- **Local Storage**: The application uses IndexedDB via `src/core/db.ts`. Be cautious with schema changes in `Dexie`.
- **Environment Variables**: AI providers require API keys (e.g., `OPENAI_API_KEY`). Ensure these are configured if working on AI features.
- **Port**: Default dev port is `3004`.

## Testing Instructions

- **Framework**: Vitest with `jsdom` environment.
- **Location**: Unit tests are located in `__tests__` directories adjacent to the source code (e.g., `src/services/__tests__/`).
- **Setup**: Global test setup is in `src/test/setup.ts`.
- **Running tests**: 
  - `pnpm test` for a single run.
  - `pnpm vitest` for watch mode.

## Architecture & Modules

### Directory Structure
- `src/components/`: UI components organized by `features`, `layout`, and `ui`.
- `src/services/`: Core business logic (AI, Parser, Storage, TTS).
- `src/hooks/`: React hooks for features and common logic.
- `src/core/`: Essential system logic, specifically `db.ts` for database configuration.
- `src/types/`: TypeScript definitions for the domain model.

### Key Modules
- **Document System**: Manages the lifecycle of documents from upload to display.
- **Storage Module**: Deep module handling persistence in IndexedDB.
- **Parser Module**: Deep module transforming raw data into a unified `Page` interface using Adapters.

## Documentation & Design Decisions

- **Rule**: Always keep the `docs/` folder updated with current implementation details and design decisions.
- **ADRs**: Store significant architectural decisions in `docs/adr/` using a standard ADR template.
- **Sync**: When making structural changes or adding new features, update the corresponding documentation in `docs/` or `CONTEXT.md` to reflect the new state.

## Code Style & Conventions

- **Types**: Use TypeScript strictly. Define domain models in `src/types/`.
- **Components**: Prefer functional components with hooks.
- **Styling**: Use Tailwind CSS utility classes. Follow the `ui-ux-pro-max` skill guidelines for responsive and accessible UI.
- **Persistence**: All user data should persist locally. Avoid external servers for user data storage.
- **AI**: Use structured outputs (Zod) when interacting with AI services to ensure data integrity.

## Pull Request Guidelines

- Ensure `pnpm build` passes before submitting.
- Include unit tests for new services or logic in the appropriate `__tests__` folder.
- Follow the existing naming conventions (camelCase for files/variables, PascalCase for components).
