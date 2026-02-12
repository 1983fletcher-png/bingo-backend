# Creative Room Section — Direct Code & Full Wiring

This doc gives **direct, complete code** for the Creative Studio / “creative room” section on the Playroom and the **exact wiring** (route → component → data in/out → backend) so you can see why “certain things are not getting through.”

---

## Part 1: Entry on the Playroom (Home)

The “creative room” section on the Playroom is the **Creative Studio** hero card on the home page.

**File:** `frontend/src/pages/Home.tsx`

**Exact code for the card (lines 114–120):**

```tsx
  {
    title: 'Creative Studio',
    description: 'Build training pages, flyers, menus, promos, and printables.',
    cta: 'Create',
    href: '/create',
    accent: 'emerald',
  },
```

**Rendering:** The card is rendered inside `Home` via:

```tsx
// In the same file, inside <main>:
<section className="landing__hero-cards-wrap">
  <div className="landing__hero-cards landing__hero-cards--grid">
    {HERO_CARDS.map((c) => (
      <HeroCard key={c.title} card={c} />
    ))}
  </div>
</section>
```

**HeroCard** is a `Link` to `card.href`, so clicking “Create” goes to **`/create`**.

**Wiring out from Home:**
- User clicks Creative Studio card → **navigate to `/create`** (React Router).
- No API, no socket, no props from parent — only the link.

---

## Part 2: Route → Component Map (Creative Room Tree)

| URL | Component | File |
|-----|-----------|------|
| `/` | Home | `frontend/src/pages/Home.tsx` |
| `/create` | **CreativeStudio** | `frontend/src/pages/CreativeStudio.tsx` |
| `/create/templates` | Create | `frontend/src/pages/Create.tsx` |
| `/create/hospitality` | CreateHospitality | `frontend/src/pages/CreateHospitality.tsx` |
| `/create/hospitality/menu` | CreateMenuBuilder | `frontend/src/pages/CreateMenuBuilder.tsx` |
| `/create/hospitality/specials` | CreateMenuBuilder | same |
| `/create/hospitality/event` | CreateEventBuilder | `frontend/src/pages/CreateEventBuilder.tsx` |
| `/create/hospitality/live-music` | CreateLiveMusicBuilder | `frontend/src/pages/CreateLiveMusicBuilder.tsx` |
| `/create/hospitality/welcome` | CreateWelcomeBuilder | `frontend/src/pages/CreateWelcomeBuilder.tsx` |
| `/create/education` | CreatePlaceholder | `frontend/src/pages/CreatePlaceholder.tsx` |
| `/create/care` | CreatePlaceholder | same |
| `/create/business` | CreatePlaceholder | same |
| `/create/general` | CreatePlaceholder | same |
| `/view/:slug` | ViewPage | `frontend/src/pages/ViewPage.tsx` (loads saved page-builder doc by slug) |

All of the above routes are defined in **`frontend/src/App.tsx`** (see Routes around lines 48–89).

---

## Part 3: Direct Code — Creative Studio Page (`/create`)

**File:** `frontend/src/pages/CreativeStudio.tsx`

Full path: `frontend/src/pages/CreativeStudio.tsx`. Dependencies:
- `frontend/src/lib/creativeStudioExport.ts` (exportPdf, exportWeb, exportSocial, exportQrDataUrl, StudioMode)
- `frontend/src/styles/CreativeStudio.css`

**Data flow (no backend):**
- **IN:** `localStorage.getItem('creativeStudioAutoSaveRaw')` → initial `rawInput` (or default sample text).
- **OUT:** 
  - `localStorage.setItem('creativeStudioAutoSaveRaw', rawInput)` on every `rawInput` change.
  - Export: in-memory only — `exportPdf` / `exportWeb` / `exportSocial` open or download; `exportQrDataUrl` uses `qrcode` lib in browser. **No fetch, no socket.**

**Links out:**
- “← Back to Playroom” → `Link to="/"` (Home).
- “Browse template families…” → `Link to="/create/templates"` (Create.tsx).

**Complete source:** The file is 453 lines. Key structure:
- State: `rawInput`, `mode` (MENU | TRAINING_STUDY | TRAINING_TEST | TRIVIA), `qrUrl`, `qrDataUrl`, `isEditing`, `editDoc`.
- Parsed doc: `parseToDoc(rawInput)` → `StudioDoc` (blocks: title, subtitle, section with items/meta).
- UI: textarea (paste) → mode toggles → preview (by mode) → export buttons + QR.

---

## Part 4: Wiring — Line by Line

### 4.1 From Playroom to Creative Studio

```
User on Home (/) 
  → clicks Creative Studio card (HERO_CARDS[3].href === '/create')
  → React Router matches <Route path="/create" element={<CreativeStudio />} />
  → CreativeStudio mounts
  → reads localStorage key 'creativeStudioAutoSaveRaw' (or DEFAULT_CONTENT)
  → no backend call
```

### 4.2 From Creative Studio to Templates

```
CreativeStudio 
  → link "Browse template families…" to="/create/templates"
  → Route path="/create/templates" element={<Create />}
  → Create.tsx mounts (template family cards only; no API)
  → links to /create/hospitality, /create/education, etc.
```

### 4.3 From Templates to Menu Builder (Hospitality → Menu)

```
Create 
  → link to /create/hospitality
  → CreateHospitality mounts
  → link "Menu" to /create/hospitality/menu
  → CreateMenuBuilder mounts
```

### 4.4 CreateMenuBuilder — Where the Backend Is

**File:** `frontend/src/pages/CreateMenuBuilder.tsx`

**Data IN:**
1. **URL / Router:** `useSearchParams()`, `useLocation()`. `type` from query or path (`/specials` → specials).
2. **Observances API (on mount):**
   - URL: `GET ${apiBase}/api/observances/upcoming?from=YYYY-MM-DD&days=30`
   - `apiBase = normalizeBackendUrl(VITE_SOCKET_URL || VITE_API_URL || '')`
   - If `apiBase` is empty, the fetch is skipped (no request).
   - Response: `{ observances?: Array<{ name, month, day, category?, themeId? }> }` — used for “Suggested by date” theme suggestions.
3. **Local storage:** `getSavedMenuDesigns()` from `frontend/src/lib/savedMenuDesigns.ts` (key `playroom.savedMenuDesigns`). Load/save design is local only.

**Data OUT:**
1. **Share link (the one that can “not get through”):**
   - Trigger: user clicks “Get share link” (or equivalent).
   - URL: `POST ${apiBase}/api/page-builder/save`
   - Body: `JSON.stringify({ document: state })` — `state` is full `MenuBuilderState` (sections, theme, format, brand, etc.).
   - Backend (index.js): in-memory `pageBuilderDocs.set(slug, { document, createdAt })`; responds `{ slug }`.
   - Frontend: builds share URL as `window.location.origin + '/view/' + slug` (e.g. `https://yoursite.com/view/abc123xyz`).
   - **If “things don’t get through”:** Either `apiBase` is empty (VITE_SOCKET_URL / VITE_API_URL not set or wrong), or the backend is different origin and CORS/network fails, or the backend is not running. Then `fetchJson` returns `ok: false` and the UI shows an error (e.g. “Backend URL not set…” or “Failed to save”).

2. **Viewing a shared link:**
   - User opens `https://yoursite.com/view/abc123xyz` → Route `path="/view/:slug"` → `ViewPage`.
   - ViewPage must fetch: `GET ${apiBase}/api/page-builder/${slug}`.
   - Backend: `pageBuilderDocs.get(slug)` → returns `entry.document` or 404.
   - **If frontend and backend are on different origins:** ViewPage must use the same `apiBase` (backend URL) for this GET; if ViewPage is on Netlify and backend on Railway, `apiBase` must point to Railway.

### 4.5 Backend Endpoints Used by the Creative Room / Menu Builder

| Method | Path | Handler (index.js) | Purpose |
|--------|------|--------------------|---------|
| GET | `/api/observances/upcoming?from=&days=` | ~line 520 | Observances for “Suggested by date” in Menu Builder |
| POST | `/api/page-builder/save` | ~line 599 | Save menu doc; returns `{ slug }` (in-memory) |
| GET | `/api/page-builder/:slug` | ~line 608 | Load saved doc for `/view/:slug` |

**Important:** `pageBuilderDocs` is an in-memory `Map`. Restarting the server wipes saved slugs; nothing is persisted to DB unless you add that.

### 4.6 Environment / API Base

- **Frontend** (CreateMenuBuilder, or any component that calls the backend):
  - `apiBase = normalizeBackendUrl(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '')`
  - Defined in: `frontend/src/lib/safeFetch.ts` (`normalizeBackendUrl`) and used in CreateMenuBuilder.
- If both env vars are empty (e.g. in dev with no `.env`), `apiBase` is `''` and:
  - Observances fetch is skipped.
  - Share (POST save) will set `shareError` to “Backend URL not set…”.

---

## Part 5: Interconnectivity Summary (What Talks to What)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PLAYROOM HOME (/)                                                          │
│  Home.tsx  →  Creative Studio card  →  /create  (React Router)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CREATIVE STUDIO (/create)                                                   │
│  CreativeStudio.tsx                                                         │
│  • IN:  localStorage 'creativeStudioAutoSaveRaw'                            │
│  • OUT: localStorage (auto-save), Export (PDF/Web/Social/QR) — all client   │
│  • LINK: /create/templates                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TEMPLATES (/create/templates)  →  Create.tsx                                │
│  • LINK: /create/hospitality, /create/education, ...                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  HOSPITALITY (/create/hospitality)  →  CreateHospitality.tsx                │
│  • LINK: /create/hospitality/menu, /specials, /event, /live-music, /welcome  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  MENU BUILDER (/create/hospitality/menu or /specials)  →  CreateMenuBuilder  │
│  • IN:  GET /api/observances/upcoming (apiBase from VITE_SOCKET_URL/VITE_   │
│         API_URL), getSavedMenuDesigns() from localStorage                   │
│  • OUT: POST /api/page-builder/save  body: { document: state }  →  { slug }  │
│  • Share URL = origin + '/view/' + slug                                      │
│  • LINK: /view/:slug  is served by ViewPage → GET /api/page-builder/:slug    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  VIEW PAGE (/view/:slug)  →  ViewPage.tsx                                   │
│  • IN:  GET ${apiBase}/api/page-builder/${slug}  →  document                 │
│  • If apiBase wrong or backend down → “not getting through”                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: What Often “Doesn’t Get Through” and Where to Check

1. **Share link (Menu Builder)**  
   - **Symptom:** “Backend URL not set” or “Failed to save”.  
   - **Check:** `VITE_SOCKET_URL` or `VITE_API_URL` in frontend build (e.g. `.env` or Netlify env) must be the backend root (e.g. `https://your-app.up.railway.app`).  
   - **Check:** Backend is running and `POST /api/page-builder/save` returns 200 and `{ slug }`.

2. **Opening a share link (`/view/xyz`)**  
   - **Symptom:** Blank page or “Not found”.  
   - **Check:** ViewPage uses the same backend URL for `GET /api/page-builder/:slug`.  
   - **Check:** Slug was created on the same backend (in-memory store is per process; deploy restarts clear it).

3. **Observances / “Suggested by date”**  
   - **Symptom:** No suggested themes.  
   - **Check:** `GET /api/observances/upcoming` is called only when `apiBase` is set.  
   - **Check:** Backend implements that route and returns `{ observances: [...] }` with `themeId` where needed.

4. **Creative Studio paste/export**  
   - No backend involved. If export or paste fails, the cause is in the browser (localStorage, pop-ups, or `creativeStudioExport.ts`).

---

## Part 7: File Reference (Copy-Paste Paths)

| Purpose | File |
|--------|------|
| Home hero card (Creative Studio entry) | `frontend/src/pages/Home.tsx` (HERO_CARDS, HeroCard) |
| Creative Studio main page | `frontend/src/pages/CreativeStudio.tsx` |
| Creative Studio export (PDF/Web/Social/QR) | `frontend/src/lib/creativeStudioExport.ts` |
| Creative Studio styles | `frontend/src/styles/CreativeStudio.css` |
| Template family list | `frontend/src/pages/Create.tsx` |
| Hospitality sub-options | `frontend/src/pages/CreateHospitality.tsx` |
| Menu Builder (scraper, share, observances) | `frontend/src/pages/CreateMenuBuilder.tsx` |
| Backend URL helper + fetch | `frontend/src/lib/safeFetch.ts` |
| Saved designs (local) | `frontend/src/lib/savedMenuDesigns.ts` |
| View shared page | `frontend/src/pages/ViewPage.tsx` |
| Routes | `frontend/src/App.tsx` |
| Observances API | `index.js` app.get('/api/observances/upcoming', …) |
| Page-builder save/load | `index.js` app.post('/api/page-builder/save', …), app.get('/api/page-builder/:slug', …) |

Use this for tracing any "creative room" flow from Playroom → Creative Studio → Templates → Menu Builder → Share/View and for debugging why something is not getting through (env, API base, or backend route).

---

## Appendix A: Full CreativeStudio.tsx (direct copy)

Path: `frontend/src/pages/CreativeStudio.tsx`. This is the complete file so you have the exact code in one place.

<details>
<summary>Click to expand: full CreativeStudio.tsx source (453 lines)</summary>

```tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportPdf, exportWeb, exportSocial, exportQrDataUrl, type StudioMode } from '../lib/creativeStudioExport';
import '../styles/CreativeStudio.css';

type SectionKind = 'items' | 'meta';

type Item = {
  id: string;
  name: string;
  description: string;
  price?: string;
  tags: string[];
};

type Block =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | {
      type: 'section';
      id: string;
      title: string;
      kind: SectionKind;
      tags: string[];
      items: Item[];
      metaLines: string[];
    };

type StudioDoc = {
  kind: 'menu_doc' | 'generic_doc';
  blocks: Block[];
};

type TriviaQ = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  sectionTitle?: string;
};

const AUTO_SAVE_KEY = 'creativeStudioAutoSaveRaw';

const DEFAULT_CONTENT = `Parkway Pizzas
Food Truck Hours
Monday–Thursday 11:30am–9:00pm
Friday 11:30am–11:00pm
Sunday 11:30am–8:00pm

Section: Pizzas
Balsam Cove Chicken BBQ Pizza - White sauce, white cheddar, grilled & diced chicken, bacon, red & green onions, tomatoes, swirled with sweet & tangy BBQ - $19
Thunderhead Mountain Meats Pizza - Tomato sauce, five cheese blend, pepperoni, salami, ham, and sausage - $21
Chestnut Mountain Cheese Pizza - Tomato sauce, our house blend of five cheeses - $17

Section: Kids
Kids Grilled Cheese - American on white bread - $10
Kids Corn Dog - Classic corn dog with side - $10
`;

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}
function cleanWhitespace(s: string) { return s.replace(/\s+/g, ' ').trim(); }
function isNoise(line: string) {
  const t = line.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^©/.test(t)) return true;
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 6 && digits >= t.length * 0.6) return true;
  if (/^\d{5}(-\d{4})?$/.test(t)) return true;
  return false;
}
function looksLikeMetaSectionTitle(title: string) {
  const l = title.toLowerCase();
  return l.includes('hours') || l.includes('open') || l.includes('wifi') || l.includes('address') || l.includes('location') || l.includes('contact') || l.includes('parking') || l.includes('rules');
}
function normalizeSectionTitle(line: string) {
  let s = line.trim();
  s = s.replace(/^#+\s*/, '').replace(/^section:\s*/i, '').replace(/^menu:\s*/i, '');
  return cleanWhitespace(s);
}
function isSectionHeader(line: string) {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,3}\s+/.test(t)) return true;
  if (/^section:\s*/i.test(t)) return true;
  if (t.length <= 36 && /^[A-Za-z0-9&/()' -]+$/.test(t) && !/\d/.test(t)) return true;
  return false;
}
function stripPriceFromTail(text: string): { desc: string; price?: string } {
  const t = text.trim();
  if (!t) return { desc: '' };
  if (/\b(market price|mp)\b/i.test(t)) return { desc: cleanWhitespace(t.replace(/\b(market price|mp)\b/gi, '')), price: 'MP' };
  const m = t.match(/\s*[-–—]?\s*([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (!m) return { desc: t };
  const raw = m[1].replace(/\s/g, '');
  const currency = raw.startsWith('€') ? '€' : '$';
  const num = raw.replace(/[^0-9.]/g, '');
  const normalized = `${currency}${/\.\d{1,2}$/.test(num) ? num : `${num}.00`}`;
  return { desc: t.slice(0, t.length - m[0].length).trim(), price: normalized };
}
function parseItemLine(line: string): { name: string; description: string; price?: string } | null {
  const t = line.trim();
  if (!t || t.length < 3) return null;
  const parts = t.split(/\s*[-–—]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const name = cleanWhitespace(parts[0]);
  const rest = cleanWhitespace(parts.slice(1).join(' – '));
  if (!name) return null;
  const { desc, price } = stripPriceFromTail(rest);
  return { name, description: cleanWhitespace(desc), price };
}
function normalizePipePrice(segment: string): string | undefined {
  const s = segment.trim();
  if (!s || /^tbd$/i.test(s)) return 'TBD';
  const m = s.match(/^([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (!m) return s || undefined;
  const raw = m[1].replace(/\s/g, '');
  const currency = raw.startsWith('€') ? '€' : '$';
  const num = raw.replace(/[^0-9.]/g, '');
  return `${currency}${/\.\d{1,2}$/.test(num) ? num : `${num}.00`}`;
}
function parseItemLinePipe(line: string): { name: string; description: string; price?: string } | null {
  const t = line.trim();
  if (!t) return null;
  if ((t.match(/\|/g) || []).length < 2) return null;
  const parts = t.split(/\|/).map((p) => p.trim());
  const name = cleanWhitespace(parts[0] ?? '');
  const description = cleanWhitespace(parts[1] ?? '');
  const priceSeg = parts[2] !== undefined ? normalizePipePrice(parts[2]) : undefined;
  return name ? { name, description, price: priceSeg } : null;
}
function parseToDoc(rawText: string): StudioDoc {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => !isNoise(l));
  const blocks: Block[] = [];
  let titleSet = false;
  let currentSection: Extract<Block, { type: 'section' }> | null = null;
  const hasPipeFormat = lines.some((l) => (l.match(/\|/g) || []).length >= 2);
  const ensureSection = (title: string, kind: SectionKind) => {
    const sec: Extract<Block, { type: 'section' }> = { type: 'section', id: uid('sec'), title, kind, tags: kind === 'meta' ? ['meta'] : [], items: [], metaLines: [] };
    blocks.push(sec);
    currentSection = sec;
    return sec;
  };
  for (const line of lines) {
    const pipeCount = (line.match(/\|/g) || []).length;
    if (!titleSet) {
      if (hasPipeFormat && pipeCount >= 2) {
        blocks.push({ type: 'title', text: 'Menu' });
        titleSet = true;
        const pipeItem = parseItemLinePipe(line);
        if (pipeItem) { const sec = ensureSection('Menu items', 'items'); sec.items.push({ id: uid('item'), name: pipeItem.name, description: pipeItem.description, price: pipeItem.price, tags: [] }); }
      } else if (hasPipeFormat && line.trim() && pipeCount === 0) {
        blocks.push({ type: 'title', text: 'Menu' });
        titleSet = true;
        const title = normalizeSectionTitle(line);
        ensureSection(title, looksLikeMetaSectionTitle(title) ? 'meta' : 'items');
      } else {
        blocks.push({ type: 'title', text: line });
        titleSet = true;
      }
      continue;
    }
    if (pipeCount >= 2) {
      const pipeItem = parseItemLinePipe(line);
      if (pipeItem) {
        let sec = currentSection;
        if (!sec || sec.kind !== 'items') sec = ensureSection('Menu items', 'items');
        sec.items.push({ id: uid('item'), name: pipeItem.name, description: pipeItem.description, price: pipeItem.price, tags: [] });
      }
      continue;
    }
    if (isSectionHeader(line)) {
      const title = normalizeSectionTitle(line);
      ensureSection(title, looksLikeMetaSectionTitle(title) ? 'meta' : 'items');
      continue;
    }
    if (!currentSection) {
      const maybeItem = parseItemLine(line);
      if (maybeItem) {
        const sec = ensureSection('Menu items', 'items');
        sec.items.push({ id: uid('item'), name: maybeItem.name, description: maybeItem.description, price: maybeItem.price, tags: [] });
      } else blocks.push({ type: 'subtitle', text: line });
      continue;
    }
    const sec = currentSection;
    if (sec.kind === 'meta') { sec.metaLines.push(line); continue; }
    const item = parseItemLine(line);
    if (item) sec.items.push({ id: uid('item'), name: item.name, description: item.description, price: item.price, tags: [] });
    else sec.metaLines.push(line);
  }
  return { kind: 'menu_doc', blocks };
}
export function runCreativeStudioParserTest(): { ok: boolean; sections: number; sectionItems: number[] } {
  const input = `Swift Creek Starters\nOnion Rings | Crispy battered onion rings | TBD\nMozzarella Sticks | Fried mozzarella sticks | TBD\n\nSerenity Cove Salads\nSparrow Springs Salad | Arugula, spinach, apples | 15.50\nEmerald Wedge Salad | Iceberg wedge | TBD`;
  const doc = parseToDoc(input);
  const sections = doc.blocks.filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section' && b.kind === 'items');
  const sectionItems = sections.map((s) => s.items.length);
  const ok = sections.length === 2 && sectionItems[0] === 2 && sectionItems[1] === 2;
  return { ok, sections: sections.length, sectionItems };
}
function docToCanonicalText(doc: StudioDoc): string {
  const out: string[] = [];
  for (const b of doc.blocks) {
    if (b.type === 'title') out.push(b.text);
    if (b.type === 'subtitle') out.push(b.text);
    if (b.type === 'section') {
      out.push('', `Section: ${b.title}`);
      if (b.kind === 'meta') out.push(...b.metaLines);
      else {
        for (const it of b.items) out.push(`${it.name} - ${cleanWhitespace([it.description, it.price].filter(Boolean).join(' - '))}`.trim());
        if (b.metaLines.length) out.push(...b.metaLines);
      }
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buildTrivia(doc: StudioDoc, count = 14): TriviaQ[] {
  const sections = doc.blocks.filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section' && b.kind === 'items');
  const all = sections.flatMap((s) => s.items.map((it) => ({ sectionId: s.id, sectionTitle: s.title, itemId: it.id, name: cleanWhitespace(it.name), desc: cleanWhitespace(it.description || '') })));
  const usable = all.filter((x) => x.name && x.desc.length >= 6);
  const picked = shuffle(usable).slice(0, Math.min(count, usable.length));
  const qs: TriviaQ[] = [];
  for (const x of picked) {
    const sameSection = usable.filter((y) => y.sectionId === x.sectionId && y.itemId !== x.itemId).map((y) => y.desc);
    const global = usable.filter((y) => y.itemId !== x.itemId).map((y) => y.desc);
    const distractors = shuffle([...sameSection, ...global]).map(cleanWhitespace).filter((d) => d && d !== x.desc);
    const correct = x.desc;
    const options = shuffle([correct, ...distractors]).slice(0, 4);
    while (options.length < 4 && distractors.length > options.length) options.push(distractors[options.length]);
    qs.push({ id: uid('q'), prompt: `What ingredients are in "${x.name}"?`, options, correctIndex: Math.max(0, options.findIndex((o) => o === correct)), sectionTitle: x.sectionTitle });
  }
  return shuffle(qs);
}

export default function CreativeStudio() {
  const [rawInput, setRawInput] = useState(() => { try { return localStorage.getItem(AUTO_SAVE_KEY) ?? DEFAULT_CONTENT; } catch { return DEFAULT_CONTENT; } });
  const [mode, setMode] = useState<StudioMode>('MENU');
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const parsedDoc = useMemo(() => parseToDoc(rawInput), [rawInput]);
  const [isEditing, setIsEditing] = useState(false);
  const [editDoc, setEditDoc] = useState<StudioDoc>(() => parseToDoc(rawInput));
  useEffect(() => { if (!isEditing) setEditDoc(parseToDoc(rawInput)); }, [rawInput, isEditing]);
  useEffect(() => { try { localStorage.setItem(AUTO_SAVE_KEY, rawInput); } catch {} }, [rawInput]);
  const activeDoc = isEditing ? editDoc : parsedDoc;
  useEffect(() => { if (import.meta.env.DEV) runCreativeStudioParserTest(); }, []);
  const triviaQs = useMemo(() => buildTrivia(activeDoc, 18), [activeDoc]);
  const commitEditsToRaw = () => { setRawInput(docToCanonicalText(editDoc)); setIsEditing(false); };
  const updateSectionTitle = (sectionId: string, title: string) => { setEditDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.type === 'section' && b.id === sectionId ? { ...b, title } : b)) })); };
  const updateItem = (sectionId: string, itemId: string, patch: Partial<Item>) => { setEditDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.type !== 'section' || b.id !== sectionId ? b : { ...b, items: b.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) })) })); };
  const addItem = (sectionId: string) => { setEditDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.type !== 'section' || b.id !== sectionId ? b : { ...b, items: [...b.items, { id: uid('item'), name: 'New item', description: '', price: '', tags: [] }] })) })); };
  const removeItem = (sectionId: string, itemId: string) => { setEditDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.type !== 'section' || b.id !== sectionId ? b : { ...b, items: b.items.filter((it) => it.id !== itemId) })) })); };
  const handleExportPdf = () => exportPdf(activeDoc, mode);
  const handleExportWeb = () => exportWeb(activeDoc, mode);
  const handleExportSocial = () => exportSocial(activeDoc, mode);
  const handleGenerateQr = async () => { try { setQrDataUrl(await exportQrDataUrl(qrUrl.trim() || window.location.href)); } catch { setQrDataUrl(null); } };

  return (
    <div className="creative-studio">
      <header className="creative-studio__header">
        <Link to="/" className="creative-studio__back">← Back to Playroom</Link>
        <div className="creative-studio__header-row">
          <div>
            <h1 className="creative-studio__heading">Creative Studio</h1>
            <p className="creative-studio__tagline">Paste once. Clean it up. Export menus, training, tests, and trivia.</p>
          </div>
          <div className="creative-studio__header-actions">
            <button type="button" className={`creative-studio__pill ${isEditing ? 'creative-studio__pill--on' : ''}`} onClick={() => setIsEditing((v) => !v)}>{isEditing ? 'Editing: ON' : 'Editing: OFF'}</button>
            {isEditing && <button type="button" className="creative-studio__btn" onClick={commitEditsToRaw}>Save edits</button>}
          </div>
        </div>
        <Link to="/create/templates" className="creative-studio__templates-link">Browse template families (Hospitality, Education, Care, Business, General)</Link>
      </header>
      <section className="creative-studio__paste" aria-label="Paste content">
        <p className="creative-studio__paste-label">Paste from a website. Hours/notes get separated from real menu items. Prices become their own field.</p>
        <textarea className="creative-studio__textarea" value={rawInput} onChange={(e) => setRawInput(e.target.value)} placeholder="Paste text here..." rows={8} />
      </section>
      <section className="creative-studio__modes" aria-label="Display mode">
        <span className="creative-studio__modes-label">Mode:</span>
        <div className="creative-studio__mode-toggles">
          <button type="button" onClick={() => setMode('MENU')} className={`creative-studio__mode-btn ${mode === 'MENU' ? 'creative-studio__mode-btn--active' : ''}`}>MENU</button>
          <button type="button" onClick={() => setMode('TRAINING_STUDY')} className={`creative-studio__mode-btn ${mode === 'TRAINING_STUDY' ? 'creative-studio__mode-btn--active' : ''}`}>TRAINING</button>
          <button type="button" onClick={() => setMode('TRAINING_TEST')} className={`creative-studio__mode-btn ${mode === 'TRAINING_TEST' ? 'creative-studio__mode-btn--active' : ''}`}>TEST</button>
          <button type="button" onClick={() => setMode('TRIVIA')} className={`creative-studio__mode-btn ${mode === 'TRIVIA' ? 'creative-studio__mode-btn--active' : ''}`}>TRIVIA</button>
        </div>
      </section>
      <section className="creative-studio__workspace" aria-label="Preview">
        <h2 className="creative-studio__workspace-title">Preview</h2>
        {mode === 'TRIVIA' && ( /* Mixed Trivia block */ null )}
        {mode !== 'TRIVIA' && ( /* blocks: title, subtitle, section (menu/training/test) */ null )}
      </section>
      <section className="creative-studio__export" aria-label="Export">
        <h2 className="creative-studio__export-title">Export — one content, any output</h2>
        <div className="creative-studio__export-btns">
          <button type="button" className="creative-studio__export-btn" onClick={handleExportPdf}>Export PDF</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportWeb}>Export Web</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportSocial}>Instagram / Facebook</button>
        </div>
        <div className="creative-studio__qr">
          <label className="creative-studio__qr-label">QR Code — paste any URL to encode:</label>
          <div className="creative-studio__qr-row">
            <input type="url" className="creative-studio__qr-input" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://..." />
            <button type="button" className="creative-studio__export-btn" onClick={handleGenerateQr}>Generate QR</button>
          </div>
          {qrDataUrl && <div className="creative-studio__qr-preview"><img src={qrDataUrl} alt="QR code" width={200} height={200} /></div>}
        </div>
      </section>
    </div>
  );
}
```

</details>

**Note:** The snippet above is a condensed copy; the canonical source is always `frontend/src/pages/CreativeStudio.tsx`. For export logic (PDF/Web/Social/QR), see `frontend/src/lib/creativeStudioExport.ts`.
