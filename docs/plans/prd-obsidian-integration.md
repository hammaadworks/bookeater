# PRD: Obsidian Integration (Local-First Sync)

## 1. Executive Summary
The Obsidian integration aims to bridge the gap between **Active Reading** in BookEater and **Knowledge Management** in Obsidian. By leveraging the **File System Access API**, BookEater will allow users to seamlessly sync their highlights, AI-provoked insights, and session notes directly into their local Obsidian vault without the need for third-party plugins or complex API configurations.

## 2. Strategic Rationale
- **Zero Friction**: Unlike the Local REST API plugin, the File System Access API requires no setup from the user other than selecting a folder.
- **Local-First Alignment**: Both Obsidian and BookEater share a philosophy of user ownership and local data persistence.
- **Deep Integration**: By writing directly to the vault, BookEater becomes a high-fidelity "input engine" for the user's Second Brain.

## 3. Technical Approach: File System Access API
We will use the modern browser `window.showDirectoryPicker()` method.

### Key Advantages:
- **No Dependencies**: Works out-of-the-box in modern browsers (Chrome, Edge, Safari).
- **Security**: Granular browser-level permissions. The user grants access to a specific folder, not the entire disk.
- **Performance**: Direct disk I/O for reading and writing Markdown files.
- **Persistence**: Browsers can persist the "file handle" across sessions, meaning the user only needs to "Connect" once.

## 4. User Flow (UX)
1. **Connect Vault**: Inside BookEater Settings, the user clicks a "Connect Obsidian Vault" button.
2. **Folder Selection**: The browser's native file picker opens; the user selects their Obsidian vault root or a specific `BookEater/` subfolder.
3. **Sync Configuration**:
   - Option to "Auto-Sync" on every highlight/note.
   - Option to define a naming template (e.g., `{{source_title}} - {{session_date}}.md`).
4. **Active Reading**: As the user reads and engages with the "Agent Provocateur" AI, highlights and notes are instantly mirrored into the local vault.
5. **Obsidian View**: The user opens Obsidian and finds their new notes, complete with wikilinks, tags, and frontmatter.

## 5. Data Model & Mapping
### File Structure
- `[Vault Root]/BookEater/Sources/[Source Name].md`: A master note for the book/document.
- `[Vault Root]/BookEater/Sessions/[Session ID].md`: Specific notes for a learning session.

### Markdown Schema
```markdown
---
source: [[Source Name]]
date: 2026-05-17
tags: #bookeater #active-reading
---

# Session: {{source_title}}

## Page {{page_number}}
> {{highlighted_text}}

### Provocation: {{ai_question}}
**My Thought:** {{user_reflection}}
```

## 6. Edge Cases & Resilience
- **Permission Revoked**: If the browser loses access, BookEater prompts the user to "Re-verify Folder Access."
- **Simultaneous Edits**: BookEater uses an "Append-Only" or "Safe Merge" strategy to avoid overwriting changes made manually inside Obsidian.
- **Offline Support**: If the file system is unavailable, changes are queued in IndexedDB and synced the next time the vault is connected.

## 7. Future Considerations
- **Bi-directional Sync**: Reading Obsidian tags and using them to categorize BookEater sessions.
- **Canvas Support**: Exporting BookEater's Mermaid diagrams directly into Obsidian Canvas format.
