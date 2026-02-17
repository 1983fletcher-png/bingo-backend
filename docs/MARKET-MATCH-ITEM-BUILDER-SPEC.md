# Market Match — Item Builder (Verified + Images Attached)

**Role:** Research assistant and content builder for the live price-guessing game Market Match.

**Goal:** Produce historically accurate items where each item includes:
- a **verified fact** (price or release year),
- an **image of the specific item from that era/year**, and
- a **“then vs now” comparison image + current price** where applicable.

---

## Reliability rules (apply first)

1. **No unstated assumptions:** If the year/model is not explicitly confirmed by the image caption or metadata, do not claim it matches.
2. **Every image must have a `why_this_matches`** that references caption/metadata or identifying visual cues.

---

## Hard rules (must follow)

| Rule | Requirement |
|------|-------------|
| **Truth-first** | Every factual claim (price, year, specs, size/weight) must be backed by a credible source. |
| **No guessing** | If you can’t verify, mark the field as unknown and explain what’s missing. |
| **Image-to-fact binding** | Every image must be explicitly tied to the correct year/era/model/variant in the item’s data. |
| **Licensing** | Prefer public domain, museum/archives, Wikimedia Commons, manufacturer press photos, or clearly reusable/press images. If license is unclear, flag it. |
| **Consistency** | If the “then” item is a specific year/model/packaging, the “now” comparison must be a **comparable product category** and clearly labeled as such (don’t pretend it’s the exact same SKU). |

---

## What to generate

Create **N items** (default 12) across a mix of categories:

- **Cars** — MSRP or typical price at time (label which)
- **Food/groceries** — price + package size/weight if possible
- **Tickets** — movie ticket, concert, amusement park
- **Consumer products** — toys, consoles, household items
- **Pop culture releases** — product release year, not price

Each item must include:

- A clean **prompt** for the host (“How much was X in YEAR?” or “What year did X launch?”)
- The **verified answer**
- **Multiple choice options** (4 options for price; 4 for year)
- One **“THEN” image** matching the year/era
- One **“NOW” image** for comparison (modern equivalent)
- **Bonus info** (optional): specs, trim, size, notable features
- A short **“fun fact”** line (optional but encouraged)
- A **confidence score** (0–100) based on source quality and match certainty

---

## Define “price” precisely

For each price-based item, specify **one** of:

| `price_type` | Meaning |
|--------------|--------|
| `msrp` | Manufacturer suggested retail price |
| `average_retail` | Typical shelf price at the time |
| `ticket_price_average` | National/industry average |
| `local_ad_price` | Specific ad — must state location + date |

**Pick one and label it. Do not mix them.**

---

## Item JSON schema (full)

```json
[
  {
    "id": "MM-1970-MUSTANG-001",
    "category": "car",
    "question_type": "price",
    "prompt": "In 1970, about how much did a new Ford Mustang cost (base MSRP)?",
    "year": 1970,
    "item_name": "1970 Ford Mustang (base model)",
    "answer": {
      "value": 2727,
      "unit": "USD",
      "price_type": "msrp",
      "notes": "Base MSRP for 1970 Mustang (specify body style if source does)."
    },
    "choices": [1995, 2727, 3195, 3995],
    "then": {
      "image": {
        "url": "https://…",
        "title": "1970 Ford Mustang promotional photo",
        "source_name": "Wikimedia Commons",
        "license": "CC BY-SA 4.0",
        "creator": "…",
        "date_or_year_depicted": 1970,
        "why_this_matches": "Depicts a 1970 Mustang (identify visible cues or caption confirmation).",
        "alt_text": "A 1970 Ford Mustang in a studio/road setting."
      },
      "verified_facts": [
        {
          "claim": "Base MSRP was $2,727 in 1970.",
          "source_url": "https://…",
          "source_name": "…",
          "evidence_quote": "… (<=25 words)",
          "source_type": "manufacturer/spec sheet/credible reference"
        }
      ],
      "bonus_specs": {
        "engine_example": "…",
        "trim_example": "…",
        "notes": "Only include if sourced."
      }
    },
    "now": {
      "comparison_item_name": "2026 Ford Mustang (entry trim) — comparable modern pony car",
      "current_price": {
        "value": 31500,
        "unit": "USD",
        "price_type": "msrp",
        "as_of_date": "2026-02-15",
        "source_url": "https://…"
      },
      "image": {
        "url": "https://…",
        "title": "Current Ford Mustang press image",
        "source_name": "Manufacturer press kit",
        "license": "Press/usage-permitted",
        "date_or_year_depicted": 2026,
        "why_this_matches": "Official press photo of current model year."
      }
    },
    "shrinkflation": {
      "included": false,
      "notes": ""
    },
    "confidence": 87,
    "host_notes": "If crowd asks: clarify MSRP vs dealer markups."
  }
]
```

---

## Verification standards (credible sources)

Use sources in this order:

1. **Manufacturer archives** / official press releases / spec sheets
2. **Government/industry reports** (e.g., average ticket prices, CPI sources)
3. **Reputable museums/archives** (Smithsonian, Library of Congress) for historical packaging imagery
4. **Major reference sites** with citations and editorial standards

Avoid random blogs unless they cite primary sources.

---

## Image sourcing requirements

**“THEN” image must match:**

- Correct **year** OR clearly correct **era** and the model/packaging described
- Caption/metadata should indicate the year or the specific product version

**“NOW” image must be:**

- Current **equivalent** product (and labeled “equivalent,” not “same”)

**For groceries/tickets:**

- Use period advertising, catalog scans, or archival photos when possible
- Include package weight/oz if you can source it

If you can’t find a compliant image, set `url` to `null` and explain in `why_this_matches`.

---

## Build variety

- At least **3** grocery/ticket examples where shrinkflation can be shown
- At least **3** big nostalgia items (console, toy, fast food, movie release)
- At least **2** “release year” questions (not price)

---

## Final check before output

For each item, confirm:

- [ ] The answer is backed by a source
- [ ] The then-image matches the year/variant
- [ ] The now-image is correctly labeled
- [ ] Choices include plausible distractors

---

## Category sets for batching

- **(A)** Groceries + shrinkflation pack (bread, cereal, soda, candy, chips, etc.)
- **(B)** Tickets pack (movie, concert, sports, theme park)
- **(C)** Big nostalgia pack (toys/consoles/fast food/items)
- **(D)** Mixed “best of” 12

**Difficulty:** easy (big gaps) | medium (close distractors) | hard (tight distractors)

Default if unspecified: **Mixed (D), medium.**

---

## Mapping to current seed (`marketMatchSeedData.ts`)

The live game uses a flatter structure. When importing from builder JSON:

| Builder field | Seed / dataset field |
|---------------|----------------------|
| `id` | `id` |
| `prompt` | `question` |
| `item_name` | `title` |
| `year` | `year` |
| `answer.value` | `priceUsd` |
| `answer.unit` / `answer.price_type` | `unit` (e.g. "MSRP", "per gallon") |
| `then.verified_facts[0].source_name` + URL | `citation` |
| `then.image.url` | `imageUrl` |
| `now.current_price.value` | `priceTodayUsd` |
| `now.image.url` | `imageUrlToday` (optional) |
| `host_notes` / short comparison | `funFact` |
| `choices` | used to build `options` + `correctIndex` in dataset |

See `frontend/src/data/marketMatchSeedData.ts` and `marketMatchDataset.ts` for the exact TypeScript types.

---

## Fully filled example and layout mock-up

- **One complete item (1970 Ford Mustang):** `docs/market-match-item-builder-example.json`
- **Layout mock-up (TV, player, interstitials):** open `frontend/public/market-match-mockup.html` in a browser, or when running the app visit `/market-match-mockup.html`. The mock-up shows: TV question, TV reveal, player question, player submitted, player reveal, and three interstitial screens (Next up, Round, Then vs Now).
