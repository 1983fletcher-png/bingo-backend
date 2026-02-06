# Figure / Biography Page Pipeline

Dynamic image ingestion and scalable page template for scientists and historical figures.

## Config (input)

- **schema.json** — JSON Schema for the figure config and output.
- **&lt;name&gt;.config.json** — Per-figure config: `figure`, `lifespan`, `quickFacts`, `sections` (with `keywords` and optional `conceptKeywords`), `sources`, `triviaTags`.

Adding a new figure = add a new `*.config.json` and run the pipeline.

## Pipeline

1. **Master source list** — `lib/imageIngest/sources.js`: Wikimedia Commons, NASA, Smithsonian, LOC, USGS, NOAA, Unsplash, Pexels. License types and categories.
2. **Fetcher** — Keyword-driven search (Commons API, NASA API stub). Returns candidates with url, license, dimensions, alt.
3. **Validation** — License allowed, min dimensions, hash dedup, optional concept match (keywords in alt/description).
4. **R2 upload** — `figures/<figure_slug>/<image_id>.<ext>` (WebP when possible).
5. **Output** — JSON: `heroImage`, `sections[].images`, `metadata` (altText, tags, concepts, source, license, r2Url), `triviaTags`, `sources`.

## Commands

**Node (config-driven, figures/ prefix):**
```bash
# Ingest from config (fetch → validate → R2 → write JSON)
npm run ingest:figure -- data/figures/nikola-tesla.config.json

# Dry run (fetch + validate, no upload, print JSON)
npm run ingest:figure -- data/figures/nikola-tesla.config.json --dry-run

# Write to specific file
npm run ingest:figure -- data/figures/nikola-tesla.config.json --out output/tesla-page.json
```

**Python (keyword-driven, same R2 env):**
```bash
pip install -r requirements-ingest.txt
export R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET_NAME=... R2_PUBLIC_BASE_URL=...
python3 scripts/ingest_figure_images.py
# Writes Nikola_Tesla_page.json; edit __main__ for other figures/keywords.
```

## Learn & Grow

Output schema is compatible with the Learn & Grow registry and page template. Metadata (tags, concepts) feeds trivia and bingo. Optional: merge output into `frontend/src/data/volcano-images.json` for existing pages or keep separate figure JSON for a future dynamic renderer.

## Future

- **Video:** Same pipeline, R2 key `figures/<figure>/<id>.mp4`, metadata tags.
- **Trivia:** Tags/concepts → trivia generator; no extra data entry.
- **Multiple images per section:** Config `maxImagesPerSection`; experiments/diagrams can request 10+.
