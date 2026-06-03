# Documentation

This directory contains technical documentation and architectural decision records (ADRs) for the **bookeater** project.

## Structure

- `/adr`: [Architecture Decision Records](./adr) - Significant design and architectural choices.
- `/plans`: [Future Roadmaps](./plans) - PRDs and integration strategies.
- `/design-system`: [Design System](../design-system/bookeater/MASTER.md) - UI/UX standards, tokens, and component specs.
- `CONTEXT.md`: (At root) High-level domain language and module overview.

## Design Philosophy: AI as an Agent Provocateur

BookEater is built on the **"Tool for Thought"** philosophy. We reject the "AI Assistant" model that prioritizes speed and summarization over learning. Instead, we embrace **Productive Resistance**:

1. **Active Reading**: The platform is designed for page-by-page engagement. We don't summarize books; we help you read them better.
2. **Critical Thinking**: The AI acts as an **Agent Provocateur**. Its job is to challenge your understanding, ask difficult questions, and force you to synthesize your own insights.
3. **No Cognitive Outsourcing**: We avoid "intellectual laziness" by keeping the user close to the material. You are the thinker; the AI is the catalyst.

## Maintenance

As per `AGENTS.md`, any significant changes to the codebase should be reflected here. This ensures that both human contributors and AI agents have a clear, up-to-date understanding of the system's intent and design.
