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

Referenced in `src/theme/themes.css` as `url("/themes/scenes/...")` and `url("/themes/overlays/...")`.
