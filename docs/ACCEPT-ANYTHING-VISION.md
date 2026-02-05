# Accept anything — VLC-inspired product principle

**Purpose:** Align our product with a “throw anything at it and it works” philosophy. Community, software, and hardware should work together so users get a smooth, positive experience no matter what format or source they bring.

---

## Inspiration: VLC

VLC Media Player is beloved because it **accepts almost any format** and plays it. No “this file type is not supported” dead-ends. That reliability and openness are what we aim for in the Playroom:

- **Menus and content:** Accept PDF, images, URLs, plain text, HTML, CSV, and more. Extract what we need and render in our design.
- **Integrations:** Work with any device, any host, any venue setup. We adapt; we don’t require one “right” way.
- **Community and collaboration:** People and tools work together. Our systems are good neighbors: we interoperate instead of locking people in.

---

## How we apply it

| Area | Principle | Example |
|------|-----------|--------|
| **File inputs** | Support as many formats as we can; degrade gracefully. | Menu builder: PDF, image (OCR), URL, paste, plain text, HTML, CSV. If one path fails, we try another or show a clear next step. |
| **APIs and runtimes** | Prefer portable, “works everywhere” choices. | PDF: primary + fallback so it works on Railway, local, and other hosts. No “only works on my machine.” |
| **Errors** | Never a dead-end. | “This format isn’t supported yet” → suggest an alternative (e.g. “Use a PDF or paste the URL”) and document roadmap. |
| **Hardware & software** | Assume diversity. | Phones, tablets, TVs, different browsers and OSes. We test and design for variety. |

---

## Supported file types (menu / content ingestion)

Current and planned support for **POST /api/parse-menu-from-file** and related flows:

| Type | Status | Notes |
|------|--------|--------|
| **PDF** | ✅ Supported | Text extraction via primary library + Mozilla PDF.js fallback so it works in all environments (e.g. Railway). |
| **Plain text (.txt)** | ✅ Supported | UTF-8 (or BOM detection); content passed to menu parser. |
| **HTML** | ✅ Supported | Tags stripped; text extracted and passed to menu parser. |
| **CSV** | ✅ Supported | Rows parsed; optional header row; name/price columns mapped to menu items. |
| **Image (JPEG, PNG, etc.)** | 🚧 Roadmap | OCR (e.g. Tesseract.js or service) to extract text → same menu parser. |

Frontend can accept these via file input and send base64 + `mimeType` to the backend. Backend returns `{ sections }` for the menu builder.

**Unaccepted types and how we get past them:** See **`docs/UNACCEPTED-FILE-TYPES.md`** for a full list of file types the system does not yet accept, why each is blocked, and the concrete bridge (implementation path) to accept it—so we can reach full interoperability, including legacy formats.

---

## References

- **Unaccepted file types and bridges:** `docs/UNACCEPTED-FILE-TYPES.md`
- **Menu & theming:** `docs/MENU-AND-THEMING-VISION.md`
- **Phase B/C APIs:** `docs/PHASE-C-THEMING-AND-CALENDAR.md`, `docs/PHASE-A-B-AUDIT.md`
- **Permission and design:** We use content as **input** and output **our** design; see permission and legal guidance in MENU-AND-THEMING-VISION.
