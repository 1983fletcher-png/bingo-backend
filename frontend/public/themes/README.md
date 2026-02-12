# Theme assets (Vite public — no 404s)

Files here are served at `/themes/...`. Replace placeholders with real WebP (~300KB each).

**scenes/** — site-wide background (data-scene):
- studio.webp
- mountains.webp
- arcade-carpet.webp

**overlays/** — stage texture (--stage-overlay by data-theme):
- overlay-prestige.webp
- overlay-retro.webp
- overlay-arcade.webp
- **overlay-gameshow.webp** — Survey Showdown Game Show. A placeholder is included so the stage overlay never 404s; replace with your game show stage/floor asset (e.g. from mockups) for the full look. Used at 72% opacity; CSS also provides starry background + gold frame + footlights when theme is game-show.

Referenced in `src/theme/themes.css` as `url("/themes/scenes/...")` and `url("/themes/overlays/...")`.
