# Trivia — Still To Do, Not Implemented, or Needs Confirmation

This doc lists what was **not completed**, **still needs implementation**, or **needs confirmation** after the full backlog pass. Use it to prioritize remaining work.

---

## Implemented (reference)

The following were previously listed as "still needs implementation" and are now **done**:

- **Final wager — player UI:** Room PlayerPanel and code-based Play TriviaPlayerView have wager input on last question when `finalWagerEnabled`; submit includes `wager` in payload.
- **Short-answer in Room PlayerPanel:** When question has no MC options, PlayerPanel shows text input and "Submit answer"; emits `room:submit-response` with `payload: { text }` (and optional `wager` on last question).
- **Duplicate display names — suffix:** Backend `uniqueDisplayName()` in roomStore adds " (2)", " (3)" etc.; Room snapshot handler persists server-assigned displayName.
- **Auto-advance behavior:** HostPanel TimerPill has `onExpire` that emits `room:host-set-state` REVEAL when `autoAdvanceEnabled` and socket connected.
- **MC tips display:** Room HostPanel and DisplayPanel show MC tip when `mcTipsEnabled` and `currentQuestion.hostNotes?.mcTip`; code-based Host and Display show MC tip when setting enabled and question has mcTip.
- **File map:** HostPanel, PlayerPanel, DisplayPanel live in `frontend/src/components/trivia-room/`; Room.tsx imports and uses them.

**Room flow as primary:** HostCreateTrivia now uses `room:host-create` and redirects to `/room/:roomId?role=host` (Room page). No longer code-based game + `/host` for Trivia Room.

---

## Needs confirmation (manual testing)

These are implemented in code but should be **confirmed** by running through the flows once.

### Acceptance checklist (TRIVIA-ROOM-IMPLEMENTATION.md)

- [ ] **Create Trivia → host room created.**  
  Confirm: HostCreateTrivia → pick "Weekly Bar Trivia – Classic" → preview → options → Start Hosting → **redirects to `/room/:roomId?role=host`** and room is created; host sees HostPanel.

- [ ] **Player joins via QR, chooses anonymous name; name persists after refresh.**  
  Confirm: Join via QR (or join URL), choose anonymous, get funny name; refresh; same name and role.

- [ ] **Host sees player count update live.**  
  Confirm: Second device joins; host sees count (and, for Room flow, responses count) update.

- [ ] **READY_CHECK: Start/Begin button enabled and works.**  
  Confirm: Room flow WAITING_ROOM → Start ready check → READY_CHECK → Begin round → ACTIVE_ROUND.

- [ ] **ACTIVE_ROUND: display shows question + answers as big cards; players see answer cards and can lock.**  
  Confirm: Display shows question + MC grid; player can tap option, tap again to lock.

- [ ] **REVEAL: correct answer shows; scoring updates; leaderboard can show on player and display.**  
  Confirm: After reveal, correct answer visible; scores/leaderboard update when leaderboard is enabled.

- [ ] **Toggle leaderboards off mid-game: players/display hide leaderboard instantly.**  
  Confirm: Host toggles off "Leaderboard to players" / "Leaderboard on display"; player and display lose leaderboard/scores view.

- [ ] **Dispute: host accepts variant; variant saved into question acceptedVariants.**  
  Confirm: In REVEAL, host uses "Accept variant" with text; that text is then accepted as correct for grading (e.g. short-answer).

- [ ] **Refresh host mid-game: host returns to same room state, controls work, no stuck loading.**  
  Confirm: Room host refreshes during ACTIVE_ROUND or REVEAL; rejoin with hostToken; room:snapshot restores state; Reveal/Next still work.

- [ ] **Display-only pack: runs automatically question→answer loop, no player join required.**  
  Confirm: Open `/display-only/weekly-bar-classic` (or another pack id); questions advance automatically after timer and reveal delay.

---

## Optional / future (not required for "done")

- **Extended packs:** Replace stub packs (e.g. Quick Happy Hour, Theme Night) with full question sets.
- **Integration/E2E tests:** Automated tests for full host/player/display flows (not just `npm run test:room` unit tests).

---

## Summary

| Item | Status |
|------|--------|
| Final wager player UI | **Done** |
| Short-answer input in Room PlayerPanel | **Done** |
| Duplicate names get suffix | **Done** |
| Auto-advance behavior | **Done** |
| MC tips display | **Done** |
| File map (HostPanel/PlayerPanel/DisplayPanel location) | **Done** |
| Room flow as primary (HostCreateTrivia → Room) | **Done** |
| All acceptance checklist items | **Needs confirmation** (manual test) |
