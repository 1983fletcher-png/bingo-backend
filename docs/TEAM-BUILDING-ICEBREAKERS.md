# Team Building & Icebreakers — Expansion Plan

## Overview

Team Building and Icebreakers are two pillars of The Playroom (roadmap). They share a goal: **low-stakes, high-connection** activities that work in corporate events, workshops, mixers, and any setting where people need to get comfortable quickly.

---

## Team Building

### Current direction
- Platform already mentions "team building" in positioning and rules.
- Focus: activities that build trust, communication, and collaboration without feeling forced.

### Expansion ideas

1. **Structured activities (host-led)**
   - **Two truths and a lie** — Each person shares three statements; others guess the lie. Platform: host shows prompt, players submit answers, reveal round.
   - **Quick polls** — "Which would you rather?" or "Raise your hand if…" with live results. Good for large groups.
   - **Shared word cloud** — One word that describes the team / the project / the week. Aggregate into a cloud; discuss.
   - **Marshmallow challenge (digital)** — Timed round: "Build the tallest virtual tower" with constraints. Teaches iteration and roles.
   - **Role-play scenarios** — Short scenarios (e.g. "Handle an upset customer"); players vote on best approach, then reveal and discuss.

2. **Collaborative modes**
   - **Team trivia** — Same trivia engine, but players are in teams; team score and team discussion before answering.
   - **Team Music Bingo** — Tables or squads share one card; first team to get a line wins. Encourages talking and consensus.

3. **Reflection and debrief**
   - After an activity: one prompt per person ("One thing I learned," "One thing I'll try tomorrow"). Optional anonymous or named; host can show a few on the big screen.

4. **Templates for facilitators**
   - "15-minute energizer" vs "45-minute deep dive" presets.
   - Suggested sequences: Icebreaker → Short game → Reflection.

### Technical hooks (for implementation)
- Reuse **waiting room** and **host control** patterns from Music Bingo / Trivia.
- New event types: `icebreaker`, `team-building`.
- New socket events: `host:start-icebreaker`, `player:submit-response`, `game:reveal-poll`, etc.
- Optional: **polls** with multiple choice or free text; **word clouds** from aggregated text.

---

## Icebreakers

### Philosophy
- **Fun, fast, inclusive.** No one should feel put on the spot in a bad way.
- **Conversation starters**, not tests. The goal is to get people talking.

### Activity types to support

1. **Prompt-based (one question, everyone answers)**
   - "What's a small win you had this week?"
   - "If you could have dinner with anyone, who and why?"
   - "What's a hobby you've picked up in the last year?"
   - "One word that describes how you're feeling right now."
   - Host shows prompt; players type or select; optional reveal (anonymous or by name).

2. **Two truths and a lie**
   - Each player submits three statements; host reveals one at a time; others guess the lie. Can be done in small groups or one-by-one for the room.

3. **Would you rather / This or that**
   - Binary polls: "Coffee or tea?" "Beach or mountains?" Results shown live. No wrong answers.

4. **Quick introductions**
   - "Say your name and one word that describes you." Platform can collect and display (e.g. scrolling list or grid).

5. **Show of hands / Live polls**
   - "Raise your hand if you've been to more than 5 countries." Host can run multiple quick polls; results as bar or count.

6. **Random fun**
   - "What's your go-to karaoke song?" — Collect and show a playlist. "What's the best snack?" — Word cloud.

### Content packs (for future use)
- **Corporate / remote:** Focus on wins, challenges, communication style.
- **New team / onboarding:** Name, role, one fun fact.
- **Social / mixer:** Would you rather, favorites, travel, food.
- **Conference / large room:** Fast polls, one-word check-ins, show of hands.

### Data structure (suggested)
- **IcebreakerPack**: `{ id, title, description, prompts: string[] }`.
- **ActivityTemplate**: `{ id, type: 'prompt' | 'two-truths' | 'poll' | 'word-cloud', ... }`.
- Stored in `frontend/src/data/icebreakerPacks.ts` and `teamBuildingActivities.ts` when building the feature.

---

## Next steps

1. **Backend:** Add `gameType: 'icebreaker'` or `'team-building'` and minimal events (e.g. prompt + submit + reveal).
2. **Frontend:** Host flow to pick an icebreaker pack or activity; player view to answer and see results.
3. **Content:** Populate `icebreakerPacks` and team-building activity definitions (prompts, templates).
4. **UX:** Keep it as simple as Music Bingo / Trivia: host in control, one screen for players, clear "next" and "reveal."

This doc is the expansion blueprint. Implementation can proceed in phases: content first, then host/player UI, then advanced features (word clouds, team modes).
