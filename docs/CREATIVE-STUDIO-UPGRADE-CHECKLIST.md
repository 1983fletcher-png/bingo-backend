# Creative Studio Patch Upgrade — Checklist

Apply the Creative Studio upgrade (structured doc, edit mode, mixed trivia, export alignment) and ensure everything is complete before push/commit/deploy.

---

## Pre-upgrade state

- **CreativeStudio.tsx**: Block-based parse (ContentBlock[], parseContent), MENU/TRAINING/TEST/TRIVIA modes, export using ExportBlock[].
- **creativeStudioExport.ts**: ExportBlock / ExportItem; exportPdf(blocks, mode), exportWeb(blocks, mode), etc.
- **CreativeStudio.css**: Full layout (header, paste, modes, workspace, export, qr).

---

## Upgrade checklist

### 1. Code changes

- [x] **CreativeStudio.tsx** — Replace with upgrade version:
  - Types: `SectionKind`, `Item`, `Block`, `StudioDoc`, `TriviaQ`.
  - Parsing: `parseToDoc(rawText)`, `docToCanonicalText(doc)`; meta vs items sections; `stripPriceFromTail`, `parseItemLine`, `isSectionHeader`, `looksLikeMetaSectionTitle`.
  - Trivia: `buildTrivia(doc, count)` → `TriviaQ[]` with `prompt`, `options`, `correctIndex`, `sectionTitle`; mixed across document (single “Mixed Trivia” block).
  - State: `rawInput`, `parsedDoc` (useMemo), `editDoc` + `isEditing`; `activeDoc = isEditing ? editDoc : parsedDoc`.
  - Edit actions: `commitEditsToRaw`, `updateSectionTitle`, `updateItem`, `addItem`, `removeItem`.
  - UI: header row with “Editing: ON/OFF” pill and “Save edits” button; TRIVIA renders one “Mixed Trivia” section with hint; MENU mode has editable section title, name/price/desc inputs, “+ Item”, × remove.
  - Export: `exportPdf(activeDoc, mode)`, `exportWeb(activeDoc, mode)`, `exportSocial(activeDoc, mode)`.
  - Default content: Parkway Pizzas example (hours, Section: Pizzas, Section: Kids).
- [x] **creativeStudioExport.ts** — Replace with upgrade version:
  - Accept `StudioDoc` (Block[], SectionKind, Item with tags, metaLines).
  - Helpers: `cleanWhitespace`, `shuffle`, `buildMixedTrivia(doc, count)`.
  - `buildExportHtml(doc, mode, options)`: iterate `doc.blocks`; for TRIVIA skip section loop, then append mixed trivia block + answer key.
  - HTML classes: `cs-title`, `cs-subtitle`, `cs-section`, `cs-meta`, `cs-menu-item`, `cs-menu-row`, `cs-menu-name`, `cs-menu-spacer`, `cs-menu-price`, `cs-menu-desc`, `cs-training`, `cs-test`, `cs-blank`, `cs-trivia`, `cs-q`, `cs-opts`, `cs-tag`.
  - Exports: `exportPdf(doc: StudioDoc, mode)`, `exportWeb(doc, mode)`, `exportSocial(doc, mode, size?)`, `exportQrDataUrl(url, size)`.
- [x] **CreativeStudio.css** — Add upgrade-only rules (do not remove existing layout):
  - `.creative-studio__header-row`, `.creative-studio__header-actions`
  - `.creative-studio__pill`, `.creative-studio__pill--on`, `.creative-studio__btn`
  - `.creative-studio__section-head`, `.creative-studio__section-title-input`, `.creative-studio__small-btn`
  - `.creative-studio__menu-item`, `.creative-studio__menu-row`, `.creative-studio__menu-name`, `.creative-studio__menu-spacer`, `.creative-studio__menu-price`, `.creative-studio__menu-desc`
  - `.creative-studio__menu-name-input`, `.creative-studio__menu-price-input`, `.creative-studio__menu-desc-input`, `.creative-studio__x-btn`
  - `.creative-studio__meta-line`, `.creative-studio__training-item`, `.creative-studio__training-name`, `.creative-studio__training-desc`
  - `.creative-studio__test-item`, `.creative-studio__test-name`, `.creative-studio__blank-lines`, `.creative-studio__blank-line`
  - `.creative-studio__hint`, `.creative-studio__trivia-q`, `.creative-studio__trivia-opts`, `.creative-studio__trivia-num`, `.creative-studio__trivia-tag`

### 2. Build & lint

- [x] `npm run build` (frontend) succeeds.
- [x] No new TypeScript or ESLint errors in `CreativeStudio.tsx`, `creativeStudioExport.ts`.

**Note:** In `parseToDoc`, TypeScript needed help narrowing `currentSection` after the `if (!currentSection)` block; used `const sec: Extract<Block, { type: 'section' }> = currentSection!` before using `sec.kind` / `sec.items` / `sec.metaLines`.

### 3. Smoke test (manual)

- [ ] Open `/create` (Creative Studio); paste default or sample menu text.
- [ ] Modes: MENU shows sections/items with prices; TRAINING shows study view; TEST shows blanks; TRIVIA shows “Mixed Trivia” with mixed questions.
- [ ] Toggle “Editing: ON” → edit section title, item name/price/description, add item, remove item → “Save edits” → raw text updates.
- [ ] Export PDF / Export Web / Instagram–Facebook open or download; TRIVIA export includes “Mixed Trivia” and answer key.
- [ ] QR: enter URL → Generate QR → image appears.

### 4. Pre-deploy

- [ ] All checklist items above completed.
- [ ] Commit message: “Creative Studio upgrade: StudioDoc, edit mode, mixed trivia, export alignment”.
- [ ] Push (use token if needed: `./scripts/git-push-with-token.sh`).
- [ ] Deploy (Netlify/Railway per repo setup); verify live Creative Studio.

---

## Notes

- **CSS**: The patch’s CSS is additive. Base layout (`.creative-studio`, `.creative-studio__header`, paste, modes, workspace, export, qr) remains in place; only the new/upgrade selectors are added.
- **Auto-save key**: Upgrade uses `creativeStudioAutoSaveRaw`; existing users may see default content once if they had the old key.
- **Trivia**: Questions are intentionally mixed across the whole document (not per section) to avoid section muscle-memory; export matches (Mixed Trivia + answer key).
