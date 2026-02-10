# Observances schema and verification workflow

This document describes the Observance schema and how we fact-check and publish correctness without copying third-party prose.

## 1. Why this schema works

- **Facts live in `rule`** — Date logic is structured (fixed, relative, computed), not buried in prose.
- **Verification is explicit and auditable** — We record *that* we checked sources and when; we do not copy their wording.
- **Original observances are clearly labeled** — `authorship.created_by` (playroom | community | external) and optional attribution.
- **Nothing copies anyone's wording** — "Why this day matters" and "Activity hint" are our own original copy.
- **Global expansion is trivial** — `country` and optional `subdivisions`; add data, not schema.

## 2. Verification workflow (no scraping, no copying)

1. **Candidate enters** — Source: manual research, community suggestion, or internal idea. `status = experimental`.
2. **Source checking (internal)** — Search multiple independent public sites; confirm date agreement; do NOT copy descriptions; record only that agreement exists in `verification.sources_checked` and set `confidence` / `method`.
3. **Promote to active** — Once verified: `status = active`, `confidence = high`. Item is eligible for calendar.
4. **Ongoing integrity** — Yearly review script flags items not re-verified in 12 months; disputes → downgrade confidence, never delete silently.

## 3. Tagging (what activity directors feel)

- **type** — official | informal | awareness | religious | commercial | community-created.
- **categories** — food, drink, candy, holiday, music, games, wellness, education, family, seniors, community.

These drive filtering, popover chips, and "activity ideas" tone.

## 4. Calendar popover (order)

- **Header** — Date, observance name.
- **Badges** — Community-Created (if authorship), Verified (if high confidence), Country.
- **Why this day matters** — One line, our wording only.
- **Activity hint** — Playroom value-add (ideas for the day).
- **Notes** — User notes; printable; schedule-ready.
- **Footer** — "Search Google", "About this observance" (external links; no copied content).

## 5. Implementation

- **Types:** `frontend/src/types/observance.ts` — full Observance and CalendarObservance (with resolved month/day).
- **Backend:** `lib/observanceSchema.js` — maps raw observances from `holidaysAndObservancesUS.js` to the full schema; API returns rich shape.
- **API:** `GET /api/observances/calendar?year=&month=` returns observances in the new schema.
- **Frontend:** Activity calendar expanded-day panel uses the popover layout with badges, why_matters, activity_hint, and footer links.
