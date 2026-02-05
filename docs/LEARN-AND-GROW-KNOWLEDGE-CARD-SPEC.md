# Learn & Grow — Knowledge Card schema & implementation spec

**Purpose:** Implementable contract for Knowledge Cards and the first 10 flagship cards. Use with **docs/LEARN-AND-GROW-VISION.md** (values and rules; do not violate).

---

## Knowledge Card data schema

Cards are structured so they can be stored (JSON/DB), rendered in the UI, and linked for trivia/edutainment.

### Core fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable slug, e.g. `animals-of-the-world`, `cooking-basics-food-safety`. |
| `title` | string | yes | Clear, neutral, descriptive. |
| `summary` | string | yes | One sentence; calming, confidence-building. |
| `audienceLayers` | object | yes | Content keyed by layer: `child`, `learner`, `explorer`, `deepDive`. Each layer has its own text/media as needed. |
| `sections` | array | yes | Core sections: `what`, `why`, `how`, `keyFacts`, `stepByStep`, `realWorldExamples`. Each section can have `title`, `body` (HTML or markdown), optional `media`. |
| `stemAnchors` | string[] | no | Tags: `science`, `math`, `engineering`, `systemsThinking`, `realWorldApplication`. |
| `activities` | array | no | `{ type: 'craft'|'experiment'|'observation'|'group'|'triviaHook', title, body, ... }`. |
| `sources` | array | yes | `{ title, url?, institution, year? }`. Mandatory; only allowed source types per vision. |
| `relatedCardIds` | string[] | no | IDs of other Knowledge Cards for linking. |
| `tags` | string[] | no | Shared taxonomy for filtering and trivia (e.g. `biology`, `safety`, `physics`). |

### Audience layer content shape

For each layer (`child`, `learner`, `explorer`, `deepDive`), content can include:

- `summary` (layer-specific one-liner if different)
- `sections` (layer-specific versions of sections, or reference to shared sections with layer overrides)
- `media` (images, diagrams; Child layer may be more visual, Deep Dive more citation-heavy)

Implementations can start with **one shared body per section** and a **reading-level or length** variant per layer, or full per-layer content when ready.

### Example (minimal)

```json
{
  "id": "plants-and-how-they-grow",
  "title": "Plants & How They Grow",
  "summary": "Plants use light, water, and air to grow and make their own food — and you can grow them too.",
  "audienceLayers": {
    "child": { "summary": "Plants need sun and water to grow big and green." },
    "learner": { "summary": "Plants use sunlight, water, and air to make food and grow step by step." },
    "explorer": { "summary": "Photosynthesis, roots, and life cycles explain how plants grow and adapt." },
    "deepDive": { "summary": "Botanical and ecological mechanisms of plant growth, with citations." }
  },
  "sections": [
    { "key": "what", "title": "What this is", "body": "..." },
    { "key": "why", "title": "Why it matters", "body": "..." }
  ],
  "stemAnchors": ["science", "realWorldApplication"],
  "activities": [
    { "type": "observation", "title": "Watch a plant grow", "body": "..." }
  ],
  "sources": [
    { "title": "Plant growth basics", "institution": "University Extension", "url": "https://..." }
  ],
  "relatedCardIds": ["earth-and-environment", "cooking-basics-food-safety"],
  "tags": ["plants", "botany", "gardening", "science"]
}
```

---

## First 10 flagship cards (IDs and scope)

| ID (slug) | Title | One-line scope |
|-----------|--------|-----------------|
| `animals-of-the-world` | Animals of the World | Biology, classification, behavior, ecosystems, A–Z, age-adaptive depth. |
| `crafts-and-gentle-stem` | Crafts & Gentle STEM | Low-cost, household activities that teach real science through play. |
| `cooking-basics-and-food-safety` | Cooking Basics & Food Safety | Fact-based food prep, safety, cooking science; no cultural bias or trends. |
| `plants-and-how-they-grow` | Plants & How They Grow | Botany, gardening, food plants, ornamentals, climate zones, sustainability. |
| `human-body-fundamentals` | Human Body Fundamentals | Honest, neutral, non-sensational body systems. |
| `mind-and-emotion` | Mind & Emotion | Brain basics, emotional regulation, habits, confidence, learning how learning works. |
| `physics-in-everyday-life` | Physics in Everyday Life | Forces, motion, sound, light, energy via daily experiences. |
| `earth-and-environment` | Earth & Environment | Water, soil, weather, ecosystems, climate basics, stewardship. |
| `health-and-nutrition` | Health & Nutrition | Nutrition science, hydration, balance, body needs; fact-based, not diet culture. |
| `how-things-work` | How Things Work | Everyday technology, tools, systems, infrastructure explained clearly. |

These IDs are the canonical set for the foundation. New cards must link back to these where relevant and share tags for interconnection.

---

## API / data layer (suggested)

- **GET /api/learn/cards** — List cards (optional filters: `tag`, `stemAnchor`, `audienceLayer`). Returns minimal list (id, title, summary, tags).
- **GET /api/learn/cards/:id** — Full card by id (all layers, sections, activities, sources). Optional query `layer=child|learner|explorer|deepDive` to return only that layer’s content when implemented.
- **Trivia / Edutainment:** Trivia packs or question sets can reference `knowledgeCardId` and `section` or `activity` so that "Learn more" links open the correct card. See **docs/EDUTAINMENT-VISION.md**.

No write/update API until editorial and (future) community contribution are defined; cards can be maintained in repo or CMS and deployed as static or via build.

---

## UI rendering rules (from vision)

- Calm, grounded layout; subtle depth; no clutter; no cognitive overload.
- Gentle curiosity hooks; no autoplay, flashing, or aggressive motion.
- Mascots (Mabel, Donut) non-intrusive.
- Feel: *"I'm safe here. I can take my time. I'm allowed to learn."*
- Audience layer selector (Child / Learner / Explorer / Deep Dive) drives which content and media are shown.
- Sources always visible (e.g. expandable or at bottom of card).

---

## References

- **Vision and values:** `docs/LEARN-AND-GROW-VISION.md`
- **Edutainment (trivia, teach-then-check):** `docs/EDUTAINMENT-VISION.md`
- **Trusted facts and sourcing:** `docs/TRUSTED-FACTS-DATABASE.md` (align citation rules)
