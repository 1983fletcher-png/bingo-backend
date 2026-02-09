# Full Observances Calendar — Pre-Push Checklist

Use this checklist before pushing the expanded observances (March–December + 2026/2027 readiness).

## Scope

- **Months covered:** January (existing), February (expanded earlier), March through December (expanded with cross-referenced observances).
- **Years:** Fixed dates apply to 2026, 2027, and beyond. Nth-weekday and Easter are computed per year.

## Verification

- [ ] **Smoke test passes:** `node scripts/smoke-observances.js` exits 0.
- [ ] **February 27** shows multiple observances (e.g. National Strawberry Day, National Kahlúa Day, Pokémon Day, National Retro Day).
- [ ] **March** has multiple observances on many days (e.g. March 1: Peanut Butter Lover's, Pig Day, Fruit Compote, Minnesota Day; March 3: Anthem, Soup It Forward, Mulled Wine, Cold Cuts, I Want You to Be Happy).
- [ ] **April–December** each have cross-ref comment in code and no duplicate or wrong-day entries.
- [ ] **August 21** has both National Senior Citizens Day and National Spumoni Day (no duplicate day spread).
- [ ] **St. Patrick's Day** appears once (in federal/major block at top of FIXED), not duplicated in March block.
- [ ] **Docs:** `docs/OBSERVANCES-SOURCES-AND-VERIFICATION.md` includes 2026/2027 note.

## Quick API check (optional)

If the backend is running:

```bash
curl -s "http://localhost:3001/api/observances/calendar?year=2026&month=3" | head -c 500
curl -s "http://localhost:3001/api/observances/calendar?year=2027&month=6" | head -c 500
```

Confirm JSON returns `observances` array with multiple entries per day where applicable.

## After checklist

When all items are complete, commit and push (e.g. `feat(observances): full calendar March–Dec, cross-referenced for 2026/2027`).
