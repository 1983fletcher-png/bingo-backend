# Playroom: Scan once — one link for the whole event

## Goal

**One scan, one link, one event.** The host runs a structured show (e.g. four different games or modules). Players join **once** and stay in for the **entire event**. No rescanning between games. When one module ends, they see a waiting screen or a custom welcome/interstitial with what’s next.

---

## How it should work

1. **Host sets up the event**  
   One “event” = one join link. The host may plan multiple modules (e.g. Music Bingo → Trivia → Icebreakers → Music Bingo again) for that event.

2. **Players scan once**  
   Players open the join URL (or scan the QR) **once**. They are tied to that **event** and that **location** for that **session**. One link is good for every module the host runs that day.

3. **Host switches modules**  
   When the host ends one game and starts another (or switches from Music Bingo to Trivia, etc.), players **stay connected**. They don’t leave; they don’t rescan.

4. **Between modules**  
   When a module ends, players see either:
   - The **waiting screen** (QR, “Starting soon,” host message), or  
   - A **custom welcome / interstitial** the host can customize:  
     - Headline (e.g. “Enjoy your break”, “Next up: Trivia”)  
     - Subtext / pertinent info (e.g. “Food menu at the bar”, “We’ll start in 5 minutes”)  
   So players always know what’s going on and what’s next.

5. **Design and structure**  
   - **Don’t overwhelm** — clear, minimal UI; only show what’s needed at each step.  
   - **Wow where it matters** — great waiting room, smooth transitions, venue branding (logo, colors, menu links when we have them).  
   - **Tighten and clean** — one source of truth for event config; host controls welcome headline and subtext; scrape fills in what we can (logo, menu links, social, events) so hosts don’t retype everything.

---

## Implementation direction

- **Persistence:** One join = one **event session** (e.g. one game code or event id). Backend and sockets already support one room; extend so “room” can run multiple modules in sequence without players rejoining.
- **Interstitial:** Use existing **welcome panel** on Display (and player view when we add it) for “between modules” — driven by `welcomeTitle`, `welcomeMessage`, and optional custom image. Host can set these in Event & venue details.
- **Scan-once copy:** Only promise “one link for the whole event” in UI when the behavior is implemented and tested. Until then, use softer copy (e.g. “Join with one tap. You’ll stay in for this event.”) and track “persist join across modules” in the backlog.
- **Scrape and host control:** Scrape venue site for logo, colors, title, description, and when possible menu links, events URL, Facebook/Instagram. Give hosts toggles and fields (welcome headline, subtext, free space vs venue logo, etc.) so they can customize without clutter.

---

## Principle

**Simplicity for event hosts and facilitators.** One link, one scan, clear transitions, and enough customization to make each event feel right — without overwhelming the host or the player.
