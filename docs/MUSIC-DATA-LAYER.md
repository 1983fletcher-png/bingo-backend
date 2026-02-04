# Music Data Layer — Trusted APIs & Integration

**Goal:** Use **trusted music databases and APIs** so Music Bingo, music trivia, and future edutainment (piano, guitar, drums, music theory) are built on **real statistics, rankings, and metadata**—not sloppy or made-up lists. Copyright-safe: we use **metadata and facts only** (titles, artists, years, chart positions, popularity); we do not reproduce lyrics or stream audio.

This doc aligns with **The Playroom** vision: Music Bingo, music trivia, fun facts, and teaching music as core pillars.

---

## What We Need From Music Data

| Need | Example | Copyright-safe? |
|------|--------|-----------------|
| **Song lists by theme** | "Top 75 kids songs that make kids bounce" | ✅ Titles + artists + year = metadata |
| **Rankings / charts** | Billboard-style "top 100", "most played" | ✅ Chart position and title/artist are factual |
| **Metadata** | Artist, title, album, release year | ✅ Standard catalog data |
| **Statistics** | Popularity, play counts, "trending" | ✅ Numbers and rankings |
| **Tags / genres** | "family-friendly", "dance", "80s" | ✅ Categorization |
| **Audio features** | Energy, danceability, valence (Spotify) | ✅ Derived metrics, no audio reproduced |
| **Key, tempo, time signature** | Key (e.g. C major), BPM, 4/4 (Spotify) | ✅ Supports learning, song structure, “what to play next” |
| **Lyrics** | Full text of songs | ❌ High copyright risk — we do **not** use |
| **Audio streaming** | Playing the song in our app | ❌ We do not host or stream; we link to licensed services where appropriate |

**We only integrate APIs that give us metadata, rankings, and statistics.** No lyrics APIs; no audio reproduction.

**Rich data for learning:** We include **as much data as possible** per track (key, tempo, time signature, energy, danceability, year, source) so teaching (piano, guitar, drums, theory) and “what song to play next” are thorough and fact-driven. Some data (e.g. chart position, popularity) is **regional or situational**; we cite the source and accept variation rather than claiming universal truth.

---

## Trusted Music Sources — Status & Options

### 1. **Spotify Web API** ✅ Recommended when available (Phase 1)

- **What it provides:** Track search, track metadata (name, artist, album, release date), **popularity** (0–100), **audio features** (key, tempo, energy, danceability, valence). Playlist/top tracks by genre or mood. No lyrics in standard API.
- **Access:** Free; requires **Spotify Developer account** and **Client Credentials** flow. Rate limits are generous for metadata. **Note:** Spotify sometimes puts new app creation on hold ("new integrations are currently on hold while we make updates to improve reliability and performance"). When that’s the case, the music layer still works using **MusicBrainz only** (year, canonical artist/title); key/tempo/energy come back when you add Spotify credentials later. No code changes required—just set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` when you have them.
- **Use cases:** "Top songs by tag", "high energy / danceable", artist/title/year and **key/tempo** for bingo, trivia, and teaching. We search and get popularity-ranked results with audio features.
- **Copyright:** Using track names, artist names, and popularity/features is metadata. We do not stream or embed; we only store and display titles/artists and use stats to rank. Compliant with Spotify Developer ToS when we use data for display and recommendation, not redistribution of audio.

### 2. **MusicBrainz** ✅ Recommended (Phase 1)

- **What it provides:** Huge **open** music metadata database: artists, releases, recordings, release dates, IDs. No chart data; excellent for **canonical "artist / title / year"** and disambiguation.
- **Access:** Free; **no API key** for basic use. Rate limit: 1 req/sec (we throttle). User-Agent required.
- **Use cases:** Enrich song lists with correct release year, canonical artist name, and a stable ID. Cross-reference with Spotify (e.g. match by title+artist). Foundation for "song facts" and trivia (e.g. "Released in 1985").
- **Copyright:** All metadata; no audio/lyrics. License: CC0 / public domain for the data.

### 3. **Last.fm API** ✅ Recommended (Phase 1 or 2)

- **What it provides:** **Charts** (top tracks by tag, by country), **track.getInfo** (play counts, listeners), **tag-based** search (e.g. "kids", "dance", "80s"). Strong for "top by tag" and play-count-style rankings.
- **Access:** Free **API key** (get at last.fm/api). Rate limits apply.
- **Use cases:** "Top 75 kids songs" → tag "kids" or "family-friendly" and take top N by play count. "Top 80s dance" → tag "80s" + "dance". Complements Spotify (different ranking signal).

### 4. **Billboard** ⚠️ No Official API

- **Reality:** Billboard does **not** offer an official public API. Chart data is published on billboard.com only.
- **Options:**  
  - **Third-party / licensed:** Some API marketplaces (e.g. Zyla) offer "Billboard Charts API" — not run by Billboard; verify license and terms.  
  - **Curated datasets:** Historical Billboard chart data exists in open datasets (e.g. Kaggle) or community archives; we could **ingest once** into our own DB (see TRUSTED-FACTS-DATABASE.md) and use for "chart position" and "year" in trivia/facts.  
  - **Alternatives for "chart feel":** Last.fm and Spotify give us **popularity-ranked** lists that feel like "charts" (top by plays, top by popularity). We can label these as "Top by plays (Last.fm)" or "Popular on Spotify" so users still get trusted, ranked lists.

**Recommendation:** Do **not** scrape billboard.com (ToS and legal risk). Use Last.fm + Spotify for rankings and "top lists"; if we need real Billboard chart positions later, use a licensed provider or a one-time ingestion of a licensed/legal dataset into our fact DB.

### 5. **YouTube Data API** ⚠️ Optional (Phase 2)

- **What it provides:** Search videos by query, **view counts**, titles, channel. No direct "music chart" but we can get "most viewed" or "trending" for a song title + artist.
- **Access:** **API key** (Google Cloud); **quota** limits. Best for "statistics" (views) rather than primary source for song lists.
- **Use cases:** "This song has X million views" as a trivia fact; or secondary signal for "popularity." Not required for "top 75 kids songs" — Spotify + Last.fm are enough for that.
- **Copyright:** We use only metadata (title, view count); we do not embed or play video in a way that violates ToS. Linking to YouTube is standard practice.

### 6. **Pandora & iHeartRadio** — not available for our use

- **Pandora:** Exposes GraphQL APIs for metadata and playback, but access is **partner-only** (OAuth, approved partners). There is no public developer program for third-party apps like Playroom to pull statistics or metadata. See [Pandora developer docs](https://developer.pandora.com/docs/key-concepts/apis). We cannot integrate Pandora unless we become an official partner.
- **iHeartRadio:** A public developer API existed briefly (around 2012) but is **no longer publicly available or supported**. The developer portal is discontinued or restricted, so we cannot get statistics or metadata from iHeartRadio. Alternatives for a "broad spectrum" are the sources we do integrate: **MusicBrainz, Last.fm, and Spotify** (when available).

We use every **open, legal source** we can so the layer is as thorough and broad as possible within those constraints.

### 7. **Others (Later)**

- **Apple Music (MusicKit):** Catalog search and metadata; requires Apple Developer account. Alternative to Spotify if we want a second "popularity" source.
- **Discogs:** Strong for catalog (releases, years, genres); API available. More collector-oriented; useful for "release year" and genre.
- **AcousticBrainz:** Audio features (derived from MusicBrainz + audio analysis). Could support "energy / mood" for filtering.

---

## Architecture: Music Data Layer in the Backend

### Purpose

- **Single place** that talks to Spotify, MusicBrainz, Last.fm (and later others).
- **Normalized output** for the rest of the app: e.g. `{ artist, title, year?, popularity?, source?, key?, tempo?, timeSignature?, energy?, danceability?, chartRank? }[]`. **Key** (e.g. "C major", "A minor"), **tempo** (BPM), and **time_signature** support learning and “what to play next.”
- Used by:
  - **Music Bingo:** "Give me 75 songs for theme X" → call music layer with theme/tags, get ranked list; optionally blend with AI (e.g. AI suggests theme, we fill from APIs).
  - **Music trivia / song facts:** "Fact for this song" → MusicBrainz for year, Last.fm or Spotify for "play count" or "popularity" so we can show "Released in 1985", "One of the most streamed songs in its decade."
  - **Future edutainment:** Teaching piano/guitar/drums/music theory can use the same **metadata** (e.g. "songs in 4/4", "key of C") from APIs or our own DB later; no change to the principle of "metadata only."

**Teaching & learning:** The more metadata we have (key, tempo, time signature, energy, danceability, year, playCount, tags), the more we can build **custom learning experiences** for different audiences—kids, teenagers, adults, seniors. We can filter by key for theory lessons, by tempo for "easy to play first," by tags for age- or mood-appropriate sets, and design progressions that are **simple, approachable, and psychology-informed** (e.g. low-friction start, gradual complexity). The layer is built to expose as much of this as possible so teaching modules can stay data-driven and adaptable.

### Proposed Module: `lib/musicDataLayer.js` (or `lib/music/`)

- **`searchTopTracks(opts)`**  
  `opts`: `{ tag?, genre?, decade?, limit?, familyFriendly? }`.  
  Calls Spotify and/or Last.fm; returns normalized list including `key`, `tempo`, `timeSignature`, `energy`, `danceability` when available.

- **`enrichTrack(artist, title)`**  
  Given artist + title, fetch from MusicBrainz (year, canonical name) and Spotify (key, tempo, time_signature, popularity). Returns one normalized track with as much data as possible for learning and “what to play next.”

- **`getChartStyleList(opts)`**  
  "Chart-style" list: e.g. "Top 75 by tag X" from Last.fm, or "Top 75 by Spotify popularity for genre Y." Returns same normalized shape. This is what powers "top 75 kids songs that make kids bounce" (e.g. tag "kids" + high energy/danceability from Spotify).

- **Configuration:** API keys in env (e.g. `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `LASTFM_API_KEY`). MusicBrainz needs only User-Agent. If a key is missing, the layer skips that source and uses the others (or falls back to current AI-only generation).

### Integration With Current Flow

- **`POST /api/generate-songs`** (current): Uses OpenAI to generate 75 songs. We can:
  - **Option A (Phase 1):** Keep AI as primary; add an **optional** "boost from music APIs": after AI returns a list, we **enrich** each track with year/popularity from MusicBrainz/Spotify and sort or filter by popularity so the final list feels "chart-backed."
  - **Option B (Phase 2):** For themes like "top 75 kids songs" or "top 80s dance," call the **music data layer first** to get a ranked list from Spotify/Last.fm; if we get enough results, return that (or blend with AI for variety). AI remains for themes that APIs don’t cover well (e.g. "TV theme songs", "video game music").

- **Song facts / trivia:** Today we have a small static map. We can replace or extend it with:
  - MusicBrainz: release year, album.
  - Last.fm / Spotify: "One of the top streamed tracks in …", "Peak chart position …" (when we have chart data from Last.fm or a licensed source).

---

## Phased Plan

| Phase | What we do | User-facing result |
|-------|------------|--------------------|
| **1 – Foundation** | Add `lib/musicDataLayer.js` (or `lib/music/`). Integrate **Spotify** (search + popularity + audio features) and **MusicBrainz** (enrich artist/title/year). Env vars for keys; no key = skip that source. | No change yet, or optional "enrich with real metadata" in generate-songs. |
| **2 – Top lists from APIs** | Add **Last.fm** (charts by tag). Implement `getChartStyleList({ tag, limit })` and optional `searchTopTracks`. Wire "top 75 kids songs" / "top 80s" style prompts to pull from these APIs when possible. | "Give me top 75 kids songs that make kids bounce" returns a list backed by Spotify + Last.fm (tags + energy/danceability). |
| **3 – Chart feel & facts** | Add "chart position" or "play count" to normalized output where available. Use in song facts ("Released in …", "Top 10 in …"). Optionally ingest a **licensed or open Billboard-style dataset** into our fact DB for real chart positions. | Trivia and song facts show year, chart info, and popularity from trusted sources. |
| **4 – Teaching & edutainment** | Reuse same metadata (and any future "music theory" or "instrument" tags from our DB or APIs) for piano/guitar/drums/theory modules. No new music APIs required for basic metadata; we may add lesson content separately. | Music remains one trusted data layer across bingo, trivia, and teaching. |

---

## Copyright & ToS Summary

- **We use:** Track and artist names, release years, chart positions, play counts, popularity scores, audio features (energy, danceability), tags. This is **metadata and factual statistics.**
- **We do not:** Store or display full lyrics; stream or host audio; redistribute audio. We can **link** to Spotify/YouTube/Apple Music for "listen here" if we do so within their branding/embed rules.
- **Attribution:** We will credit data sources where required (e.g. "Chart data from Last.fm", "Metadata from MusicBrainz", "Popularity from Spotify"). This builds trust and complies with typical API terms.

---

## Phase 1 implemented (MusicBrainz + Spotify + Last.fm)

- **`lib/musicDataLayer.js`** — **MusicBrainz** (year, canonical artist/title; no key), **Spotify** (key, tempo, time_signature, energy, danceability, popularity; optional when new apps are available), **Last.fm** (playCount, listeners, tags; optional with `LASTFM_API_KEY`). Single normalized shape with as much data as we can get.
- **Exports:** `enrichTrack(artist, title)`, `enrichTracks(tracks[])`, `searchTopTracks({ query, limit })`, **`getChartStyleList({ tag, limit })`** — chart-style list by tag (e.g. "80s", "kids", "dance") from Last.fm. Normalized shape includes **key**, **tempo**, **timeSignature**, **energy**, **danceability**, **year**, **popularity**, **playCount**, **listeners**, **tags**, **source**.
- **Endpoint:** `GET /api/song-metadata?artist=...&title=...` returns one enriched track (key, tempo, year, playCount, tags, etc.) for display, song facts, or learning.
- **.env.example** documents `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `LASTFM_API_KEY` (get key at [last.fm/api](https://www.last.fm/api/account/create)).

## Next steps (Phase 2+)

- From `generate-songs`, optionally call `enrichTracks(songs)` to add key/tempo/year to AI output (or expose “Enrich with metadata” in the host UI).
- Add Last.fm, implement `getChartStyleList` for "top 75 by tag" and wire to generate-songs for theme-based requests.

This gives you a **proper, trusted music foundation** for Music Bingo, music trivia, and future music edutainment—without copyright issues and with a path to Billboard-style data via licensed or open datasets later.
