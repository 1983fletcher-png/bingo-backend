# PLAYROOM — CROWD CONTROL TRIVIA (Data-Driven Spec v1)

**Name:** Crowd Control Trivia  
**Core idea:** The crowd votes the next **CATEGORY**; the system serves the next verified question in that category/value ladder.

**Relation to Activity Room:** This is a distinct game type from Category Grid (Jeopardy-style). Crowd Control = **crowd votes category** → system advances the ladder → question appears. Uses shared Transport Bar, Display checkpoints, Identity/Moderation, and the **verified trivia database** (see §9; aligns with `MARKET-MATCH-SURVEY-SHOWDOWN-SPEC.md` shared content pipeline).

---

## 0) What Makes This Different

- Crowd Control Trivia is **NOT** “Jeopardy.”
- It’s a **data-driven trivia board** powered by a **verified trivia database**.
- Crowd votes the category → system advances the ladder → question appears → everyone answers.

**Non-negotiable:**

- Default packs use **VERIFIED** questions only (factual + sourced).
- Any media assets require license metadata (PD/CC) and attribution enforcement.

---

## 1) Game Loop (Default)

1. TV shows **BOARD** (categories across top; values down).
2. **Player voting opens** (10 seconds): “Pick the next category.”
3. Category with most votes **wins**.
4. System chooses the **next unused value** in that category (200→300→…).
5. TV shows **clue/question** (full screen).
6. **Players answer** (default: everyone answers).
7. **Reveal:** correct answer + short explanation + source citation line.
8. **Score update**.
9. **Return to BOARD**.

**Host can override:** force category, skip question, re-open voting, back/jump via Transport Bar (Display Only default).

---

## 2) Board Model (Category Voting + Auto-Ladder)

### Default board

- **6 categories × 5 values** (host adjustable).
- Values: 200 / 300 / 400 / 500 / 600 (configurable).
- Each category maintains a pointer to **“next value unused.”**

**Rules:**

- Crowd votes **category ONLY** (simplifies UX).
- When category wins: serve the next unused value question in that category; mark that value as used.
- Categories with no remaining questions become **disabled**.

**Optional host toggles:**

- Prevent same category twice in a row.
- Host-approve the winning category (hybrid mode).

---

## 3) Answer Modes + Question Types

**Default answer mode:** Everyone answers on phone.

**Supported question types (v1):**

- `multiple_choice` (3–5 options; auto-grade)
- `true_false` (auto-grade)
- `numeric` (auto-grade; optional tolerance; optional units)
- `free_text` (host-grade OR acceptable answers list; v1: prefer host-grade)
- `A_B` (this-or-that; factual or opinion)

**Under Pressure mini-mode:**

- 10 second timer (host adjustable).
- Locks submissions at 0.
- Optional speed bonus scoring (default OFF).

---

## 4) Scoring

**Default:**

- Correct = +value points.
- Incorrect = 0.

**Options:**

- Speed bonus (Under Pressure only) OFF by default.
- Penalties OFF by default.
- Scoreboard visibility: TV optional; player optional; host always.

---

## 5) Display Pages / Checkpoints

Stable page IDs for Transport Bar:

- `[CCT_TITLE]`
- `[CCT_BOARD]`
- `[CCT_VOTE_CATEGORY]`
- `[CCT_QUESTION]`
- `[CCT_LOCKED]` (optional)
- `[CCT_REVEAL]`
- `[CCT_SCORE]`
- `[CCT_SUMMARY]`
- `[STANDBY]`

**Default back behavior:** Display Only (doesn’t reopen voting unless host uses “Back + Edit”).

---

## 6) Host Controls (Required)

**Global Transport Bar:** Back / Next / Pause / Jump / Reset Question / End Session.

**Round controls:**

- Open/close voting.
- Adjust vote window (live).
- Tie-break rule: host / random / revote.
- Force category selection.
- Skip question.
- Toggle Under Pressure for next question.
- Toggle scoreboard visibility.
- Toggle “Hybrid: host approve category result.”

**Preview panes (top-right):** TV preview + page badge; Player preview + status badges (Voting open / Answers open / Locked).

---

## 7) Identity + Moderation (Use Shared System)

- **Identity modes:** Fun Nicknames / Roster-ID / Hybrid.
- **Moderation profiles:** All-Ages / Adults-only.
- Always block hate / harassment / threats / violence.
- Host approval queue optional (recommended for school).

---

## 8) Printables (v1)

- Board sheet.
- Host run-of-show.
- Question cards per category/value.
- Answer sheets (no phones mode).
- Score sheet.

**No-phones options:** Host enters category vote counts manually; host reads Q; teams answer on paper.

---

# 9) VERIFIED TRIVIA DATABASE (Shared Content Engine)

Crowd Control Trivia consumes a **verified trivia library**.

## 9.1 Trivia Data Model (Canonical)

### trivia_question

- `id` (uuid)
- `created_at` / `updated_at`
- `verification_status` (draft / verified / needs_review)
- `verified_by` / `verified_at`
- `source_id` (fk) — **REQUIRED** for factual questions in verified library
- `citation_text` (short) — **REQUIRED** when factual
- `citation_url` — **REQUIRED** when factual
- `claim_type` (factual / opinion / instructional)
- `audience_presets[]` (brewery / senior / school / corporate / sensory)
- `categories[]` (one or more: Food, Movies, History, etc.)
- `tags[]` (era, topic, difficulty notes, “nostalgia”, etc.)
- `difficulty` (1–5)
- `questionType` (MC / TF / numeric / free_text / A_B)
- `prompt_variants[]`:
  - `variant_id`
  - `prompt_text`
  - `optional_hint`
  - `time_limit_suggested`
  - `under_pressure_ok` (bool)
  - `answer_spec`:
    - `correct_answer`
    - `acceptable_answers[]` (for free_text normalization)
    - `options[]` (for MC/TF)
    - `numeric_tolerance` (optional)
    - `units` (optional)
  - `explanation_short` (1–2 sentences)
  - `fun_fact` (optional)
  - `media_asset_id` (optional)

### source

- `id` (uuid)
- `source_name`
- `publisher`
- `source_url`
- `snapshot_file_ref` (optional)
- `methodology_note` (optional)
- `last_fetched_at`

### media_asset (optional)

- `id`
- `kind` (image)
- `source_url`
- `license` (PD / CC BY / CC BY-SA / etc.)
- `attribution_text` (required if license requires)
- `stored_asset_ref`
- `verification_status` (draft/verified)
- `verified_by` / `verified_at`

## 9.2 Board Generation (Data Rules)

When generating a session board:

- Use **VERIFIED** questions only by default.
- For each category column: assign 1 question per value row (200..600); increase difficulty with value (recommended); enforce variety of question types down the column (avoid all MC); ensure audience preset compatibility; exclude recently used questions (session history window).

**If insufficient verified questions:**

- Show warning to host: “Not enough verified questions for X category/value.”
- Offer: swap category, reduce rows, or enable “Allow Draft Content” (explicit toggle).

## 9.3 Sourcing Rules (Factual vs Opinion)

- **Factual** questions in VERIFIED library **MUST** have `citation_url` + `citation_text`.
- **Opinion** questions can be verified without citation but must be tagged `claim_type=opinion` and use safe moderation rules.

---

# 10) TODO — CROWD CONTROL TRIVIA (Dev Checklist)

## CCT-0: Shared prerequisites

- [ ] Shared content engine tables (`trivia_question` / `source` / `media_asset`)
- [ ] Verification workflow gate (verified-only default)
- [ ] Import pipeline for JSON/CSV into staging + validate

**v1 seed data:** `data/crowd-control-trivia/trivia-seed-v1.json` — schema `playroom.trivia_seed.v1`. All three boards have 30 full questions each (6 categories × 5 values): Board 1 (Crowd Pleasers), Board 2 (Nostalgia & Friendly), Board 3 (Modern + Corporate Friendly).

## CCT-1: Gameplay MVP

- [ ] Board render + used state
- [ ] Category vote system (10s default)
- [ ] Auto-ladder selection (next unused value)
- [ ] Question page + player answering
- [ ] Auto-grade for MC/TF/numeric
- [ ] Reveal page with citation line
- [ ] Score update + back to board
- [ ] Host override controls + tie-break handling

## CCT-2: Under Pressure

- [ ] Timer + submission lock
- [ ] Optional speed bonus scoring

## CCT-3: Printables

- [ ] Board PDF + question cards + answer sheets + score sheets

---

*End of Crowd Control Trivia Spec v1*
