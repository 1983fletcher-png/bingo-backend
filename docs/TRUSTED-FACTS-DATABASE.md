# Trusted Facts Database & Automatic Cross-Reference

**Goal:** Users never have to search Wikipedia or Britannica. The system automatically pulls from trusted sources, cross-references facts, and (optionally) maintains a **curated fact database** so we can serve trivia and edutainment locally—trusted, solid, and smooth.

---

## Vision

1. **Automatic cross-referencing** — When we present a fact, the system (not the user) hits trusted sites or our own DB to confirm it has ≥2 independent sources. No pasting URLs.
2. **Trusted sources only** — Wikipedia, Britannica, .gov, .edu, WHO, Nature, Scientific American, and similar. We either call their APIs or ingest into our DB with clear attribution.
3. **Optional but powerful: a large fact database** — We ingest from these sites into a **tagged, searchable fact store**. Once a fact is in the DB and marked cross-referenced, we pull from our DB at runtime. No live calls to external sites for the end user; faster and more reliable.
4. **Scope** — Trivia, edutainment, music trivia, biology, science, earth science, economics, history, pop culture—anything that fits “trivia or edutainment.” All tagged so we can filter by topic and age.

---

## Two Ways to Get There

### A. Live fetch at verify time (simpler, no DB)

- When the user generates a draft (or when we “verify”), the backend calls **Wikipedia API** (and optionally other APIs) with the claim or question text.
- We get back summaries/snippets and URLs. We count sources and mark verified if ≥2.
- **Pros:** No database to build or maintain; always up to date.  
- **Cons:** Rate limits, latency, dependency on external APIs; not all claims are easy to look up automatically; we don’t “own” the content for offline/speed.

### B. Curated fact database (recommended long term)

- **Ingestion (build phase):** We pull from trusted sources (Wikipedia API, feeds, or licensed content). We normalize into **facts** with: claim text, source URLs, source names, tags (biology, 80s music, economics, etc.). We only add a fact to the DB if it is supported by ≥2 sources (cross-referenced at ingest time).
- **Runtime:** When the AI Builder generates a pack or we serve trivia, we **query our DB** by tags/topic/age. Verification = “is this fact in our DB and does it have ≥2 sources?” No user search; no live Wikipedia hit during play.
- **Pros:** Fast, reliable, works offline/cached; we control quality and tagging; smooth UX.  
- **Cons:** We must build and maintain the ingestion pipeline and DB.

### C. Hybrid (practical path)

- **Phase 1:** Add **live Wikipedia (and optionally Britannica) lookup** in the backend when the user clicks “Verify” or when we generate. Automatically fetch and attach 2+ source URLs so the user doesn’t paste anything. Keeps current UX but makes verification automatic.
- **Phase 2:** Start a **small curated DB** (e.g. one category: “80s music” or “science basics”). Ingest from Wikipedia API (and others where we have access), normalize, cross-reference, tag. AI Builder can “pull from DB” when generating so some content is pre-verified.
- **Phase 3:** Grow the DB (more categories, more sources), and prefer DB over live fetch when we have a match. Use live fetch only for claims we don’t yet have in the DB (and optionally backfill the DB from those results).

**Recommendation:** Plan for **B/C**. Start with **C Phase 1** (auto fetch at verify) so users never have to search or paste. Then add the **fact database** and ingestion so we can pull locally and scale.

---

## Trusted Sources & How We Access Them

| Source            | Access method                    | Notes |
|-------------------|-----------------------------------|------|
| Wikipedia         | [MediaWiki API](https://www.mediawiki.org/wiki/API) | Search, get summary + URL. Rate limits; attribution required. |
| Britannica        | API (if licensed) or structured crawl | Terms vary; API preferred over scraping. |
| .gov / .edu       | Sitemaps, RSS, or APIs where available | Many public domain; respect robots.txt. |
| WHO, Nature, etc. | APIs or RSS where offered        | Check ToS; prefer official APIs. |

- **Do not** rely on unsanctioned scraping where an API or license exists. Prefer APIs and clear attribution.

---

## Data Model for the Fact Database

Facts are the core unit: one claim, multiple sources, many tags.

```txt
fact
  id              UUID or slug
  claim           string   -- the statement (e.g. "The heart has four chambers.")
  normalized      string?  -- normalized form for dedup / search
  explanation     string?  -- short explanation for hosts/players
  sources         JSON     -- [{ "url", "title", "domain", "snippet?" }]
  source_count    int      -- len(sources); must be >= 2 to be "verified"
  tags            []string -- e.g. ["biology", "science", "anatomy", "kids"]
  age_min         int?     -- optional age floor
  age_max         int?     -- optional age ceiling
  added_at        timestamp
  updated_at      timestamp
```

- **Ingestion:** We only insert/update a fact when we have ≥2 sources (cross-referenced at build time).
- **Tags** drive “pull by topic”: trivia, edutainment, music trivia, biology, earth science, economics, history, etc. We can add more as we grow.

Storage options:

- **Phase 1 (no DB):** Keep current “sources in draft_nodes”; add backend job that calls Wikipedia API and fills `sources` automatically.
- **Phase 2+:** SQLite or Postgres table `facts`; optional full-text search on `claim` and `normalized` for matching.

---

## Ingestion Pipeline (High Level)

1. **Select source** — e.g. Wikipedia category or API search, or a list of .gov URLs.
2. **Fetch** — Call API or fetch page (respect rate limits and robots.txt).
3. **Extract** — Parse into structured “claims” (e.g. key sentences from a summary, or Q&A from a known schema). This is the hardest step; start with simple rules (e.g. “first N sentences of summary” or manual curation).
4. **Cross-reference** — For each claim, try to find the same (or very similar) fact on another trusted source (e.g. Britannica or another Wikipedia article). If ≥2 sources support it, keep it.
5. **Normalize & tag** — Normalize claim text; assign tags from a controlled list (biology, economics, 80s_music, etc.).
6. **Store** — Insert into `facts` with sources and tags. Only store facts that meet the ≥2-source rule.

We can run this as **scheduled jobs** (e.g. weekly) or on-demand for a new category. Start with one small category to prove the pipeline.

---

## How AI Builder & Trivia Use It

- **Generate:** When the host picks a theme (e.g. “80s Night”, “Science”), the backend can **query the fact DB** by tags and return real, pre-verified questions/nodes instead of placeholders. No user search.
- **Verify:** For any fact we show:
  - If it came from our DB → already has ≥2 sources; show “verified” and optionally the source URLs.
  - If it was user- or AI-generated and not in DB → call **live fetch** (Wikipedia API, etc.), attach sources, and optionally **backfill the DB** after review so next time we have it locally.
- **Smooth UX:** End user never has to open Wikipedia or Britannica; everything is “built in.”

---

## Phased Plan

| Phase | What we do | User experience |
|-------|------------|------------------|
| **1 – Auto fetch** | Backend calls Wikipedia (and optionally one other) API when verifying or generating. Attach 2+ source URLs automatically. | No pasting URLs; “Verify” fills in sources from trusted sites. |
| **2 – Small DB** | Add `facts` table and ingestion for one category (e.g. “science basics” or “80s music”). Generate/verify can pull from DB when there’s a match. | Some content is instant and pre-verified from our DB. |
| **3 – Grow DB** | More categories (biology, economics, music trivia, earth science, etc.), more sources (Britannica, .gov where possible). Prefer DB; use live fetch to backfill. | Most content comes from our DB; fast and trusted. |

---

## Summary

- **Automatic cross-referencing** and **no user search** are achieved by: (1) **live API calls** from our backend to Wikipedia (and similar), and (2) **a curated fact database** we build from those same trusted sources.
- **Best long-term path:** Build a **tagged fact database** fed by Wikipedia (and other trusted sources), cross-referenced at ingest time, and use it for generation and verification so we “pull locally” and keep the experience smooth and trusted.
- **Next concrete step:** Implement **Phase 1 (auto fetch)** in the backend: on “Verify” or when generating, call Wikipedia API (and optionally another source), attach 2+ URLs to each factual node, and mark verified. Then we can add the DB and ingestion in Phase 2.

---

## Phase 1 implemented (auto-fetch)

**Backend** (`lib/trustedSources.js` + `POST /api/ai-builder/verify`):

- When the user clicks **Verify facts**, the backend automatically fetches up to 3 sources per factual claim from:
  1. **Wikipedia (en)** — MediaWiki opensearch + REST page summary
  2. **Simple English Wikipedia** — same flow, different project
  3. **DBpedia** — Lookup API (structured knowledge base from Wikipedia)
- Each source returns `{ url, title, snippet, domain }`. We attach these to the node and re-run verification; if ≥2 sources are found, the fact is marked **verified**.
- The response includes `updatedNodes` so the frontend can replace the draft nodes with the auto-filled sources. No user paste required.

**Frontend:** Copy explains that Verify auto-fills sources from Wikipedia, Simple Wikipedia & DBpedia. The "Verify facts" button label is "Verify facts (auto sources)".

**User-Agent:** All requests use a descriptive User-Agent per Wikimedia and DBpedia guidelines.

If you want, next we can (b) define the exact `facts` schema and a minimal ingestion script for Phase 2 (curated database).
