# Trivia + Learning Platform: Design Specification

**This is not just a trivia game. It is a flexible engagement engine.**

---

## Primary & Secondary Use Cases

| Priority | Use case |
|----------|----------|
| **Primary** | Live-hosted bar / brewery trivia (2-hour shows) |
| **Secondary** | Classrooms (K–12, college); corporate training & onboarding; HR-compliant learning; passive ambient trivia on TVs; fully offline / printable trivia |

---

## Core Design Principles

1. **Trivia is a delivery mechanism** for engagement, learning, and retention.
2. **Content must be modular, reusable, and configurable** across audiences.
3. **Accuracy and trust are critical** — factual errors are unacceptable.
4. **Same content must work for:** host screen, TV display, audience devices (optional), fully printed packets.
5. **Competition is optional.** Learning and discussion are first-class outcomes.
6. **Tone, difficulty, pacing, and scoring** must be configurable per session.

---

## Content Architecture (Mandatory)

Content is built from **primitives**.

### FACT

- A **verifiable statement**.
- Must include **at least one reliable source**.
- Tagged with:
  - Category
  - Difficulty band
  - Age suitability
  - Tone (fun / neutral / serious)

### QUESTION

- Built from **one or more facts**.
- **Question types** include (but are not limited to):
  1. Multiple Choice (3–5 options)
  2. True / False
  3. Write-In (short answer)
  4. List / Name X
  5. Matching
  6. Ordering / Ranking
  7. Fill-in-the-Blank
  8. Guess-the-Number (closest wins)
  9. Picture-Based Identification (describe image)
  10. Scenario / What Would You Do (discussion-first)
  11. Opinion Poll (no correct answer)
- Each question may optionally include:
  - Fun fact
  - Discussion prompt
  - Real-world or business application
- Questions must support:
  - **Scoring OR no scoring**
  - **Partial credit** where appropriate

### INSIGHT

- Reinforcement layer explaining:
  - Why the answer matters
  - Why people often get it wrong
  - How it applies to real life, work, or culture

---

## Block System

A **BLOCK** is a **5–15 minute unit**. Blocks are the core building piece.

### A block may contain

- 1–3 questions **OR**
- 1 fact + 1 prompt **OR**
- 1 scenario + discussion

### Blocks must be

- Independently reusable
- Printable
- Host-readable
- Optional for automation

### Block types include

- Warm-up / Icebreaker
- Knowledge Check
- Team Collaboration
- Discussion / Reflection
- Lightning / Speed
- Application / Scenario

---

## Round System

**Rounds** are **energy containers**, not just question counts.

### Round archetypes

- Easy Warm-Up
- Mixed Knowledge
- Lists & Matching
- Reasoning / Thinky
- Lightning / Wildcard

### Each round defines

- Pace
- Tone
- Interaction mode
- Scoring style (or none)

---

## Session System

**Sessions** are **time-based recipes**.

### Standard bar session

- **Total time:** ~2 hours
- **Total questions:** 45–50 (target: 48)
- **Breaks:** 3 × 10 minutes

### Default bar structure

| Segment | Content |
|---------|--------|
| Round 1 | 8 questions (easy, confidence-building) |
| Round 2 | 10 questions (mixed) |
| **Break** | |
| Round 3 | 10 questions (lists, matching, teamwork) |
| **Break** | |
| Round 4 | 10 questions (medium difficulty, reasoning) |
| **Break** | |
| Round 5 | 10 questions (lightning / wildcard / final) |

### Sessions must also support

- 20-minute packs
- 30-minute packs
- 60-minute sessions
- Passive looping TV mode

---

## Interaction Modes

### Supported modes

- Individual play
- Team play
- Mixed
- Observer-only (ambient TV trivia)

### Answers

- **Anonymous by default**
- Attributable later for training/testing

### Scoring

- **Optional**
- **Configurable**
- Can be **disabled entirely**

---

## AI Usage Rules (Critical)

**AI is an assistant, not an authority.**

### AI may

- Draft questions from **verified** facts
- Adjust difficulty for age ranges
- Rewrite tone (bar / classroom / corporate)
- Suggest follow-up prompts
- Flag ambiguity or unclear wording

### AI may not

- Publish unverified facts
- Invent sources
- Override human approval
- Guess when uncertain

### All factual content must

- Be **cross-checked**
- Be **source-backed**
- Be **flagged if uncertain**

---

## Output Requirements (When Generating a Trivia Pack)

When asked to **generate a trivia pack**, output:

1. **Pack title**
2. **Intended audience**
3. **Tone description**
4. **Session length**
5. **Round-by-round structure**
6. **For EACH question:**
   - Question text
   - Question type
   - Accepted answer(s)
   - Difficulty (Easy / Medium / Hard)
   - Category
   - Optional fun fact
   - Optional discussion prompt
   - Optional host notes (banter, clarification)
7. **Format must be:** clean, printable, host-readable, device-agnostic

---

## Design Goal

This platform must:

- **Feel fun** in a bar
- **Feel legitimate** in a classroom
- **Feel safe** in HR
- **Feel flexible** to hosts
- **Feel trustworthy** to players

**You are not building trivia. You are building a reusable knowledge & engagement engine.**

---

## References

- Existing trivia UX and backend: see `docs/` and `.cursor/rules/trivia-platform.mdc`.
- Content and trust: see `docs/TRUSTED-FACTS-DATABASE.md`, `docs/LEARN-AND-GROW-CITATION-AUTHORITIES.md`.
