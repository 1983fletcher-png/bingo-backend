# Edutainment — Vision & Structure

## What It Is

**Edutainment** on The Playroom is **learning through play** — not just trivia with a different name. It’s structured for:

- **Classrooms** (K–12, college)
- **Study groups** and review sessions
- **Libraries** and after-school programs
- **Families** and homeschool
- **Corporate training** (onboarding, compliance, soft skills)

The goal: **teach and check** in a way that feels like a game. Right answers are rewarded; wrong answers are a chance to learn, with clear explanations and no shame.

---

## Design Principles

1. **Clarity over cleverness** — Questions are clearly worded; one best answer; no trick wording.
2. **Explain the answer** — After reveal, show a short explanation or fun fact so everyone learns.
3. **Grade-appropriate** — Content and difficulty scale by grade band or self-selected level.
4. **Accessible** — Readable fonts, high contrast, optional audio/read-aloud for younger kids.
5. **Flexible pacing** — Host (teacher/facilitator) controls timing; can pause for discussion.

---

## Grade Bands (Suggested)

| Band    | Ages / Grade   | Use case                          |
|---------|----------------|-----------------------------------|
| K–2     | ~5–7           | Very simple prompts, visuals      |
| 3–5     | ~8–10          | Elementary content, short answers |
| 6–8     | ~11–13         | Middle school, multiple subjects   |
| 9–12    | High school    | Subject-specific, exam prep       |
| College | 18+            | General knowledge, subject depth   |
| All     | Mixed          | Family or mixed-age groups        |

---

## Subject Areas (To Expand)

- **STEM:** Math, science (life, physical, earth), technology, engineering.
- **Literacy & language:** Reading comprehension, vocabulary, grammar, ESL.
- **Social studies:** History, civics, geography, economics.
- **Arts & culture:** Music, visual arts, literature, film.
- **Life skills:** Health, safety, financial literacy, critical thinking.
- **Custom:** Teacher-uploaded or -authored question sets for a specific unit.

---

## Activity Types (Beyond Trivia)

1. **Quiz / Trivia** — Multiple choice or short answer; reveal correct answer + explanation.
2. **Flashcards** — Term on one side, definition or explanation on the other; flip on tap.
3. **Ordering / sequencing** — Put events, steps, or items in order (e.g. timeline, process).
4. **Matching** — Match terms to definitions, causes to effects, etc.
5. **True / False** — Quick checks with explanation on reveal.
6. **Poll + discuss** — "What do you think?" then reveal the correct or best answer and explain.
7. **Teach-then-check** — Short "mini-lesson" (text or optional media), then 1–3 questions to check understanding.

---

## Question Format (Suggested)

Each **edutainment question** can include:

- `question` — The prompt (text, optional image).
- `correctAnswer` — The accepted answer(s).
- `explanation` — 1–3 sentences shown after reveal ("Why this is correct" or "Fun fact").
- `subject` — e.g. "math", "science", "history".
- `gradeBand` — e.g. "3-5", "9-12".
- `difficulty` — e.g. 1–3 or "easy" / "medium" / "hard".

Same mechanics as trivia (host reveals, scores optional), but with **explanation** and **metadata** so teachers can filter and so learning is explicit.

---

## Content Packs (Future)

- **Pre-built packs** by subject and grade (e.g. "Grade 5 Science – Ecosystems", "US History – Civil War").
- **Host-built packs** — Create custom question sets; save and reuse.
- **Import/export** — CSV or simple JSON for teachers who build elsewhere.

---

## Technical Hooks

- Reuse Trivia backend: `gameType: 'edutainment'` or reuse `trivia` with an `explanation` field on questions.
- **Rounds** can be themed by subject or unit (e.g. "Round 1: Fractions", "Round 2: Word Problems").
- **Host UI:** Filter by subject, grade band, difficulty; optional "explanation always shown" toggle.
- **Player UI:** Same clean question view; after reveal, show explanation in a clear, readable block.

---

## Creative Directions (To Explore)

- **Story mode** — Questions tied to a narrative or theme (e.g. "Space mission" where each correct answer advances the story).
- **Team vs team** — Class split into teams; same questions, team scores.
- **Differentiated difficulty** — Same topic, different difficulty levels; players or host choose.
- **Spaced repetition** — Mark questions for "review again"; resurface in a later session.
- **Badges / milestones** — "Completed 10 science questions," "Got 5 in a row correct," to encourage engagement without pressure.

---

## Learn & Grow integration

**Playroom: Learn & Grow** is the knowledge layer that feeds Edutainment. Each **Knowledge Card** (truth-first, cited, age-layered) can supply:

- **Teach-then-check** mini-lessons (card content → then 1–3 questions).
- **Trivia hooks** and question/answer pairs tagged to cards (so "Learn more" opens the right card).
- **Subject/tag alignment** — cards use the same taxonomy (STEM, subjects, tags) as trivia packs.

See **docs/LEARN-AND-GROW-VISION.md** (values and flagship cards) and **docs/LEARN-AND-GROW-KNOWLEDGE-CARD-SPEC.md** (schema and API). Edutainment questions can reference `knowledgeCardId` for deep links and consistent sourcing.

---

## Summary

Edutainment on The Playroom = **Trivia-style mechanics** + **explanations** + **grade/subject structure** + **teacher control**. Build it so that one day a teacher can run a 20-minute review game as easily as a host runs Music Bingo, with the same calm, clear, human-centered UX.

This doc is the vision. Implementation can start with: add `explanation` to trivia questions, add grade/subject filters to pack selection, and one or two sample edutainment packs (e.g. "Grade 5 Science" with explanations). Learn & Grow cards then become the trusted source for those explanations and for "learn more" depth.
