# Unaccepted file types — and how we get to full interoperability

**Purpose:** One place that lists every file type the Playroom system does **not** yet accept, why we don’t, what the roadblock is, and how we build a bridge so we can be the most universally accepted system. Goal: VLC-like fluidity. No dead-ends; we want complete interoperability, including legacy and “outdated” formats where feasible.

---

## Where file types matter in the system

| Surface | What we accept today | What we reject (and where it’s documented below) |
|--------|-----------------------|--------------------------------------------------|
| **Menu / content ingestion** (`POST /api/parse-menu-from-file`) | PDF, plain text, HTML, CSV | Images, Office docs, spreadsheets, legacy docs, markdown, JSON/XML, eBooks |
| **Host logo / venue image** (Host.tsx, StretchyLogoFidget) | `image/*` (JPEG, PNG, WebP, GIF, BMP, SVG where browser supports) | PDF-as-logo, HEIC (often), raw/camera formats, video |
| **Display / player** (images shown via URL) | Whatever the browser can display (IMG src) | No “upload” here; URLs only. Server can serve any type the browser supports. |

Below we focus on **menu ingestion** and **host assets**, and list every unaccepted type, the roadblock, and the bridge.

---

## Part 1: Menu / content ingestion (parse-menu-from-file)

*Goal: User drops any document or image that might contain a menu; we extract text/structure and return `{ sections }` for the menu builder.*

### 1. Images (all raster and most vector)

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC, etc. | `image/*` | **Not accepted** (501) | No OCR in the pipeline. We need to turn pixels into text before we can run the menu parser. |

**Why we don’t:** Text is trapped in pixels. We have no “image → text” step yet.

**Bridge:**

- **Tesseract.js** (pure JavaScript OCR): Run in Node or in the browser. No native deps in the JS path; works on Railway and most hosts. Output: plain text → feed into existing `parseMenuText()`. This is the main bridge.
- **Cloud OCR APIs** (Google Vision, AWS Textract, etc.): Optional alternative or fallback; adds cost and external dependency. Use when we need higher accuracy or non-Latin scripts.
- **Priority:** High. Menus are often photos or screenshots. Implementing Tesseract.js (or one OCR path) gives us “accept any image” for menu content.

---

### 2. Office documents (Word, etc.)

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | **Not accepted** | We don’t parse Office Open XML (docx = ZIP + XML). |
| ODT | `application/vnd.oasis.opendocument.text` | **Not accepted** | Same idea: need to extract text from an open-doc container. |
| RTF | `application/rtf`, `.rtf` | **Not accepted** | Rich Text Format is a different grammar; we don’t parse it yet. |
| Legacy .doc | `application/msword` | **Not accepted** | Old binary Word format; fewer libraries support it. |

**Why we don’t:** We only handle plain text, HTML, CSV, and PDF. Office formats are either XML-in-ZIP (DOCX, ODT) or custom binary/RTF.

**Bridge:**

- **DOCX:** Use **mammoth.js** or **docx** (npm). Mammoth turns DOCX into HTML or plain text; we already handle both. So: DOCX → text/HTML → `parseMenuText()`. Straightforward.
- **ODT:** Unzip ODT (it’s a ZIP), read `content.xml`, strip XML tags or use a small ODT→text lib. Same pipeline after that.
- **RTF:** Parser libs exist (e.g. **rtf-to-html** or **rtf-parser**). RTF → text or HTML → `parseMenuText()`.
- **Legacy .doc:** Harder. Options: (1) Rely on user to “Save as PDF” or “Save as DOCX” and we accept those; (2) Use a converter (LibreOffice headless, or cloud API) to turn .doc → PDF/DOCX, then our existing pipeline; (3) Add a dedicated .doc parser if we find a reliable Node lib. We can “emulate” the old system by converting it into a format we already support.

**Priority:** Medium. DOCX is very common; mammoth is a small, feasible bridge.

---

### 3. Spreadsheets

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| XLSX | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | **Not accepted** | We don’t read Excel XML/ZIP. |
| XLS | Legacy Excel binary | **Not accepted** | Binary format; needs a dedicated reader. |
| ODS | OpenDocument Spreadsheet | **Not accepted** | Same idea: structured sheet format. |

**Why we don’t:** We accept CSV (plain rows). Spreadsheets are structured (sheets, cells, formulas); we don’t map them to rows yet.

**Bridge:**

- **xlsx** (SheetJS) or **exceljs**: Read XLSX (and often XLS) in Node. Get first sheet (or “Menu” sheet), iterate rows, map to “name” and “price” columns (by header or position). Output the same `{ sections }` shape we use for CSV. Reuse the same menu-builder contract.
- **ODS:** Unzip, parse `content.xml` for table cells, or use an ODS library. Then same row-based mapping.
- **Legacy XLS:** SheetJS often supports it. If not, “Export as XLSX or CSV” is a clear user path; we already accept both.

**Priority:** Medium. Many venues keep menus in Excel. One library (e.g. xlsx) plus a single “spreadsheet → rows → sections” path gets us there.

---

### 4. Markdown and other text-like formats

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| Markdown | `text/markdown`, `.md` | **Not accepted** (treated as unsupported) | We don’t explicitly allow `text/markdown`; we only allow `text/plain` and `application/octet-stream` for text. |

**Why we don’t:** We never added a branch for `text/markdown`. The “roadblock” is just a missing case.

**Bridge:** Treat `text/markdown` like plain text: decode UTF-8 and pass to `parseMenuText()`. Optionally strip `#` and `**` etc. for cleaner lines, or leave as-is; the heuristic parser often copes. **Trivial bridge.**

**Priority:** Low. Easy to add in one deploy.

---

### 5. JSON / XML (structured menu data)

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| JSON | `application/json` | **Not accepted** | We don’t map a generic JSON shape to `{ sections }`. |
| XML | `application/xml`, `text/xml` | **Not accepted** | Same: no generic XML → sections mapper. |

**Why we don’t:** We’re built for “unstructured” text (PDF, HTML, CSV). Arbitrary JSON/XML have no single schema; we’d need a convention (e.g. `{ "sections": [ { "name": "...", "items": [...] } ] }`) or a small set of supported schemas.

**Bridge:**

- **Convention:** If the JSON matches our own `{ sections }` shape, accept it and return it (or validate and pass through). That’s “we accept our own export.”
- **Optional:** Support one or two common “menu” JSON/XML schemas (if they emerge from partners or tools) and map them to our shape. No fundamental blocker; it’s product/design choice.

**Priority:** Low unless we have a concrete use case (e.g. partner integration).

---

### 6. eBooks and other containers

| Type | MIME / extension | Status | Roadblock |
|------|-------------------|--------|-----------|
| EPUB | `.epub` | **Not accepted** | EPUB is ZIP + HTML/XHTML inside; we don’t unzip and aggregate content. |
| MOBI | `.mobi` | **Not accepted** | Different container format; fewer JS libs. |

**Why we don’t:** These are “book” formats. Menus are rarely distributed as EPUB/MOBI, but in principle they could be.

**Bridge:** For EPUB: unzip, find XHTML/HTML files, concatenate or pick the first, strip tags → text → `parseMenuText()`. Libs like **epub-gen-memory** or **epub2** can read; we only need text extraction. MOBI is harder in pure JS; we could document “export as EPUB or PDF” or add a converter step. **Feasible for EPUB;** MOBI is secondary.

**Priority:** Low. Add when we see real demand.

---

### 7. Legacy / proprietary document formats

| Type | Examples | Status | Roadblock |
|------|-----------|--------|-----------|
| Old Word | `.doc` (pre-2007) | **Not accepted** | Binary; fewer parsers. |
| WordPerfect | `.wpd` | **Not accepted** | Niche; few Node libs. |
| Apple Pages | `.pages` | **Not accepted** | Proprietary bundle. |
| Quark, InDesign export | Various | **Not accepted** | Print-industry formats; not designed for our pipeline. |

**Why we don’t:** These formats are either binary, proprietary, or both. The “data of all the systems” exists in specs and reverse engineering, but in practice we rely on converters or “export as” flows.

**Bridge:**

- **Emulate / interpret where we can:** Use any available Node library that can read the format (e.g. some .doc readers) and output text or HTML; then we run our pipeline. If no good lib exists:
- **Convert through a format we support:** User exports to PDF, DOCX, or CSV (we accept all three). We document: “For best results, export to PDF or Word/CSV and upload that.” That’s still “accept anything” from the user’s perspective: they have a path.
- **Optional:** Server-side conversion (LibreOffice headless, or cloud API) to turn legacy → PDF/DOCX, then our pipeline. More infra; use when we need to “accept the file as-is” without user export.

**Feasibility:** Yes. We don’t have to implement every legacy format ourselves. We need (1) clear user guidance (“export as PDF/CSV”), (2) optional converters where we want true “drop any file” for high-value formats.

---

## Part 2: Host / display assets (logo, banner, stretchy image)

*Goal: Host can upload a logo or image; we show it in the app and on display. Today we use `accept="image/*"` and `file.type.startsWith('image/')`.*

### 8. “Image” types that are effectively unaccepted or fragile

| Type | Issue | Roadblock |
|------|--------|-----------|
| **HEIC** (iPhone photos) | Many browsers don’t display `image/heic`; some don’t include it in `image/*`. | Browser/OS support inconsistent. |
| **PDF as logo** | We don’t let the user “use this PDF as the logo.” | We only accept `image/*`; PDF is not an image. |
| **Raw/camera** (CR2, NEF, ARW, etc.) | Browsers don’t open these. | Not in `image/*` in practice; need conversion. |
| **Video** (MP4, WebM) as logo | We don’t support video as logo/banner. | Would require a video element and playback logic; not implemented. |

**Why we don’t:**

- HEIC: Browser support and `accept` behavior.
- PDF as logo: No “first page of PDF as image” step.
- Raw: No in-browser decode; would need server-side or client-side conversion.
- Video: Product choice; adds complexity.

**Bridge:**

- **HEIC:** Client-side conversion to JPEG before upload (e.g. **heic2any**). User picks a photo → we convert → upload as image/jpeg. Transparent to backend.
- **PDF as logo:** Client or server: render first page of PDF to a canvas/image (e.g. PDF.js), then use that image as the logo. Backend could accept `application/pdf` for “logo” and return a raster image URL after conversion, or we do it in the frontend only.
- **Raw:** “Export as JPEG/PNG” or use a conversion service. We document the path; we don’t have to decode CR2 ourselves.
- **Video:** If we ever want “video logo,” we add a video element and accept `video/*` in that flow. Not a technical impossibility; it’s a scope decision.

**Priority:** HEIC is high (many phones); PDF-as-logo is nice-to-have; raw/video are lower.

---

## Part 3: Summary — roadblocks and bridges at a glance

| Category | Unaccepted types | Main roadblock | Bridge (how we get over it) |
|----------|------------------|----------------|-----------------------------|
| **Menu: Images** | JPEG, PNG, WebP, TIFF, HEIC, etc. | No OCR | Tesseract.js (or cloud OCR) → text → parseMenuText |
| **Menu: Office** | DOCX, ODT, RTF, .doc | No doc parser | mammoth (DOCX), unzip/parse (ODT), rtf lib (RTF); .doc via converter or “export as” |
| **Menu: Spreadsheets** | XLSX, XLS, ODS | No sheet parser | xlsx/SheetJS → rows → same sections contract as CSV |
| **Menu: Markdown** | .md | Not wired | Treat as text/plain or add text/markdown branch |
| **Menu: JSON/XML** | application/json, .xml | No schema mapping | Accept our-format JSON; optionally support one menu schema |
| **Menu: eBooks** | EPUB, MOBI | Container format | EPUB: unzip + HTML→text; MOBI later or “export as PDF” |
| **Menu: Legacy** | .doc, .wpd, .pages, etc. | Binary/proprietary | Libs where they exist; else “export to PDF/CSV”; optional server converter |
| **Assets: HEIC** | image/heic | Browser support | Client-side heic2any → JPEG before upload |
| **Assets: PDF as logo** | application/pdf | We only take image/* | Render first page to image (PDF.js) client or server |
| **Assets: Raw / video** | CR2, NEF, video/* | Decode/playback | “Export as JPEG” or add video path when in scope |

---

## Is it feasible? Can we make it happen?

**Yes.** Nothing in the list is fundamentally impossible. The blockers are:

1. **Implementation time** — We add one bridge at a time (OCR, then DOCX, then XLSX, etc.).
2. **Libraries and runtimes** — We already prefer “works everywhere” (e.g. PDF.js fallback). Same idea: choose OCR and doc/sheet libs that run in Node and in the browser where it helps.
3. **Legacy formats** — We don’t have to implement every old binary ourselves. We can (a) use “export as PDF/CSV” as the universal path, (b) add converters (LibreOffice or API) only where we need true “drop any file,” and (c) add direct parsers when good libs exist (e.g. DOCX, XLSX).

**Interoperability and “old systems”:**  
We can interpret and, where it makes sense, “emulate” old systems by:

- Converting legacy formats into formats we already support (PDF, text, CSV), or  
- Adding a small adapter (library or microservice) that speaks the old format and outputs our contract (`{ sections }` or an image URL).

So: **no permanent roadblocks.** We have a clear list of unaccepted types, why each is unaccepted, and a concrete bridge for each. We can get to “accept anything” in stages, with fluidity and ease of use as the design goal, like VLC.

---

## Next steps (suggested order)

1. **Images (menu):** Add Tesseract.js (or one OCR path) so image upload returns `{ sections }`. Biggest gap.
2. **DOCX (menu):** Add mammoth (or equivalent); accept DOCX in parse-menu-from-file.
3. **XLSX (menu):** Add xlsx/SheetJS; accept spreadsheets and map to sections.
4. **Markdown (menu):** Add `text/markdown` and treat as text.
5. **HEIC (assets):** Client-side heic2any so iPhone photos work as logo.
6. **PDF as logo (assets):** Optional: accept PDF for logo and render first page to image.

After that, we iterate on EPUB, JSON/XML, and legacy converters as product needs appear.
