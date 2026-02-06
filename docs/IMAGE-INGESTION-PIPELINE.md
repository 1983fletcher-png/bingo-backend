# Image ingestion pipeline — gold standard

**Definition of done:** Every image legally sourced; machine-readable license metadata; images in R2 (not hotlinked); frontend renders from structured data only; swapping images or layouts later requires zero refactors.

Images are **verified knowledge assets**, not decoration. If an image fails validation it **never reaches the page**.

## Pipeline

```
Source → Validate (license) → Normalize (future: resize) → Upload to R2 → Register (JSON/DB) → Render
```

- **License validation** — Only allowed types; required metadata per image.
- **R2 object metadata** at upload: `volcano`, `license`, `source`, `attribution`, `role` — for auditing and compliance.
- **Registry:** Option A = JSON (`frontend/src/data/volcano-images.json`). Frontend discovers images from registry; no filenames in UI.
- **Attribution** — Rendered at bottom of page (Image Credits); legal requirement.

## Implementation

- **lib/imageIngest.js**
  - `ingestImage({ imageUrl, metadata })`: generic learning image; key `learning-images/{hash}.{ext}`.
  - `ingestVolcanoImage({ imageUrl, volcanoSlug, role, priority?, caption?, metadata })`: key `volcanoes/{slug}/{role}/{id}.{ext}`; sets R2 **Metadata** (volcano, license, source, attribution, role); returns **VolcanoImage**-shaped record (id, volcanoSlug, r2, src.lg/md/sm, alt, usage, license, dimensions, createdAt).
- **Trusted sources:** NASA, USGS, Wikimedia Commons (verify per image), NOAA, si.edu, loc.gov.
- **Required metadata per image:** `license: { type: 'public-domain' | 'cc-by' | 'cc-by-sa', source, attribution?, sourceUrl }` — if you can’t fill this out, image is rejected.
- **scripts/register-volcano-image.js** — Reads one VolcanoImage JSON from stdin, appends to `frontend/src/data/volcano-images.json` under slug and role.

## R2 assumptions (you’re already here)

- R2 bucket created, public dev URL enabled, env vars set.
- **Env vars (sanity check):** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (e.g. `learning-images`), `R2_PUBLIC_BASE_URL` (your image CDN, e.g. `https://pub-xxxxxxxx.r2.dev`).

We build on **lib/r2.js** (same client and config). No duplicate Cloudflare setup.

## Volcano image flow

1. Run ingest (e.g. from a script that calls `ingestVolcanoImage` with imageUrl, volcanoSlug, role, metadata). Metadata must include altText (≥10 chars), sourceName, sourceUrl, license (Public Domain / CC0 / CC BY 4.0 / CC BY-SA 4.0), attributionRequired, tags, concepts, verified: true.
2. Ingest returns a **VolcanoImage** record. Append to registry: `node scripts/register-volcano-image.js < record.json` (or pipe ingest output).
3. Frontend loads `volcano-images.json`; **VolcanoImage** component renders from `image.src.lg/md/sm`, `image.alt`, `image.license`. **AttributionSection** at bottom lists all image credits with source and link.

## Normalization (future)

Standard outputs per image: original.webp (archival), lg.webp (1600px), md.webp (960px), sm.webp (480px). Key structure in R2: `volcanoes/{slug}/{role}/{id}/lg.webp` etc. Until then, single file is stored and `src.lg = src.md = src.sm` in the record.

## Test (generic ingest)

From repo root with R2_* set:

```bash
node scripts/ingest-learning-image.js
```

Example ingests one Public Domain image from Wikimedia; replace the URL in the script if it 404s or is rate-limited.
