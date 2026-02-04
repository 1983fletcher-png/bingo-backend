# Experience design: schema vs UI

## Short answer

**We are schema-first for experiences; we implement the UI in React.**

- **Experiences** (games, modules, prompts, host guidance, energy waveform) = **framework-agnostic schema**. JSON + TypeScript types. No React in the data. Portable.
- **Builders, panels, editors, and all runtime UI** = **React**. Reusable React components that **consume and edit** the schema.

So: **yes** to reusable UI components, builder panels, and editors — and they are **React-based**.  
And **yes** to a framework-agnostic schema — that’s the **content** those components load, display, and save.

---

## What is schema (framework-agnostic)

- Experience definition: `experience_id`, `title`, `venue_type`, `audience`, `core_theme`
- Energy waveform: `arrival_calm` → `warm_close`
- Modules: `module_id`, `type`, `interaction_style`, `content`, `host_guidance`
- Scoring: `competitive_weight`, `participation_weight`
- Packs: trivia questions, icebreaker prompts, bingo config — anything that describes **what** happens, not **how** it’s rendered

This lives in:

- JSON files or API responses
- TypeScript types/interfaces (e.g. `TriviaPack`, `TriviaQuestion`)
- Data files like `triviaPacks.ts`, `icebreakerPacks.ts`

No React, no DOM. Any future frontend (React, Vue, native, CLI, print) can use the same schema.

---

## What is React (this codebase + music-bingo-app)

- **Pages:** Host, Play, Display, Home
- **Components:** PlayerBingoCard, HostSongGrid, WaitingRoomView, StretchyLogoFidget, RollCallGame, etc.
- **Builders/editors (current or future):** Any UI that creates or edits experiences — e.g. “Add module,” “Edit host prompt,” “Reorder questions,” “Preview experience.” Those are **React components** that:
  - Read schema (from state, API, or data files)
  - Render it (lists, cards, timelines, waveform)
  - Write back (handlers, forms, drag-and-drop)

So we **do** design and build reusable React components, builder panels, and editors. They are the **renderers and editors** for the schema.

---

## Design rule

1. **Define the experience in schema** (see `PLAYROOM-EXPERIENCE-ARCHITECT.md`). Keep it framework-agnostic.
2. **Implement every screen and tool in React** — components, builders, editors — that load, display, and persist that schema.

Result: experiences are portable and future-proof; the product we ship today is a React app that uses them.
