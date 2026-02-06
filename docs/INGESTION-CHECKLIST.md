# Image ingestion checklist (must-pass rules)

Every image you ingest **must pass all** of these. The script enforces them before upload.

| Rule | Requirement | Enforced in |
|------|-------------|-------------|
| **Source legality** | Only public domain or permissively licensed (CC-BY, CC-BY-SA). URL/source verifiable. | `validateSource(url)` + trusted sources list; `validateLicense()` |
| **Metadata completeness** | `alt` (required), `caption` (optional), `source`, `sourceUrl`, `license` type | `validateMetadata()` before download |
| **Resolution / quality** | Minimum width 800px; properly oriented | `sharp.metadata()` after download; reject if width < 800 |
| **File format** | Convert to WebP for modern performance | `sharp().webp({ quality: 80 })` before upload |
| **Role assignment** | One of: `hero`, `section`, `diagram`, `gallery` | Role in input; key structure |
| **R2-ready** | Filename/key structure consistent with bucket | `volcanoes/{slug}/{role}/{hash}.webp` |
| **Duplication check** | Hash the file → avoid duplicates | SHA-256 hash of raw buffer; key uses hash; registry merge skips existing id |

## Trusted sources

See **[docs/IMAGE-SOURCE-WHITELIST.md](IMAGE-SOURCE-WHITELIST.md)** for the full master list. The code uses `TRUSTED_SOURCES` in `lib/imageIngest.js` (wikimedia.org, nasa.gov, noaa.gov, usgs.gov, si.edu, loc.gov, smithsonian.org, getty.edu, metmuseum.org, nypl.org, archive.org, openverse.org, unsplash.com, pexels.com, pixabay.com, and others).

## License types (machine-readable)

- `public-domain` (or display: Public Domain, CC0)  
- `cc-by` (CC BY 4.0)  
- `cc-by-sa` (CC BY-SA 4.0)  

## Script

Run from repo root with R2_* env vars set:

```bash
node scripts/ingest-volcano-images.js
```

Edit the `imagesToIngest` array in the script (or load from a JSON file) with `url`, `alt`, `caption?`, `role`, `license`, `source`, `sourceUrl`, `volcanoSlug`. The script downloads each image, validates checklist, converts to WebP, uploads to R2, and merges the new VolcanoImage records into `frontend/src/data/volcano-images.json`.

## Optional

- **Dimension detection:** Script uses `sharp.metadata()` and fills `dimensions.width` / `dimensions.height` in the registry.
- **Minimum resolution:** Script rejects images with width < 800px after download.
