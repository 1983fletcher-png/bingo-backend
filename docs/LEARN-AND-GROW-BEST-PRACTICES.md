# Learn & Grow — Best-practices foundation

**Purpose:** We don’t invent from zero. We pull from the best educational and informational systems in the world and adapt their practices to Playroom’s values (truth, accessibility, no shame, calm). This doc records what we’re borrowing and how we apply it.

---

## 1. Clarity and consistency (Khan Academy)

**What they do:** Khan Academy uses a design system (Wonder Blocks) to remove fragmentation: one clear set of components, typography, and color so learners aren’t distracted by inconsistency. Design is tied to pedagogy — “deep design craft with thoughtful pedagogy.”

**What we do:** One Knowledge Card schema and one UX system for Learn & Grow. Same section structure (What / Why / How, etc.) across cards so users build a mental model. Calm, consistent visual language (subtle depth, no clutter) so the experience feels coherent and trustworthy.

---

## 2. Accessibility and inclusion (Khan Academy, WCAG)

**What they do:** Khan rebuilds experiences (e.g. graphing) for visual contrast, keyboard use, and screen readers so learners with disabilities can work independently. Accessibility is part of the product, not an add-on.

**What we do:** Semantic HTML, heading hierarchy, focus order, sufficient contrast. Audience layers (Child through Deep Dive) support different cognitive and reading needs. We design for “I’m safe here; I can take my time” — which includes not overwhelming users and supporting assistive tech. Future: neurodivergent presets and pacing (roadmap Phase 8).

---

## 3. One big idea and short, purposeful text (Museum exhibit labels)

**What research shows:** Visitors spend only a few seconds on a piece of text; the longer the text, the less likely it will be read. Effective labels are brief and purposeful. Exhibitions need a single “big idea” — one sentence that states what this is about. Labels should answer questions people are already asking and connect to prior knowledge. Avoid jargon.

**What we do:** Every Knowledge Card has a **one-sentence summary** (the big idea). Sections are scannable: clear headings, concise body text. We avoid jargon in Child and Learner layers; Explorer and Deep Dive can introduce terms with clear definitions. We don’t pad; we respect the reader’s time and attention.

---

## 4. Know your audience and layer depth (Museums, education)

**What they do:** Museums and educators stress knowing the audience — demographics and learning styles — and testing messages (formative evaluation). Content is often tiered: quick read vs. deep read.

**What we do:** Four audience layers (Child, Learner, Explorer, Deep Dive) so the same topic can be “right” for a 5-year-old and for a curious adult. Each layer has its own summary and, when we build it out, its own section variants (length, vocabulary, citation density). We don’t dumb down; we adapt depth and tone.

---

## 5. Pacing and gentle feedback (Duolingo-style, learning science)

**What they do:** Short steps, clear progress, low-stakes feedback. Learners aren’t punished for wrong answers; they’re guided. Bite-sized chunks reduce overwhelm.

**What we do:** Cards are broken into clear sections so users can pause and resume. Activities (crafts, observation, gentle experiments) are optional and framed as “try this when you’re ready.” No autoplay, no flashing, no aggressive motion. Wrong answers in future trivia/edutainment link to “Learn more” (the card), not shame. We build confidence through understanding.

---

## 6. Citations and evidence (Academic and institutional standards)

**What they do:** Universities, government agencies, and encyclopedias require clear sourcing. Claims are traceable; readers can verify. Opinion is separated from fact.

**What we do:** **Citations are mandatory** for every Knowledge Card. Only allowed source types: peer-reviewed journals, university extension programs, government science agencies, respected encyclopedias, museums and research institutions. Every card lists sources at the end; in Deep Dive we can cite in line. We never copy; we ethically summarize and attribute. See **docs/LEARN-AND-GROW-VISION.md** and **docs/TRUSTED-FACTS-DATABASE.md**.

---

## 7. Calm and emotional safety (Playroom differentiator)

**What we do that’s deliberate:** Many learning platforms are noisy (ads, notifications, gamification that feels pushy). We choose calm: grounded layout, subtle depth, no cognitive overload. Mascots (Mabel, Donut) are present but never distracting. The goal is “I’m safe here. I can take my time. I’m allowed to learn.” That’s our standard for every screen and every card.

---

## 8. Interconnection and reuse (Knowledge systems)

**What they do:** Encyclopedias and course platforms link related articles and modules so learning is connected, not isolated.

**What we do:** Every card has `relatedCardIds` and `tags`. The UI can show “Related” and “Explore more.” Trivia and edutainment reference cards so “Learn more” opens the right place. Tags align with subject areas so filtering (by topic, STEM anchor) works across cards and future games. The system feels like one coherent knowledge base, not scattered pages.

---

## Summary table

| Practice | Source of inspiration | How we apply it in Learn & Grow |
|----------|------------------------|----------------------------------|
| Clarity and consistency | Khan Academy (design system, pedagogy) | One schema, one UX system; same section structure across cards. |
| Accessibility and inclusion | Khan, WCAG | Semantic HTML, contrast, layers, future presets. |
| One big idea, brief text | Museum exhibit research | One-sentence summary per card; scannable sections; no jargon in early layers. |
| Know your audience, layer depth | Museums, education | Child / Learner / Explorer / Deep Dive; adapt depth and tone, don’t dumb down. |
| Pacing and gentle feedback | Duolingo, learning science | Bite-sized sections, optional activities, no shame; “Learn more” links. |
| Citations and evidence | Academic, institutional | Mandatory sources; only allowed types; ethical summarization. |
| Calm and emotional safety | Playroom vision | Grounded design, no clutter, no autoplay; “safe here, take your time.” |
| Interconnection | Encyclopedias, courses | relatedCardIds, tags; related cards and trivia integration. |

---

## References (for our own practice)

- Khan Academy Design: “Why design at Khan Academy?” (Medium); Wonder Blocks / design system; “Rebuilding Graphs for Accessibility” (Khan Blog).
- Museum labels: AAM “Striving for Excellence in Exhibition Label Writing”; label readability research (e.g. Wiley/Curator); audience and “big idea” frameworks.
- Learning science: Bite-sized learning, retrieval practice, low-stakes feedback (general principles we align with; no single URL required for this doc).
- WCAG 2.1: Web Content Accessibility Guidelines for contrast, keyboard, structure.

We don’t copy these organizations’ content; we apply their **design and pedagogical principles** to our own truth-first, cited, age-layered system.
