# Master image source whitelist

Public domain, CC licensed with commercial use, and government sources. **Only these are allowed at ingestion.** Reject everything else (NC, ND, paid stock, unclear license).

---

## 1. Source URL whitelist (enforced in code)

Ingestion **only** allows image URLs whose host matches one of these domains (subdomains allowed, e.g. `upload.wikimedia.org`, `images-assets.nasa.gov`):

| Domain | Category |
|--------|----------|
| wikimedia.org | Educational / encyclopedia |
| nasa.gov | Government / space & science |
| noaa.gov | Government / weather, oceans |
| usgs.gov | Government / geology, ecosystems |
| nih.gov | Government / medical, scientific |
| nps.gov | Government / nature, parks |
| fws.gov | Government / wildlife |
| si.edu | Smithsonian |
| loc.gov | Library of Congress |
| smithsonian.org | Smithsonian Open Access |
| getty.edu | Getty Open Content |
| metmuseum.org | Met Open Access |
| nypl.org | NYPL Digital Collections |
| britishlibrary.org | British Library |
| rawpixel.com | Public domain section |
| openverse.org | CC search aggregator |
| archive.org | Internet Archive |
| purl.org | DPLA / Europeana |
| europeana.eu | Europeana |
| calphotos.berkeley.edu | CalPhotos (filter by license) |
| eol.org | Encyclopedia of Life (filter CC0/PD only) |
| usda.gov | USDA / Plant Image Library |
| hubblesite.org | Hubble (NASA/PD) |
| eso.org | ESO (PD with attribution) |
| unsplash.com | Free commercial stock |
| pexels.com | Free commercial stock |
| pixabay.com | Free commercial stock |
| burst.shopify.com | Burst (Shopify) |

**In code:** `lib/imageIngest.js` exports `TRUSTED_SOURCES` (array of these strings). Validation: URL must **include** at least one (so subdomains match). See **INGESTION-CHECKLIST.md** and **IMAGE-INGESTION-PIPELINE.md**.

---

## 2. License whitelist

Only ingest images whose license is one of:

- **Public Domain**
- **CC0** (and CC0 1.0)
- **CC BY** (e.g. CC BY 4.0)
- **CC BY-SA** (e.g. CC BY-SA 4.0)

**Reject:** CC NC (Non-commercial), CC ND (No derivatives), unlicensed, paid-only, or unclear.

---

## 3. Attribution capture

For **CC BY** and **CC BY-SA**, store at ingestion:

- `source` — name of repository
- `sourceUrl` — URL of the image or source page
- `license` — e.g. "CC BY 4.0"
- `attribution` (optional) — short credit text
- `attributionName` (optional) — creator or institution name
- `attributionUrl` (optional) — link to creator/source

Registry type **ImageLicense** includes: `type`, `source`, `sourceUrl`, `attribution?`, `attributionName?`, `attributionUrl?`.

---

## 4. Reject list (never allow)

- NC (Non-commercial) licenses  
- ND (No derivatives) licenses  
- Paid stock sites  
- Sites without clear license metadata  
- Domains not on the source whitelist  

---

## 5. Categorized sources (reference)

### Government & national science

- NASA Image and Video Library — PD  
- NOAA Photo Library — PD  
- USGS Multimedia Gallery — PD  
- NIH Image Gallery — PD  
- National Park Service — PD  
- U.S. Fish & Wildlife Service — PD  

### Academic & museum (PD / CC0)

- Smithsonian Open Access  
- The Met Open Access  
- The Getty Open Content  
- British Library Images  
- NYPL Digital Collections  
- Europeana (filter to allowed license)  
- RawPixel Public Domain  
- National Archives (UK & US)  

### Educational & knowledge bases

- Wikimedia Commons — PD, CC0, CC BY, CC BY-SA  
- Openverse — CC0, CC BY, CC BY-SA  
- Internet Archive — mostly PD / CC  
- Biodiversity Heritage Library — PD  
- Project Gutenberg illustrations — PD  
- Creative Commons Search — filter to allowed only  

### Scientific & field-specific

- CalPhotos — many CC; filter allowed  
- Plant Image Library (USDA) — PD  
- Encyclopedia of Life — filter CC0/PD only  
- ESO — many PD with attribution  
- HubbleSite — many PD  

### Free commercial stock (context images)

- Unsplash, Pexels, Pixabay, Burst — filter by license; good for context, not always for scientific diagrams.

---

## 6. How this plugs into the pipeline

1. **Fetch** candidate image URL.  
2. **Check URL** against `TRUSTED_SOURCES` → if no match, **reject**.  
3. **Retrieve/capture license** (from metadata or input). If not PD/CC0/CC BY/CC BY-SA → **reject**.  
4. **Normalize & upload** to R2; **register** with license + attribution.  
5. **Tags/concepts** stored for trivia and discovery.
