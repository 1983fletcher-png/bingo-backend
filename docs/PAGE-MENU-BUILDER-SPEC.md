# Playroom – Page & Menu Builder Specification

## High-Level Goal

Create a simple, elegant, guided page builder that allows venues, organizations, and businesses to quickly generate **branded pages and materials** (menus, promos, info pages) for **screens, phones, print, and social media**—without design or technical stress.

The experience must:

- **Feel calm and obvious**
- **Avoid blank states**
- **Avoid unnecessary loading or page transitions**
- **Update layouts and formats instantly** on the same screen
- **Be usable by the least technical user**, with advanced options hidden but available
- **Create Page – First Screen (Template Families)**

---

## First Screen: Template Families

### Layout

- **Single-screen view** (no scrolling)
- **Large, clean card-based selection**
- Each card includes:
  - **Template Family Name**
  - **Small descriptive text** with real-world examples

### Template Family Cards

| Card | Description |
|------|-------------|
| **Hospitality & Venues** | Bars, restaurants, breweries, food trucks, music venues, hotels |
| **Education & Learning** | Schools, classrooms, libraries, youth programs, workshops |
| **Care & Wellness** | Assisted living, clinics, therapy offices, hospitals |
| **Business & Corporate** | Training, onboarding, internal communication |
| **General Page** | Announcements, flyers, quick pages |

Cards are **clickable** and **immediately route** to contextual sub-options.

---

## Hospitality & Venues – Sub-Options

After selecting **Hospitality & Venues**, present a clean list of **purposes** (not design tools):

| Option | Explanatory sentence (muted) |
|--------|------------------------------|
| **Menu** | Build a food or drink menu for print, TV, or QR. |
| **Daily / Weekly Specials** | Highlight today’s or this week’s specials. |
| **Event Promotion** | Promote an upcoming event or theme night. |
| **Live Music / Featured Performer** | Show who’s playing and when. |
| **Welcome / Information Display** | Hours, WiFi, house rules, contact. |

Each option includes **one short explanatory sentence** in muted text.

---

## Menu Builder – Step-by-Step Flow

### Design Principles

- **One decision type per step**
- **No empty states**
- **Content-first, design-second**
- **Everything starts “already done” and editable**

### Step 1: Menu Type

Options:

- Food  
- Drinks  
- Specials  
- Custom List  

### Step 2: Menu Structure

- **Auto-generate** sensible default sections:
  - Food: Starters, Mains, Sides, Desserts  
  - Drinks: equivalent structure  
- Users can:
  - **Rename** sections  
  - **Reorder** sections  
  - **Add or remove** sections  

### Step 3: Menu Items

- **Line-by-line editing** (list-based, not layout-based)
- Each item supports:
  - **Name**
  - **Description** (optional)
  - **Price** (optional)
- No formatting decisions at this stage.

### Step 4: Style & Theme

- Ask for **feel / mood**, not “design.”
- **Theme options** (examples):
  - Classic & Elegant  
  - Warm & Rustic  
  - Casual & Friendly  
  - Modern & Clean  
  - Outdoor / Local / Coastal  
- Selecting a theme **instantly updates** the preview (fonts, spacing, color, layout). **No reloads. No page transitions.**

### Step 5: Output Format (Instant Toggle)

Users can **instantly switch** between formats on the same builder screen:

- **Print**
- **TV Display** (Landscape)
- **Phone / QR Menu**
- **Social Media**
  - Instagram (square / vertical)
  - Facebook (landscape)

Clicking a format:

- **Instantly** changes aspect ratio  
- **Adjusts layout** automatically  
- **Preserves** content and theme  
- **No loading screens**  

---

## Page Builder UI Layout

### Center

- **Live page preview** (WYSIWYG)
- **Real-time updates** for:
  - Content  
  - Theme  
  - Format  

### Left Panel (Primary Controls)

- Title  
- Subtitle  
- Sections / items  
- Dates / times (when relevant)  
- Image upload (optional)  
- Call-to-action (QR, join link, etc.)  

### Advanced Settings (Hidden)

- Accessible via a small **“Advanced”** toggle:
  - Font selection (from brand kit)  
  - Spacing adjustments  
  - Animation on/off  
  - Logo sizing  
- **Advanced options never block** basic usage.

---

## Branding & Data Integration

- **Brand kit** (logo, colors, fonts) **auto-applied** when available  
- **Website scraping or uploads** can pre-fill:
  - Menu items  
  - Specials  
  - Venue information  
- Users can **override anything** manually  

---

## Core UX & Psychology Principles

- **No blank canvases**  
- **No design jargon**  
- **Vertical, predictable eye flow**  
- **Calm language and spacing**  
- **Every screen answers:** “What do I do next?”  
- **Every result looks good by default**  

### Non-Goals

- No freeform layout editor  
- No pixel-level positioning  
- No overwhelming customization  
- No multi-page workflows at launch  

---

## Outcome

Users should be able to:

1. **Create** a menu, promo, or info page **in minutes**  
2. **Instantly preview** it for different formats  
3. **Feel confident**, not creative pressure  
4. **Say:** “Oh—this is easy.”  

---

## Implementation Phases

### Phase 1 – Create flow entry (Done in scaffold)

- [x] Route `/create` – Template family selection (single screen, 5 cards)  
- [x] Route `/create/hospitality` – Hospitality sub-options (Menu, Specials, Event, Live Music, Welcome)  
- [ ] Link from Home or GlobalNav: “Create page” / “Page builder”  

### Phase 2 – Menu builder core ✅

- [x] Route `/create/hospitality/menu` (or `/create/menu`)  
- [x] Step 1–5: type, sections, items, theme, format; live preview; no reload

### Phase 3 – Other purposes & families

- [ ] Daily/Weekly Specials builder  
- [ ] Event Promotion builder  
- [ ] Live Music / Featured Performer builder  
- [ ] Welcome / Information Display builder  
- [ ] Education, Care, Business, General template sub-flows (similar pattern)  

### Phase 4 – Branding & integration

- [ ] Brand kit (logo, colors, fonts) from Host/venue profile or scrape  
- [ ] Pre-fill from scrape or upload where applicable  
- [ ] Advanced panel (fonts, spacing, animation, logo size)  

### Phase 5 – Export & output

- [ ] Print: PDF or print stylesheet  
- [ ] TV: landscape layout + optional QR  
- [ ] Phone/QR: single-page menu URL  
- [ ] Social: square/vertical and landscape image export  

---

## File / Route Map (Frontend)

| Path | Purpose |
|------|--------|
| `/create` | Template family cards |
| `/create/hospitality` | Hospitality purposes (Menu, Specials, etc.) |
| `/create/hospitality/menu` | Menu builder (steps 1–5) |
| `/create/education` | (Phase 3) Education sub-options |
| `/create/care` | (Phase 3) Care & Wellness sub-options |
| `/create/business` | (Phase 3) Business sub-options |
| `/create/general` | (Phase 3) General page sub-options |

Backend: optional API for saving/loading page designs, PDF generation, or image export (Phase 4–5).
