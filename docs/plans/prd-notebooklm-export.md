# PRD: NotebookLM Export Pipeline

## 1. Executive Summary
NotebookLM is a powerful tool for synthesis and conversational discovery (RAG). BookEater focuses on the **input and active reading phase**. This PRD defines an **Export Pipeline** that allows users to bridge these two worlds: taking their deep, provocateur-led insights from BookEater and pushing them into NotebookLM for global synthesis and viral "Audio Overviews."

## 2. Strategic Rationale
- **No Reinventing the Wheel**: NotebookLM has specialized in "Podcast generation" and "Universal RAG." BookEater specializes in "Active Page-by-Page Reading."
- **Technical Workaround**: NotebookLM lacks a public consumer API and blocks iFrame embedding. An export/import pipeline is the most reliable way to integrate today.
- **Value Multiplier**: A user reads a complex textbook in BookEater (active phase), then exports the synthesized insights to NotebookLM to "listen" to a summary of their own thoughts (discovery phase).

## 3. The Export Format: "The Deep Archive"
To maximize compatibility with NotebookLM's ingestion, BookEater will export a **Structured Markdown Archive**.

### Inclusions:
1. **The Source Document**: The original PDF or Transcript text.
2. **Synthesized Reflections**: A Markdown document containing all AI provocations and user responses.
3. **Thematic Highlights**: Grouped highlights with page references.
4. **Visuals**: Mermaid diagrams converted to text descriptions (which NotebookLM can interpret).

## 4. User Flow (UX)
1. **Finish Session**: User completes a reading session in BookEater.
2. **"Listen to your Session"**: A call-to-action button (with a NotebookLM icon) appears.
3. **Generate Export**: BookEater bundles all data into a `.zip` or a single "Master Markdown" file optimized for LLM ingestion.
4. **Ingest to NotebookLM**: The user is guided (via a short tooltip/guide) to open NotebookLM and "Add Source" by uploading the exported file.
5. **Podcast Mode**: The user then generates an Audio Overview in NotebookLM based on their *actual* active reading notes, rather than just the raw book.

## 5. Technical Implementation: The "Export Service"
A new `ExportService.ts` will handle the transformation of Dexie/IndexedDB data into the target format.

### Key Logic:
- **Clean Markdown Generation**: Strip UI-specific metadata and format for readability.
- **Contextual Threading**: Ensure that AI questions and User answers are explicitly paired so NotebookLM understands the dialogue.
- **Privacy First**: Export happens entirely in the browser; no data is sent to BookEater servers.

## 6. Future Roadmap: Vertex AI & MCP
- **MCP Server**: Build a Model Context Protocol (MCP) server that allows AI agents to read from the BookEater IndexedDB directly, making the "Export" step invisible for users of Claude/Gemini.
- **Vertex AI Integration**: Explore Google's "Agent Builder" API to natively generate Audio Overviews inside BookEater, removing the need to visit the NotebookLM website at all.

## 7. Success Metrics
- **Export Conversion**: Percentage of users who finish a session and trigger an export.
- **Loop Completion**: Qualitative feedback on the utility of NotebookLM's podcasts based on BookEater's "Provocateur" notes.
