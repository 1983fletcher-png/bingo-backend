## AI Builder — Phase 1 (Draft + Export, No Library)

### Goal

Ship a **site-wide AI Builder** (in `music-bingo-app`) that can be opened from anywhere, guides hosts through a thorough interview, and produces **structured specs** (experience + nodes) that can be:

- used immediately in the host’s current room (**private draft**)
- exported as JSON (**download/export**)

No shared/public library yet.

### Non‑negotiable rule (facts)

Anything presented as factual MUST be cross‑referenced.

- Draft/local play may include unverified facts, but they MUST be visibly marked **UNVERIFIED**.
- Sharing/publishing is blocked until verification requirements are met (Phase 2+).

### Backend endpoints (this repo)

#### `POST /api/ai-builder/next-questions`
Adaptive interview step.

**Request**

```json
{ "intent": { "build": "", "title": "", "venue_type": [], "audience": {}, "duration_minutes": 30, "notes": "" } }
```

**Response**

```json
{
  "intent": { "...normalized..." },
  "done": false,
  "questions": [
    { "id": "build", "prompt": "What are you building?", "type": "single_select", "options": [{ "id": "trivia_pack", "label": "..." }] }
  ]
}
```

#### `POST /api/ai-builder/generate`
Phase 1 generator (skeleton spec + draft nodes). Intended to unblock UI integration and iteration.

**Request**: same `intent` as above; must be complete.

**Response**

```json
{
  "experience": { "experience_id": "draft-...", "title": "...", "modules": [ ... ], "energy_waveform": [ ... ] },
  "draft_nodes": [
    {
      "id": "node-...",
      "claim_type": "factual_claim",
      "type": "fact",
      "title": "Draft question",
      "primaryClaim": "Replace with a real claim/prompt",
      "verifiedAnswer": null,
      "explanationSimple": "",
      "explanationExpanded": "",
      "confidenceLevel": "low",
      "sources": [],
      "ageAdaptations": { "kids": "", "teens": "", "adults": "" },
      "conversationPrompts": [ "What do you think?", "Why might people believe this?" ],
      "energyLevel": "medium",
      "localizationNotes": "",
      "sensitivityTags": [],
      "verification": { "status": "unverified", "required_sources": 2 }
    }
  ]
}
```

#### `POST /api/ai-builder/verify`
Phase 1 verification gate: **source-count validation only** (no web crawling).

Rules:
- `claim_type` in `["factual_claim","myth_vs_truth"]` requires `sources.length >= 2` to be considered `verified`.
- Opinion/story prompts do not require verification.

**Request**

```json
{ "nodes": [{ "id": "node-1", "claim_type": "factual_claim", "sources": [{ "url": "...", "title": "..." }] }] }
```

**Response**

```json
{
  "results": [
    { "id": "node-1", "verification_status": "unverified", "required_sources": 2, "source_count": 1 }
  ]
}
```

### UI (music-bingo-app)

Phase 1 UI should:
- Run the interview loop (`next-questions`)
- Generate a draft (`generate`)
- Show a clear **UNVERIFIED** banner for any factual nodes without verification
- Allow host edits
- Export JSON (download)

### Later phases (not in Phase 1)

- Phase 2: stronger verification (source quality ranking, excerpts, optional fetch)
- Phase 3: shared library + moderation tools

---

## Weak points & testing (Phase 1)

**Fixed in latest polish**

- **Form closing on first keystroke** — Fixed. We no longer refetch on every keystroke (debounced 600ms) and we never hide the question list while loading; we show “Updating…” instead so fields stay visible and focus is kept.
- **Number inputs** — Min/max age and duration now allow typing full numbers (e.g. 99); empty string no longer sends `0` and we use client-side “done” so Generate enables as soon as all fields are valid.

**Known limitations / weak points**

1. **Cross-referencing is count-only** — Verify only checks that each factual node has `sources.length >= 2`. It does not fetch or validate URLs, rank quality, or fill in sources; the draft nodes from generate have empty `sources: []`, so they will show unverified until the host (or a later phase) adds sources.
2. **Voice input** — Uses Web Speech API; works best in Chrome/Edge over HTTPS. No fallback UI if unsupported; mic button is hidden when not supported.
3. **No persistence** — Draft and intent live only in component state; closing the drawer loses everything. Export JSON is the only way to keep a copy.
4. **Order of questions** — Backend removes questions as soon as a “section” is complete (e.g. audience disappears when both min and max age are set). If the user goes back and clears a field, we refetch and the question can reappear, but there’s no explicit “Previous” step.
5. **Generate is skeleton only** — Phase 1 `generate` returns placeholder content (e.g. “Replace with a real claim”); no LLM or real content generation yet.
6. **Accessibility** — Drawer is focus-trapped and has ARIA; voice button and error states could use clearer live-region announcements for screen readers.

### Testing checklist (before release)

- [ ] Open AI Builder → answer questions (type in each field, use number inputs). Form stays open; no close on first keystroke.
- [ ] Close drawer mid-form → reopen → draft and answers are restored; “Your draft has been restored” appears briefly.
- [ ] Complete all questions → Generate draft → Draft preview appears with factual item(s).
- [ ] Add 2 source URLs (e.g. Wikipedia, Britannica) in “Add sources” for each fact → click Verify facts → status shows “verified” and source count 2/2.
- [ ] Export JSON → file downloads with experience + draft_nodes.
- [ ] Advanced → Clear saved draft → form and draft reset; reopen shows empty form.
- [ ] Voice: in Chrome/Edge (HTTPS) mic works for Title and Notes. In unsupported browser, mic shows; on click, message: “Voice works best in Chrome, Edge, or Safari (HTTPS). Please type your answer above.”

