# Observances: Sources and Verification

This document describes how we keep the Activity Calendar **full**, **accurate**, and **trustworthy**. Every date should show multiple observances where they exist; every observance must be cross-referenced before it is added.

## Goal

- **Full and complete**: Each calendar day should list *all* widely recognized national days, food/drink days, and fun observances for that date—not just one. Example: February 27 should show National Strawberry Day, National Kahlúa Day, Pokémon Day, National Retro Day, etc.
- **Trustworthy**: Only add observances that are **real and true to the date**, confirmed by multiple sources or by an authoritative registrar.
- **Cross-referenced**: We do not rely on a single site. When possible, a date is verified against at least two independent sources before being added to `lib/holidaysAndObservancesUS.js`.

## Trusted Sources (primary)

We use these to **discover** and **verify** observances. Listing here does not imply endorsement; we use them for date accuracy only.

| Source | Use | Notes |
|--------|-----|------|
| **National Day Calendar** (nationaldaycalendar.com) | Primary US national days; many food/drink and fun days are registered here. | Widely cited; many “National X Day” dates originate or are listed here. |
| **National Today** (nationaltoday.com) | Cross-reference; daily lists (e.g. “What is February 27th?”). | Good for confirming multiple observances per day. |
| **Time and Date** (timeanddate.com) | Federal holidays, international observances. | Strong for official/holiday accuracy. |
| **There Is A Day For That** (thereisadayforthat.com) | Calendar view by month; cross-check. | Useful for “who else lists this date?” |
| **Punchbowl / Holiday Insights** | Additional cross-reference for popular days. | Often align with NDC / National Today. |

## Verification rules

1. **Fixed dates**  
   - For a given month + day (e.g. February 27), we only add an observance if:
     - It appears on **National Day Calendar** or **National Today**, or  
     - It appears on **two or more** of the other trusted sources with the **same date**.

2. **Nth-weekday and moving dates**  
   - Federal and cultural moving holidays (e.g. Thanksgiving, MLK Day) are taken from official or widely used rules (US federal, NDC, or Time and Date).  
   - Easter is kept in a small lookup table (see `EASTER_APPROX` in code) and updated as needed for 2026+.

3. **Naming**  
   - Prefer the name used by National Day Calendar or National Today when consistent (e.g. “National Kahlúa Day” not “Kahlua Day”).  
   - Keep names concise for the calendar tile and list.

4. **Categories**  
   - We tag each observance with one of: `federal | cultural | food | music | fun | fan_culture`.  
   - Use the category that best fits how event hosts will use it (e.g. National Kahlúa Day → `food`).

5. **No single-source-only**  
   - Avoid adding observances that appear on only one obscure site with no second confirmation.

## How we add observances

- **Code**: All fixed-date observances live in the `FIXED` array in `lib/holidaysAndObservancesUS.js`. Each entry has `name`, `month`, `day`, and `category`.  
- **Process**:  
  1. Identify a gap (e.g. “Feb 27 only shows National Strawberry Day”).  
  2. Look up that date on National Day Calendar and National Today (and optionally one more source).  
  3. Add every observance that meets the verification rules above.  
  4. Run the existing smoke test: `node scripts/smoke-observances.js`.

## Example: February 27

- **Before**: Only “National Strawberry Day” (one observance).  
- **Sources**:  
  - National Day Calendar: National Strawberry Day, Pokémon Day (Feb 27), National Retro Day (Feb 27).  
  - National Today: National Kahlúa Day (Feb 27), International Polar Bear Day, International Stand Up to Bullying Day, The Big Breakfast Day.  
- **Added**: National Kahlúa Day, Pokémon Day, National Retro Day (all confirmed on NDC and/or National Today for Feb 27). Others (e.g. International Polar Bear Day) can be added in a later pass if we choose to include international observances more broadly.

## Maintaining the list

- **New observances**: Prefer adding in small batches by month or week, with a quick note in a PR or commit (e.g. “Feb 27: add Kahlúa, Pokémon, Retro per NDC + National Today”).  
- **Conflicts**: If two sources disagree on a date, do not add until resolved (or omit).  
- **Leap year**: Feb 29 observances (e.g. National Time Refund Day) are only included when we support leap-year logic so they appear only in leap years.

## 2026 and 2027

All **fixed-date** observances (month + day) in `FIXED` apply to every year, including 2026 and 2027. Moving observances (e.g. Thanksgiving, Mother's Day, Easter) are computed per year via `NTH_WEEKDAY` and `EASTER_APPROX`. The calendar is therefore full and consistent for 2026, 2027, and beyond.

## Notable people (celebrity births/deaths, musicians)

To include **notable celebrity births or deaths, musicians, and similar “people” observances**: add them as normal observances in the backend (e.g. `lib/holidaysAndObservancesUS.js` or the observances API) with the correct `month` and `day`. The Activity Calendar frontend will display them automatically in the grid and in “This month’s observances.” Use an appropriate category (e.g. `music` for musicians, or extend categories with something like `people` / `culture` if desired). Verify birth/death dates against a reliable source (e.g. Wikipedia, official bios) before adding.

## Related docs

- `lib/holidaysAndObservancesUS.js` — source of truth for observances.  
- `docs/CALENDAR-TRUST-AND-ACCURACY.md` — if present, may contain older notes.  
- Activity Calendar UI: `frontend/src/pages/ActivityCalendar.tsx` — shows “primary” + “+N more” and expanded panel with all observances for the day.
