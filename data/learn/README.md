# Learn & Grow — Knowledge Card data

This folder holds **Knowledge Card** JSON files and the **manifest** used by the Learn & Grow API.

- **manifest.json** — List of cards (id, title, summary, tags, stemAnchors) for `GET /api/learn/cards`.
- **{id}.json** — Full card content for `GET /api/learn/cards/:id`. Each file must match the schema in **docs/LEARN-AND-GROW-KNOWLEDGE-CARD-SPEC.md**.

**Values and sourcing:** All cards must follow **docs/LEARN-AND-GROW-VISION.md**. Citations are mandatory; only use allowed source types (peer-reviewed, university extension, government, encyclopedias, museums). Ethically summarize; never copy.

**Adding a card:** 1) Create `{slug}.json` with the full schema. 2) Add an entry to `manifest.json` (id, title, summary, tags, stemAnchors). 3) Ensure relatedCardIds and tags link to existing cards where relevant.
