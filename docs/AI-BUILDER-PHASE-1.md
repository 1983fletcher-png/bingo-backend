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

