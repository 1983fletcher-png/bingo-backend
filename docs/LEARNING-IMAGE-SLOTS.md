# Learning image slots — core principle (lock this in)

**Images exist to reduce cognitive load, not to decorate.**  
If an image does not clarify, anchor, or progress understanding — it does not belong.

The system enforces:

- **Required image types (slots)** — each section declares slots with intent (hero, context, diagram, step, comparison, etc.).
- **Optional depth expansions** — expandable deep-dive content where appropriate.
- **Strict relevance + legality** — images must attach to a slot; only PD / CC0 / CC BY sources.
- **Unlimited scalability** — same pattern for a single diagram page or a 40-image lifecycle.

---

## 1. Learning section IDs (the spine)

Every learning page is broken into **atomic sections** with **stable IDs**. These IDs connect images, text, trivia, games, and edutainment.

**Section ID rules:** human-readable, stable (never change once published), hierarchical, predictable.

**Example — Baking Soda Volcano**

- `learningPageId`: `science.chemistry.experiments.baking-soda-volcano`
- Section IDs: `intro.hook`, `overview.what-is-happening`, `materials.list`, `steps.build`, `reaction.chemistry`, `reaction.pressure-gas`, `safety.notes`, `real-world.connections`, `deep-dive.for-curious-minds`

Section IDs are the anchors for image slots.

---

## 2. Image slots (roles, not decoration)

Each section may declare one or more **slots**, each with an intent. Roles: `hero`, `context`, `diagram`, `step`, `comparison`, `lifecycle`, `process`, `detail`, `reference`.

- Some sections have **zero** required images.
- Some have **exactly one** (e.g. hero, context).
- Some allow **many** (e.g. steps, comparison) with an optional `maxImages` cap.

Nothing is arbitrary. See **frontend/src/types/learningEngine.ts**: `ImageSlot`, `volcanoImageSlots`, `LearningImageAsset`.

---

## 3. How images attach to slots

Images are **never free-floating**. Each image must declare:

- `learningPageId`, `sectionId`, `slotId`, `role`

**If an image does not match a slot → it is rejected.** Use `validateImageForSlot(learningImageAsset, slots)` before accepting or rendering.

---

## 4. Rendering logic (simple, ADHD-friendly)

- Sections render **top to bottom**.
- Each section: title, short text blocks (no walls of text).
- **Images appear between cognitive beats** — inline, optional click-to-expand. No popups, no autoplay, no hijacking scroll.

---

## 5. Why this scales

The same system handles:

- A single diagram page
- A 40-image frog lifecycle
- Dense biology taxonomy
- Historical timelines
- **Trivia generation** — e.g. “images tagged acid-base reaction with verified diagrams” for visual trivia.

---

## 6. Implementation status

| Item | Status |
|------|--------|
| Image ingestion pipeline (R2, validate, store) | ✅ Done — lib/imageIngest.js |
| Image slot schema + volcano slots | ✅ Done — learningEngine.ts |
| Learning page schema + section IDs | ✅ Done — LearningPage, volcano sections |
| Wire image slots to page renderer | 🔜 Next |
| Ingest volcano images into slots | 🔜 Next |
| Polish volcano page as flagship | 🔜 Next |
| Clone template for animals, biology, crafts, etc. | 🔜 Next |

---

## 7. Types and helpers (learningEngine.ts)

- **ImageSlot** — slotId, sectionId, role, required, maxImages?, preferredOrientation?, description
- **LearningImageAsset** — ImageAsset + learningPageId, sectionId, slotId, role
- **validateImageForSlot(image, slots)** — returns `{ valid, slot }` or `{ valid: false, reason }`
- **getSlotForSection(slots, sectionId)** — slots for one section
- **volcanoImageSlots** — gold standard array for the volcano page
- **BAKING_SODA_VOLCANO_PAGE_ID** — canonical page ID
