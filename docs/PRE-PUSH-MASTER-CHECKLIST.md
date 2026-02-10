# Pre-Push Master Checklist

Use this checklist before pushing **all** uncommitted work: Creative Studio upgrade, Activity Calendar, print pack, observances section, Home, and docs. Ensure everything is complete and the build passes.

---

## What’s in this push

You are **ahead of origin** by multiple commits; the following are **uncommitted** and will be included when you stage and push:

| Area | Files | Summary |
|------|--------|--------|
| **Creative Studio** | `CreativeStudio.tsx`, `creativeStudioExport.ts`, `CreativeStudio.css` | StudioDoc, edit mode, mixed trivia, export alignment |
| **Creative Studio docs** | `CREATIVE-STUDIO-CODE-REFERENCE.md`, `CREATIVE-STUDIO-UPGRADE-CHECKLIST.md` | New (untracked) |
| **Activity Calendar** | `ActivityCalendar.tsx` | Centered month nav; Design then Print; mobile grid + landscape tip; simplified observances block; light-theme arrow visibility |
| **Print pack** | `printMaterials.ts` | Page 1 tighter calendar; Page 2/3 “This month’s observances” and “Planning & post-event notes” copy |
| **Home** | `Home.tsx`, `home.css` | Streamline / premium tweaks |
| **Docs** | `HOME-PREMIUM-FINAL-CHECKLIST.md`, `OBSERVANCES-SOURCES-AND-VERIFICATION.md` | Checklist and observances verification (e.g. notable people) |

Exclude from commit if you prefer: `.DS_Store` (add to `.gitignore` if not already).

---

## Checklist (all must be done before push)

### 1. Build

- [x] **Frontend build** — `npm run build` in `frontend/` succeeds. *(Verified.)*

### 2. Creative Studio upgrade

- [x] **CreativeStudio.tsx** — StudioDoc, parseToDoc/docToCanonicalText, edit mode (pill + Save edits), mixed trivia, MENU/TRAINING/TEST/TRIVIA.
- [x] **creativeStudioExport.ts** — StudioDoc, buildMixedTrivia, TRIVIA export + answer key.
- [x] **CreativeStudio.css** — Upgrade styles merged (header-row, pill, menu layout, trivia, test, training).
- [x] **TypeScript** — parseToDoc narrowing fix applied (no errors).

### 3. Activity Calendar

- [x] **Month nav** — Centered; Print moved after Design tabs.
- [x] **Mobile** — Grid in `.activity-calendar-grid-wrap`; “Turn phone sideways” tip at &lt;640px.
- [x] **Observances section** — “This month’s observances” as block-per-day (date + list of names); no “Show only selected,” no per-day checkboxes/notes in that block.
- [x] **Light theme** — Month arrows use `.activity-calendar-month-btn` with `[data-theme="light"]` dark text so arrows stay visible on all design themes.

### 4. Print pack (3 sheets)

- [x] **Page 1** — Full-size calendar (landscape); tighter padding/sizing so grid fills sheet.
- [x] **Page 2** — “This month’s observances” + planning/post-event copy.
- [x] **Page 3** — “Planning & post-event notes” + subtitle and blank lines.

### 5. Observances & docs

- [x] **Observances doc** — `OBSERVANCES-SOURCES-AND-VERIFICATION.md` updated (e.g. notable people / celebrity births-deaths / musicians section if added).
- [x] **Calendar/observances** — Full calendar (March–Dec) and API already in earlier commits; this push includes UI/print/doc refinements.

### 6. Home (optional verify)

- [ ] **Smoke check** — Home page loads; toolbar, cards, How it works, Our approach look correct. *(Manual.)*

### 7. Final go/no-go

- [ ] **All items above** completed or N/A.
- [ ] **No unintended changes** — `git diff` and `git status` reviewed.
- [ ] **Ready to commit and push.**

---

## Commit and push

1. **Stage** (exclude `.DS_Store` if desired):
   ```bash
   cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend"
   git add frontend/src/pages/CreativeStudio.tsx frontend/src/lib/creativeStudioExport.ts frontend/src/styles/CreativeStudio.css
   git add frontend/src/pages/ActivityCalendar.tsx frontend/src/lib/printMaterials.ts
   git add frontend/src/pages/Home.tsx frontend/src/styles/home.css
   git add docs/HOME-PREMIUM-FINAL-CHECKLIST.md docs/OBSERVANCES-SOURCES-AND-VERIFICATION.md
   git add docs/CREATIVE-STUDIO-CODE-REFERENCE.md docs/CREATIVE-STUDIO-UPGRADE-CHECKLIST.md docs/PRE-PUSH-MASTER-CHECKLIST.md
   ```

2. **Commit**:
   ```bash
   git commit -m "Creative Studio upgrade, calendar/print/observances polish, Home docs"
   ```
   Or split into two commits if you prefer:
   - `Creative Studio upgrade: StudioDoc, edit mode, mixed trivia, export alignment`
   - `Calendar: centered nav, Design then Print, mobile grid, observances block; print pack copy; docs`

3. **Push** (use token if GitHub auth fails):
   ```bash
   set -a && source .env && set +a && ./scripts/git-push-with-token.sh
   ```
   Or from repo root with token in env: see `.cursor/rules/github-push-from-cursor.mdc`.

4. **Deploy** — Netlify/Railway per your setup; confirm Creative Studio, Activity Calendar, and Home on the live site.

---

## Reference

- **Creative Studio:** `docs/CREATIVE-STUDIO-UPGRADE-CHECKLIST.md`
- **Observances calendar:** `docs/OBSERVANCES-FULL-CALENDAR-CHECKLIST.md`
- **Home:** `docs/HOME-PREMIUM-FINAL-CHECKLIST.md`
- **Push from Cursor:** `.cursor/rules/github-push-from-cursor.mdc`
