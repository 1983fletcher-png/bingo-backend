# Playroom: Learn & Grow — Phased roadmap

**Purpose:** Build the knowledge module right — with research, credible sources, deep content, and best-practice UX. No shortcuts. This roadmap is the sequence we follow so the system is trustworthy, scalable, and genuinely better.

---

## Principles driving the roadmap

- **Truth and citations first.** Every card is only as good as its sources. We research before we write.
- **One flagship card done end-to-end** before we scale. That card becomes the quality bar.
- **UX informed by the best.** We pull from top educational and informational systems (see **docs/LEARN-AND-GROW-BEST-PRACTICES.md**), then adapt for Playroom’s calm, layered, age-adaptive model.
- **Interconnection from day one.** Cards link to each other and share tags so trivia, activities, and “learn more” feel like one system.

---

## Content focus order (narrow first, expand as we go)

We focus on **a few categories and a few cards per category** so each one is done right. Expand once the bar is set.

| Order | Category | Scope | Status |
|-------|----------|--------|--------|
| 1 | **Plants (horticulture)** | Botany, gardening, food plants, how they grow. | ✅ First flagship card done. |
| 2 | **Crafts** | Science-through-craft; fun, do-at-home activities. Tied to STEM. | In progress (Crafts & STEM hub + Learning Engine). |
| 3 | **Geography** | Places, regions, maps, climate, landforms. Same Learning Engine structure (10 sections, tiers, cross-links, trivia). | **Next section.** Schema and Learn Center ready. |
| 4 | **Animals** | Biology, behavior, ecosystems. Tied to science and plants. | After Geography. |
| 5 | **Life skills** | Essential life things: safety, cooking basics, health, how things work. | After Animals. |

Science, biology, and STEM thread through Plants → Crafts → Animals → Life skills. Every card links to **more advanced systems** (e.g. "Learn more" → university or government resources). See **docs/LEARN-AND-GROW-CITATION-AUTHORITIES.md** for preferred institutions (Harvard, MIT, Princeton, USDA, NSF, cooperative extension, museums, etc.) and how we cite and link.

---

## Phase 1: Foundation (schema, roadmap, best practices)

**Goal:** Lock the contract and the quality bar so every card and every screen has a clear standard.

| Outcome | Status / deliverable |
|--------|----------------------|
| Knowledge Card schema | ✅ **LEARN-AND-GROW-KNOWLEDGE-CARD-SPEC.md** — id, title, summary, audienceLayers, sections, stemAnchors, activities, sources (mandatory), relatedCardIds, tags. |
| Vision and values | ✅ **LEARN-AND-GROW-VISION.md** — mission, core values, card system, UI principles, 10 flagship cards, sensitive topics, future considerations. |
| Roadmap | ✅ **This doc** — phased plan from foundation through scale and integration. |
| Best-practices foundation | ✅ **LEARN-AND-GROW-BEST-PRACTICES.md** — research-backed UX and content practices; inspiration from top institutions; how we apply them. |
| Data shape and API contract | ✅ Spec defines GET /api/learn/cards and GET /api/learn/cards/:id. Implemented in backend (Phase 3). |

**Exit criteria:** Anyone can read the vision, spec, roadmap, and best-practices doc and know exactly what “done right” means.

---

## Phase 2: First flagship card — content and sourcing

**Goal:** One complete card, all four audience layers, real sections, activities, and **mandatory cited sources** (peer-reviewed, university, government, encyclopedias, museums). This card is the template and quality bar for all others.

| Outcome | Deliverable |
|--------|--------------|
| Card chosen | **Plants & How They Grow** — botany, gardening, food plants, climate zones, sustainability. Universally relevant; excellent source availability (USDA, extension programs, botanical gardens). |
| Research and sourcing | Identify and list only allowed source types. Read and ethically summarize; never copy. |
| Full layered content | Child (visual, minimal text, gentle). Learner (step-by-step basics). Explorer (conceptual depth). Deep Dive (academic rigor, citations in line). |
| Core sections | What this is; Why it matters; How it works; Key facts; Step-by-step (e.g. how to grow a seed); Real-world examples. |
| STEM anchors | Science, real-world application (and optionally systems thinking). |
| Activities | At least one observation activity (e.g. watch a plant grow), one gentle experiment or craft (e.g. seed in a jar). |
| Sources list | Every claim traceable to a listed source. All sources from allowed types; URLs and institutions recorded. |
| Machine-readable card | ✅ **data/learn/plants-and-how-they-grow.json** — full schema, all four layers, sections, activities, five cited sources (USDA, Extension, Missouri Botanical Garden, Britannica, extension.org). |

**Exit criteria:** The Plants card is complete, cited, and usable in the UI. Any reviewer can check every fact against the listed sources. ✅ Met.

---

## Phase 3: Data layer and API

**Goal:** Cards are served to the frontend in a stable, filterable way. No CMS required for v1; we can load from repo-backed JSON.

| Outcome | Deliverable |
|--------|--------------|
| Card storage | JSON files in repo (e.g. **data/learn/*.json**) or single manifest that imports them. Version-controlled, reviewable. |
| List endpoint | **GET /api/learn/cards** — returns list with id, title, summary, tags (and optionally stemAnchors). Optional query params: tag, stemAnchor. |
| Detail endpoint | ✅ **GET /api/learn/cards/:id** — returns full card. Optional ?layer=child|learner|explorer|deepDive returns full card with _requestedLayer hint. |
| 404 and errors | ✅ Unknown id → 404. Invalid id (path traversal safe) → 400. Clear error messages. |

**Exit criteria:** Frontend can list cards and fetch one card by id; response shape matches schema. ✅ Met.

---

## Phase 4: UX system and first card in UI

**Goal:** A calm, grounded Learn & Grow experience that matches the vision. One card (Plants) fully navigable in the UI as the reference implementation.

| Outcome | Deliverable |
|--------|--------------|
| Learn & Grow entry | Route and nav entry (e.g. /learn or /learn-grow). Landing or list view: cards as calm, scannable tiles (title, one-sentence summary, tags). |
| Audience layer selector | Control (e.g. Child / Learner / Explorer / Deep Dive) that drives which content and tone are shown. Persist preference per user/session when possible. |
| Card detail view | Single card: title, summary, sections in order, activities block, sources at bottom (always visible or expandable). No clutter; subtle depth; readable typography. |
| Accessibility | Semantic HTML, heading hierarchy, focus order, sufficient contrast. Design for “I’m safe here; I can take my time.” |
| Mascots | Mabel and Donut present only as non-intrusive branding (e.g. small corner or footer), never blocking or distracting. |

**Exit criteria:** A user can open Learn & Grow, choose a layer, open “Plants & How They Grow,” read all sections and activities, and see all sources. The experience feels calm and trustworthy.

---

## Phase 5: Second and third flagship cards

**Goal:** Prove the system scales. Add cards in **content focus order** (Crafts → Animals → Life skills) with the same quality bar. Narrow to a few cards per category; expand as we go.

| Order | Card | Rationale |
|-------|------|-----------|
| 2 | **Crafts & Gentle STEM** | Science-through-craft; fun, do-at-home activities. Teaches process and real science through play. Top-tier citations (MIT, NSF, Exploratorium, etc.). |
| 3 | **Animals of the World** | Biology, behavior, ecosystems. Tied to science and plants. After Crafts. |
| (then) | **Life skills** (e.g. Cooking Basics, How Things Work) | Essential life things; expand after Animals. |

For each: same process as Phase 2 — research, sources, layered content, sections, activities, JSON, relatedCardIds and tags. Every source from allowed types; link to more advanced systems (see **LEARN-AND-GROW-CITATION-AUTHORITIES.md**).

**Exit criteria:** Crafts card done and linked to Plants; then Animals; then life-skills cards as we expand. Users can move between them via related cards and tags.

---

## Phase 6: Remaining flagship cards (4–10)

**Goal:** Complete the set of 10 flagship cards so the foundation is full and interconnected.

| Order | Card | Notes |
|-------|------|--------|
| 4 | Cooking Basics & Food Safety | Fact-based; food safety agencies and extension programs as sources. |
| 5 | Human Body Fundamentals | Neutral, clinical language; anatomy and physiology sources. |
| 6 | Mind & Emotion | Brain basics, emotional regulation; psychology and neuroscience sources. |
| 7 | Physics in Everyday Life | Forces, motion, sound, light; everyday examples; physics education sources. |
| 8 | Health & Nutrition | Evidence-based nutrition; no diet culture; institutional and government sources. |
| 9 | How Things Work | Technology, tools, infrastructure; explainer-style, cited. |
| 10 | Animals of the World | Biology, classification, behavior, ecosystems; A–Z and age-adaptive depth. |

Each card follows the same bar: research → sources → layered content → activities → JSON → links and tags.

**Exit criteria:** All 10 flagship cards are complete, cited, and available in the UI. Full interconnection and tag coverage.

---

## Phase 7: Trivia and Edutainment integration

**Goal:** Learn & Grow becomes the knowledge backbone for Playroom trivia and edutainment. “Learn more” and teach-then-check point into cards.

| Outcome | Deliverable |
|--------|--------------|
| Trivia question → card link | Trivia/edutainment questions can reference knowledgeCardId (and optional section or activity). “Learn more” opens the right card (and layer when relevant). |
| Teach-then-check content | Mini-lessons can be drawn from card sections (with attribution). Or written to match card structure and then linked to the card. |
| Tag and subject alignment | Trivia packs and cards share tags (e.g. plants, botany, science) so filtering and recommendations stay consistent. |

**Exit criteria:** A trivia or edutainment session can direct users to Learn & Grow cards with one tap; content is clearly sourced and consistent with the cards.

---

## Phase 8: Accessibility, localization, and future-ready design

**Goal:** Design for neurodivergent learners, reading levels, pacing, and (when we’re ready) localization and community contribution. Don’t build everything now; ensure the system can support it.

| Outcome | Deliverable |
|--------|--------------|
| Accessibility audit | WCAG 2.1 alignment; keyboard and screen-reader support; reduced motion respected. |
| Reading level and pacing | Schema or frontend supports optional reading-level variants and pacing hints (from vision “future considerations”). |
| Localization-ready | Copy and card content structured so translation and locale-specific examples can be added later without rearchitecting. |
| Community contribution (design only) | Document how user- or partner-submitted cards would be reviewed, edited, and published (editorial workflow); do not implement until approved. |

**Exit criteria:** The product is auditable for accessibility; the architecture does not block future accessibility layers, localization, or contribution.

---

## Summary: order of operations

1. **Foundation** — Schema, vision, roadmap, best practices. ✅
2. **First card** — Plants & How They Grow, full content and sources. ✅ (in progress)
3. **Data layer** — JSON + GET /api/learn/cards and /cards/:id.
4. **UX and first card in UI** — Learn & Grow routes, layer selector, card detail, calm design.
5. **Cards 2 and 3** — Crafts & Gentle STEM, then Animals of the World (content focus order).
6. **Cards 4–10** — Remaining flagship cards in order above.
7. **Trivia/Edutainment integration** — Links from games to cards; shared tags.
8. **Accessibility and future-ready** — Audit, localization-ready, contribution design.

We do not skip sourcing. We do not skip layers. We take the time to research and cite. That’s how this becomes a system that can be trusted by parents, teachers, caregivers, schools, libraries, and curious people everywhere.
