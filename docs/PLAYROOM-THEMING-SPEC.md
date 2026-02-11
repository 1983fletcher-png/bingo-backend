# PLAYROOM THEMING v1 — COPY/PASTE SPEC

**Target:** Reskin entire Playroom site + all game views (Display / Player / Host) with a shared design system.  
**Goal:** Premium + elegant + playful (not childish), with selectable skins, scenes, and motion.

---

## 0) KEY DECISIONS LOCKED

- **Default site skin:** Classic (Corporate Smooth)
- **Additional skins:** Prestige Retro, Retro Studio, Retro Arcade
- **Default game skin:** Game Skin = Site Skin; Host can override per game/session (later UI)
- **Background scenes (v1):** Arcade Carpet, Studio, Mountains
- **Motion:** Calm / Standard / Hype; default Standard

---

## 1) ARCHITECTURE

- **Theme Tokens (JSON)** → **CSS Variables (runtime)** → **Components use tokens** → **GameShell** per view
- **GLOBAL:** site theme tokens on `<html>` via CSS variables
- **GAME:** GameShell accepts (skin + scene + motion), same token system
- **VIEW:** Display / Player / Host use same visual language + chrome

---

## 2) THEME TOKEN SCHEMA

See `frontend/src/theme/theme.types.ts`.

**Tokens:** meta (id, name, description, version); colors (bg, surface, surface2, text, muted, border, brand, brand2, success, warning, danger, glow); typography (fontUI, fontDisplay, weightHeading, weightBody, letterSpacingDisplay); radii (sm, md, lg, xl); shadows (sm, md, lg); effects (noiseOpacity, glowStrength, vignetteOpacity, scanlinesOpacity); motion (levelDefault, durationFastMs, durationMedMs, durationSlowMs, easingStandard); componentStyles (panelStyle, buttonStyle, focusRing); gameChromeDefaults (marqueeHeader, stageFrame, scorePanel, tileStyle, answerPlateStyle).

---

## 3) THEME PACKS (4)

`frontend/src/theme/packs/`: classic.json, prestige-retro.json, retro-studio.json, retro-arcade.json.

- **Classic:** glass panel, low noise/glow, no scanlines, lightbar/none stage, bezel tile, flat answer plate.
- **Prestige Retro:** bezel panel, vignette, lightbar, hingeFlip.
- **Retro Studio:** bezel, warm, stage bezel.
- **Retro Arcade:** glass/neon, higher noise/glow/scanlines, neon tile, hingeFlip/rolodexFlip.

---

## 4) THEME ENGINE

- **themeRegistry.ts** — imports packs, exports `Record<ThemeId, ThemeTokens>`.
- **applyTheme.ts** — `applyTheme(tokens, motionOverride)` → sets `--pr-*` CSS vars + `data-pr-theme`, `data-pr-motion`.
- **ThemeProvider.tsx** — localStorage `pr_theme`, context `{ themeId, setThemeId, motionLevel, setMotionLevel }`.
- **useTheme.ts**, **useMotion.ts** — hooks.
- **theme.css** — fallbacks, body styles, gradients/glow, focus ring.

---

## 5) BACKGROUND SCENES

**BackgroundScene.tsx** — sceneId: arcadeCarpet | studio | mountains; intensity; reducedMotion. Procedural/SVG/CSS only (no copyrighted images). Arcade carpet: geometric pattern + noise + vignette. Studio: stage gradient + light beams. Mountains: layered SVG + sky gradient.

---

## 6) GAME SHELL

**GameShell.tsx** — gameKey, viewMode (display|player|host), title, subtitle, themeId, sceneId, motionLevel, headerVariant, footerVariant, slots (headerRight, main, sidebar). Applies theme, renders BackgroundScene + StageFrame + chrome, safe area.

---

## 7) GAME CHROME

`games/shared/chrome/`: MarqueeHeader, StageFrame (none|lightbar|bezel), StatusBar, Tile (flat|bezel|neon), AnswerPlate (flat|hingeFlip|rolodexFlip).

---

## 8) SESSION THEME

**sessionTheme.ts** — SessionThemeSettings: skinMode (match_site | override_theme), themeId, sceneId, motionLevel, contrast, showQR. Defaults per game (Survey=arcadeCarpet, Market=studio, Trivia=mountains).

---

## 9) GLOBAL RESKIN

Wrap app in ThemeProvider. Pages use --pr-bg, --pr-surface, --pr-text; cards/buttons tokenized. Subtle gradients, soft glow, display-font headers, micro-animations (standard/hype).

---

## 10) TODO CHECKLIST

- [x] Theme token types + validation
- [x] Theme packs JSON (4)
- [x] ThemeRegistry + applyTheme + ThemeProvider + persistence
- [x] theme.css + variable mapping
- [x] BackgroundScene (3 scenes)
- [x] GameShell + chrome (MarqueeHeader, StageFrame, StatusBar, Tile, AnswerPlate)
- [ ] Wire GameShell into Survey Showdown, Market Match, Crowd Control display + player
- [x] sessionTheme settings + defaults
- [x] Responsive: Display 16:9, Player mobile (GameShell CSS)
- [x] Motion toggles + prefers-reduced-motion (useMotion, theme.css)
- [x] Theme lab route: /theme-lab (preview theme + scene + motion)

---

## 11) THEME-LAB

Route `/theme-lab`: dropdowns Theme, Scene, Motion; sample card, buttons, marquee, stage frame, tiles, answer plates, GameShell Display + Player mock.

---

*End of Playroom Theming Spec v1*
