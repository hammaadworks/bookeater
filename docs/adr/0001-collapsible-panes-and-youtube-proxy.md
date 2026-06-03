# ADR 0001: Collapsible Panes and YouTube CORS Proxy

## Status
Accepted

## Context
The application initially featured a "Reader Mode" that attempted to display the source document alongside an AI mentor and the lesson panel, resulting in a cluttered 3-pane layout. Additionally, the local-first architecture uses the `youtube-transcript` library to fetch YouTube captions directly from the browser. This approach failed because YouTube enforces CORS restrictions, blocking cross-origin requests from the local development server (`localhost:3004`).

## Decision
1. **UI Architecture - Collapsible Panes:** We replaced the overloaded "Reader Mode" with independent, collapsible panes (`Source Pane` and `Lesson Pane`). Both panes are visible by default but can be independently collapsed to allow the other to take full width. To prevent a blank screen, the state management (`App.tsx`) enforces that at least one pane must remain visible at all times.
2. **Audio Playback:** Reading aloud (TTS) was decoupled from the layout modes. Both the Source Pane and the Lesson Pane now have their own independent "Read" buttons that trigger TTS. The Source Pane includes an internal toggle between "Page View" and "Text View", but the read action works regardless of the active view.
3. **YouTube CORS Bypass via Vite Proxy:** Instead of relying on a fragile public proxy (like `corsproxy.io`) which can be blocked by captchas when accessed from a datacenter, we leveraged Vite's built-in dev server proxy. By configuring `vite.config.ts` to proxy requests to `https://www.youtube.com` via `/youtube-proxy`, and temporarily monkey-patching `globalThis.fetch` in `youtube.service.ts`, we effectively route the fetch request through the user's local IP while bypassing browser CORS constraints.

## Consequences
- **Positive:** A significantly cleaner, more flexible UI that adapts to the user's focus (reading the source vs. studying the lesson).
- **Positive:** YouTube transcripts can now be fetched successfully in a local-first environment without backend dependencies or public proxy limits.
- **Negative:** Monkey-patching `fetch` in the `YoutubeService` is a mild hack, though strictly scoped to the transcript fetching operation. If the application is eventually deployed as a static site (without the Vite dev server proxy), a production-grade backend proxy or Edge function will be necessary to handle YouTube transcript fetching.