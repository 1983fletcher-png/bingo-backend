# Permission flag: venue allowed use of menu design (Phase B)

When a venue (or host) explicitly says they allow us to use their menu design (e.g. “our IT has the images, feel free to screenshot and use them”), we record that so the app can offer “use this image as the menu” in addition to re-rendering in our themes.

## Backend

**Where it’s stored:** In the game’s **eventConfig** (and/or in a saved venue profile when we have one). The backend does not strip or validate keys in `eventConfig`; it stores whatever the host sends.

**Recommended field name:** `venueAllowedUseOfMenuDesign: true` (boolean). When present and true, the frontend may show the venue’s uploaded menu image as the menu (in addition to or instead of re-rendering in our layout).

**How it gets set:**

- **host:create** — optional in `eventConfig`: `{ gameTitle, venueName, accentColor, logoUrl, venueAllowedUseOfMenuDesign, ... }`
- **host:set-event-config** — host can send `eventConfig` that includes `venueAllowedUseOfMenuDesign: true`

**Payloads that include eventConfig:** `game:created`, `game:event-config-updated`, `join:ok`, `display:ok`. So players and display can know whether the venue has granted permission (e.g. to show “their” menu image).

## Frontend (music-bingo-app / Host UI)

- When building or displaying a menu, if `eventConfig.venueAllowedUseOfMenuDesign === true` and the user has uploaded a menu image, offer the option to “Use venue’s menu image” (display their asset) as well as “Use our theme” (re-render in our design).
- Do not show or imply permission when the flag is false or missing.

## Summary

- **Backend:** Already accepts and persists any `eventConfig`; no code change required. Use the field `venueAllowedUseOfMenuDesign` when the venue has given permission.
- **Frontend:** Check this flag before offering “use venue’s image as menu.”
