# Home Page — Premium Design Final Checklist

Use this checklist before pushing. Cross off each item only after you’ve verified it (or implemented it). When every box is checked, you can push with confidence.

**Note:** The live home page has since been simplified (welcome + tagline + “designed for” in the toolbar; no card icons; Design tabs then Print; no Pick→Share→Run section; no Game types / Who pill grid). This checklist remains for script-parity verification if you restore or compare against the original script.

---

## 1. From the original script — implemented or not

| # | Item | Status | Notes |
|---|------|--------|------|
| 1.1 | **Atmospheric background** (gradient + orb + dot grid) | ☐ Done | Fixed layer behind content in `home.css`. |
| 1.2 | **Header: logo block + “The Playroom”** | ☐ Done | `.landing__header-brand`, `.landing__header-logo`, `.landing__header-name`. |
| 1.3 | **Header nav: “Docs” link** | ☐ Omitted by design | No `/docs` route; omitted until route exists. See §5. |
| 1.4 | **Header nav: “Sign in” link** | ☐ Omitted by design | No `/signin` route; omitted until route exists. See §5. |
| 1.5 | **Hero: “The Playroom” title** | ☐ Done | `landing__hero-title`. |
| 1.6 | **Hero: main tagline** (“Simple, shared experiences…”) | ☐ Done | `landing__hero-tagline`. |
| 1.7 | **Hero: sub copy** (“Plan faster with curated…”) | ☐ Done | `landing__hero-sub`. |
| 1.8 | **Four hero cards** (Host, Polling, Calendar, Studio) | ☐ Done | HERO_CARDS → HeroCard, correct titles/eyebrows/descriptions. |
| 1.9 | **Card: spotlight hover effect** (radial gradient follows mouse) | ☐ Done | `useSpotlight()` + `.landing__hero-card-spotlight-inner`. |
| 1.10 | **Card: accent icon** (violet/cyan/amber/emerald) | ☐ Done | `AccentIcon` + `.landing__accent-icon--*`. |
| 1.11 | **Card: eyebrow, title, description, CTA, arrow** | ☐ Done | All present; arrow animates on hover. |
| 1.12 | **Card: accent glow on hover** (soft gradient wash) | ☐ Done | `.landing__hero-card-glow` with `data-accent`. |
| 1.13 | **Card: accent border on hover** | ☐ Done | `.landing__hero-card--violet:hover` etc. |
| 1.14 | **Card: bottom highlight line on hover** | ☐ Done | `.landing__hero-card-bottom-line`. |
| 1.15 | **Card links** (Host → `/host`, Poll → `/poll/start`, Calendar → `/calendar`, Studio → `/create`) | ☐ Done | Matches App routes. |
| 1.16 | **Reassurance line** (“Designed for venues…”) | ☐ Done | `.landing__reassurance`. |
| 1.17 | **Reassurance sub** (“Digital when you want it…”) | ☐ Done | `.landing__reassurance-sub`. |
| 1.18 | **“Pick → Share → Run” section** | ☐ Done | Title, description, muted span. |
| 1.19 | **Three steps** (Pick, Share, Run it) | ☐ Done | `Step` component, 3-col on desktop, stacked on mobile. |

---

## 2. Existing Home content (kept below hero)

| # | Item | Status | Notes |
|---|------|--------|------|
| 2.1 | **How it works** (Create / Share / Play) | ☐ Done | Numbered list, same content. |
| 2.2 | **Who it’s for** (grid of audiences) | ☐ Done | WHO_ITS_FOR, `.landing__who-grid`. |
| 2.3 | **Game types** (Music Bingo, Trivia, etc.) | ☐ Done | GAME_TYPES, dual-link card for Trivia. |
| 2.4 | **Our approach** (values + spirit line) | ☐ Done | `.landing__values`. |
| 2.5 | **Footer** (The Playroom + Created by Jason Fletcher) | ☐ Done | `.landing__footer`. |

---

## 3. Visual and UX checks

| # | Item | Status | Notes |
|---|------|--------|------|
| 3.1 | **Dark theme**: Hero, cards, and sections look correct (no broken contrast) | ☐ Verified | Uses design-system `--bg` / `--text` and rgba overlays. |
| 3.2 | **Light theme**: Hero and cards readable (we have overrides in `home.css`) | ☐ Verified | `[data-theme="light"]` overrides for text and surfaces. |
| 3.3 | **Responsive**: Hero cards 2 columns desktop, 1 column small screen | ☐ Verified | `.landing__hero-cards--grid` + media query. |
| 3.4 | **Responsive**: Pick/Share/Run steps 3 columns desktop, stacked mobile | ☐ Verified | Grid + media query. |
| 3.5 | **Focus**: Card and nav links have visible focus (design-system `:focus-visible`) | ☐ Verified | Global in `design-system.css`. |
| 3.6 | **Safe area**: Header and main respect `env(safe-area-inset-*)` | ☐ Verified | Padding in `.landing__header` and `.landing__main`. |

---

## 4. Optional / polish (do if you want before push)

| # | Item | Status | Notes |
|---|------|--------|------|
| 4.1 | **Header logo**: Make brand (logo + name) a link to `/` | ☐ Optional | Improves UX; script didn’t specify. |
| 4.2 | **Docs / Sign in**: Add nav links (with `/docs` and `/signin` or placeholders) | ☐ Optional | Only if you want parity with script; routes don’t exist yet. |
| 4.3 | **Reduced motion**: Fade or disable spotlight when `prefers-reduced-motion: reduce` | ☐ Optional | Good a11y; script didn’t include it. |

---

## 5. Pre-push summary

- **1.3 & 1.4 (Docs / Sign in):** Header nav: Docs and Sign in **omitted by design** until those routes exist. No placeholder links in the current welcome toolbar.
- **Everything else:** Verify each “Done” / “Verified” item in the table by actually loading the home page and toggling theme and viewport.

When every row you care about is checked, you’re good to commit and push.
