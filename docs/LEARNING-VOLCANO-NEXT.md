# Volcano page — next: ingest first images

Steps 3–5 are done: **Learning Page Schema**, **Wire Image Slots → Page Renderer**, and the **volcano skeleton** is live.

- **Schema:** `LearningPage` (id, slug, title, subtitle, audience, tone, topics, concepts, sections, metadata), `LearningSection` (id, title, intent, contentBlocks, imageSlots), `ContentBlock` (paragraph, bullet-list, callout, divider).
- **Volcano page:** `bakingSodaVolcanoPage` in `frontend/src/types/learningEngine.ts` — text-only, image-ready, sections have `imageSlots` from `volcanoImageSlots`.
- **Renderer:** `LearningPageView` renders sections and contentBlocks; image slots show placeholders until images are attached. Reachable at **/learn/baking-soda-volcano** (and from Learn & Grow under Crafts & Gentle STEM).

---

## 5. Ingest first real volcano images (next action)

Ingest these three so the page can be visually confirmed:

| Slot ID | Section | Role | Description |
|--------|---------|------|-------------|
| `hero.volcano-eruption` | intro.hook | hero | Visually exciting eruption — hands-on science |
| `materials.flatlay` | materials.list | reference | Flat lay of all materials |
| `diagram.chemical-reaction` | reaction.chemistry | diagram | Acid-base reaction and CO₂ diagram |

**How to ingest**

1. Use **lib/imageIngest.js** — `ingestImage({ imageUrl, metadata })`. Image URL must be from a trusted source (wikimedia.org, nasa.gov, etc.); metadata must include altText (≥10 chars), sourceName, sourceUrl, license (Public Domain / CC0 / CC BY 4.0), attributionRequired, tags, concepts, verified: true.
2. After ingest you get back an asset (id, url, altText, sourceName, sourceUrl, license, tags, concepts, verified).
3. **Attach to slot:** build a `LearningImageAsset` by adding `learningPageId: BAKING_SODA_VOLCANO_PAGE_ID`, `sectionId`, `slotId`, `role` from the table above. Validate with `validateImageForSlot(asset, volcanoImageSlots)`.
4. Pass `imagesBySlotId` to `LearningPageView`: `{ "hero.volcano-eruption": [heroAsset], "materials.flatlay": [flatlayAsset], "diagram.chemical-reaction": [diagramAsset] }` so the renderer shows images instead of placeholders.

**Script:** Use `scripts/ingest-learning-image.js` as a template. Duplicate it for hero, materials, and diagram; set `imageUrl` and `metadata` (altText, sourceName, sourceUrl, license, tags, concepts, verified: true). After each ingest, add to the returned asset: `learningPageId: "science.chemistry.experiments.baking-soda-volcano"`, `sectionId`, `slotId`, `role` from the table above, then pass the resulting `LearningImageAsset[]` into the page (e.g. via `imagesBySlotId` in `LearningPageView` or a small registry).

Once hero, materials flat lay, and chemical reaction diagram render correctly, the rest is refinement (steps 6–7: polish, clone for other topics).
