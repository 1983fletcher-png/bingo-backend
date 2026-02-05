import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { customAlphabet } from 'nanoid';
import { PDFParse } from 'pdf-parse';
import { generateSongs } from './lib/ai.js';
import { fetchTrustedSources } from './lib/trustedSources.js';
import { enrichTrack, getChartStyleList } from './lib/musicDataLayer.js';
import { getObservancesForYear, getUpcoming, CATEGORIES } from './lib/holidaysAndObservancesUS.js';

/** Heuristic: turn raw menu text into { sections: [ { name, items: [ { name, price? } ] } ] } for menu builder. */
function parseMenuText(rawText) {
  const lines = rawText.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const sectionNames = new Set([
    'appetizers', 'starters', 'soups', 'salads', 'mains', 'entrees', 'entrées', 'sides',
    'desserts', 'drinks', 'beverages', 'cocktails', 'wine', 'beer', 'specials', 'today\'s specials',
    'breakfast', 'lunch', 'dinner', 'brunch', 'kids', 'children', 'sides & more', 'extras'
  ]);
  const sections = [];
  let currentSection = { name: 'Menu', items: [] };
  const priceRe = /(\$?\s*\d+\.?\d*)\s*$/;
  for (const line of lines) {
    const lower = line.toLowerCase();
    const possibleSection = lower.replace(/[:\s]+$/, '').replace(/^#+\s*/, '');
    if (line.length <= 50 && (sectionNames.has(possibleSection) || /^(apps|mains|sides|drinks|desserts)$/.test(possibleSection))) {
      if (currentSection.items.length > 0 || currentSection.name !== 'Menu') {
        sections.push(currentSection);
      }
      currentSection = { name: line.replace(/:$/, '').trim() || 'Section', items: [] };
      continue;
    }
    const priceMatch = line.match(priceRe);
    let name = line;
    let price = '';
    if (priceMatch && line.length < 120) {
      price = priceMatch[1].trim();
      name = line.slice(0, priceMatch.index).trim().replace(/\s*[–\-]\s*$/, '');
    }
    if (name.length > 0 && name.length < 200) {
      currentSection.items.push(price ? { name, price } : { name });
    }
  }
  if (currentSection.items.length > 0 || currentSection.name !== 'Menu') {
    sections.push(currentSection);
  }
  if (sections.length === 0) {
    sections.push({ name: 'Items', items: lines.slice(0, 50).filter((l) => l.length > 1 && l.length < 200).map((name) => ({ name })) });
  }
  return { sections };
}

const nanoidCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// Root: so opening the backend URL in a browser shows something friendly
app.get('/', (_, res) => res.redirect(302, '/health'));

// Health check for Railway/Render
app.get('/health', (_, res) => res.json({ ok: true }));

app.get('/api/public-url', (_, res) => {
  res.json({ publicOrigin: process.env.PUBLIC_ORIGIN || null });
});

// Scrape venue site for logo, colors, title, description (public meta tags only).
// Legal: we only fetch publicly available meta tags; no content scraping. Use only with sites you have permission to reference.
// Use browser-like headers so older sites and simple WAFs don't 403 us (we only read public meta, no JS/crawling).
const SCRAPE_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];
const SCRAPE_HEADERS = (userAgent) => ({
  'User-Agent': userAgent,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
});

app.get('/api/scrape-site', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query' });
  }
  try {
    const u = new URL(url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    let resp;
    let lastStatus;
    for (let i = 0; i < SCRAPE_USER_AGENTS.length; i++) {
      resp = await fetch(u.href, {
        headers: SCRAPE_HEADERS(SCRAPE_USER_AGENTS[i]),
        redirect: 'follow',
        signal: AbortSignal.timeout(12000)
      });
      lastStatus = resp.status;
      if (resp.ok) break;
      if (resp.status !== 403 && resp.status !== 406) break;
    }
    if (!resp.ok) {
      return res.status(502).json({ error: `Site returned ${lastStatus}. We only read public meta tags. Try a different URL or contact the venue.` });
    }
    const html = await resp.text();
    const baseUrl = resp.url || u.href;

    function resolveHref(href) {
      if (!href || !href.trim()) return null;
      try {
        return new URL(href.trim(), baseUrl).href;
      } catch {
        return null;
      }
    }

    function metaContent(patterns) {
      for (const re of patterns) {
        const m = html.match(re);
        if (m && m[1]) return m[1].trim().replace(/^["']|["']$/g, '');
      }
      return null;
    }

    // Logo: og:image, twitter:image, apple-touch-icon, favicon — works across WordPress, Wix, Squarespace, custom, etc.
    const logoUrl = resolveHref(
      metaContent([
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
        /<link[^>]+rel=["'](?:apple-touch-icon|icon)["'][^>]+href=["']([^"']+)["']/i,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon)["']/i
      ])
    );
    const themeColor = metaContent([
      /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i
    ]);
    const title = metaContent([
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i
    ]);
    const description = metaContent([
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
    ]);

    // Optional: extract links from page (public <a href>) for menu, events, social — legal/respectful, no deep scraping
    let foodMenuUrl = null;
    let drinkMenuUrl = null;
    let eventsUrl = null;
    let facebookUrl = null;
    let instagramUrl = null;
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)</gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = (match[1] || '').trim();
      const text = (match[2] || '').toLowerCase();
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;
      const full = resolveHref(href);
      if (!full) continue;
      const lower = full.toLowerCase();
      if (!facebookUrl && (lower.includes('facebook.com') || lower.includes('fb.com'))) facebookUrl = full;
      else if (!instagramUrl && lower.includes('instagram.com')) instagramUrl = full;
      else if (!foodMenuUrl && (text.includes('food') || text.includes('menu') || lower.includes('menu') || lower.includes('food'))) foodMenuUrl = full;
      else if (!drinkMenuUrl && (text.includes('drink') || text.includes('bar') || text.includes('cocktail') || lower.includes('drink') || lower.includes('bar'))) drinkMenuUrl = full;
      else if (!eventsUrl && (text.includes('event') || text.includes('calendar') || lower.includes('event') || lower.includes('calendar'))) eventsUrl = full;
    }
    // Also check meta for social (some themes put them in og or link)
    if (!facebookUrl) {
      const fb = metaContent([/<link[^>]+href=["']([^"']*facebook[^"']*)["']/i, /<meta[^>]+content=["']([^"']*facebook[^"']*)["']/i]);
      if (fb) facebookUrl = resolveHref(fb) || fb;
    }
    if (!instagramUrl) {
      const ig = metaContent([/<link[^>]+href=["']([^"']*instagram[^"']*)["']/i, /<meta[^>]+content=["']([^"']*instagram[^"']*)["']/i]);
      if (ig) instagramUrl = resolveHref(ig) || ig;
    }

    const result = {
      logoUrl: logoUrl || null,
      colors: themeColor ? [themeColor] : [],
      title: title || null,
      description: description || null,
      siteUrl: baseUrl,
      foodMenuUrl: foodMenuUrl || null,
      drinkMenuUrl: drinkMenuUrl || null,
      eventsUrl: eventsUrl || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      disclaimer: 'We only fetch public meta tags and visible links. Use only with sites you have permission to reference. Data is not stored on our servers.'
    };
    res.json(result);
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out' : (err.message || 'Failed to fetch URL');
    res.status(500).json({ error: message });
  }
});

// Fetch a page's text content (for menu import). Public HTML only; strip tags, return lines.
// Uses same browser-like headers as scrape-site for consistency and to avoid 403s on older sites.
app.get('/api/fetch-page-text', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query' });
  }
  try {
    const u = new URL(url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    let resp;
    let lastStatus;
    for (let i = 0; i < SCRAPE_USER_AGENTS.length; i++) {
      resp = await fetch(u.href, {
        headers: SCRAPE_HEADERS(SCRAPE_USER_AGENTS[i]),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });
      lastStatus = resp.status;
      if (resp.ok) break;
      if (resp.status !== 403 && resp.status !== 406) break;
    }
    if (!resp.ok) {
      return res.status(502).json({ error: `Page returned ${lastStatus}.` });
    }
    const html = await resp.text();
    const text = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    res.json({ text: text.slice(0, 50000) });
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out' : (err.message || 'Failed to fetch');
    res.status(500).json({ error: message });
  }
});

// Parse a menu page URL into structured sections/items for the menu builder (Phase B).
// Fetches page text, then heuristically extracts sections and items (names, optional prices).
// Returns data in menu-builder shape: { sections: [ { name, items: [ { name, description?, price? } ] } ] }.
app.get('/api/parse-menu-from-url', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query' });
  }
  try {
    const u = new URL(url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    let resp;
    let lastStatus;
    for (let i = 0; i < SCRAPE_USER_AGENTS.length; i++) {
      resp = await fetch(u.href, {
        headers: SCRAPE_HEADERS(SCRAPE_USER_AGENTS[i]),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });
      lastStatus = resp.status;
      if (resp.ok) break;
      if (resp.status !== 403 && resp.status !== 406) break;
    }
    if (!resp.ok) {
      return res.status(502).json({ error: `Page returned ${lastStatus}.` });
    }
    const html = await resp.text();
    const rawText = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\s+/g, ' ')
      .replace(/\n/g, '\n')
      .trim();
    const { sections } = parseMenuText(rawText);
    res.json({ sections, sourceUrl: u.href });
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out' : (err.message || 'Failed to fetch');
    res.status(500).json({ error: message });
  }
});

// Parse menu from uploaded file (PDF or image). Phase B: upload → extract for menu builder.
// Body: { file: base64String, mimeType: 'application/pdf' | 'image/jpeg' | ... }. PDF: extract text and parse. Image: OCR not yet implemented.
app.post('/api/parse-menu-from-file', express.json({ limit: '15mb' }), async (req, res) => {
  const fileB64 = req.body?.file;
  const mimeType = (req.body?.mimeType || '').toLowerCase();
  if (!fileB64 || typeof fileB64 !== 'string') {
    return res.status(400).json({ error: 'Missing file (base64 string) in body' });
  }
  try {
    const buffer = Buffer.from(fileB64, 'base64');
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty file data' });
    }
    if (mimeType.includes('pdf') || (!mimeType && buffer.slice(0, 5).toString() === '%PDF-')) {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      await parser.destroy();
      const rawText = (result?.text || '').replace(/\s+/g, ' ').trim();
      const { sections } = parseMenuText(rawText);
      return res.json({ sections, source: 'pdf' });
    }
    if (mimeType.startsWith('image/')) {
      return res.status(501).json({
        error: 'Image OCR is not yet implemented. Use a PDF of your menu or paste the menu page URL.',
        code: 'IMAGE_OCR_NOT_IMPLEMENTED'
      });
    }
    return res.status(400).json({ error: 'Unsupported file type. Use application/pdf or an image (image OCR coming later).' });
  } catch (err) {
    const message = err.message || 'Failed to parse file';
    res.status(500).json({ error: message });
  }
});

// Phase C: Observances API for theme picker and activity director calendar.
// Forward-looking only: use from = current date (e.g. 2026-02-04) so we never suggest past holidays.
// GET /api/observances/upcoming?from=2026-02-04&days=30&category=music
app.get('/api/observances/upcoming', (req, res) => {
  const fromParam = req.query.from;
  const from = fromParam ? String(fromParam).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 14));
  const category = req.query.category ? String(req.query.category) : null;
  const categoryFilter = category && Object.values(CATEGORIES).includes(category) ? category : null;
  try {
    const list = getUpcoming(from, days, categoryFilter);
    res.json({ from, days, observances: list });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Invalid parameters' });
  }
});

// GET /api/observances/calendar?year=2026&month=2&category=...
app.get('/api/observances/calendar', (req, res) => {
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const category = req.query.category ? String(req.query.category) : null;
  const categoryFilter = category && Object.values(CATEGORIES).includes(category) ? category : null;
  if (!year || year < 2020 || year > 2030) {
    return res.status(400).json({ error: 'Valid year (2020–2030) required' });
  }
  if (!month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Valid month (1–12) required' });
  }
  try {
    const list = getObservancesForYear(year, categoryFilter);
    const forMonth = list.filter((o) => o.month === month);
    res.json({ year, month, observances: forMonth });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Invalid parameters' });
  }
});

// Page Builder: save document for shareable link (in-memory; optional DB later)
const pageBuilderDocs = new Map();
const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
app.post('/api/page-builder/save', (req, res) => {
  const document = req.body?.document;
  if (!document || typeof document !== 'object') {
    return res.status(400).json({ error: 'Missing document body' });
  }
  const slug = nanoidSlug();
  pageBuilderDocs.set(slug, { document, createdAt: Date.now() });
  res.json({ slug });
});
app.get('/api/page-builder/:slug', (req, res) => {
  const entry = pageBuilderDocs.get(req.params.slug);
  if (!entry) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(entry.document);
});

// Music Bingo: AI-generated song list (75 songs, one per artist, theme-aware)
app.post('/api/generate-songs', async (req, res) => {
  const { prompt = '', familyFriendly = false, count = 75 } = req.body || {};
  const apiKey = req.body?.apiKey ?? req.headers?.['x-openai-api-key'] ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key required. Send apiKey in body or x-openai-api-key header, or set OPENAI_API_KEY.' });
  }
  try {
    const { songs, raw } = await generateSongs({
      prompt: typeof prompt === 'string' ? prompt : '',
      familyFriendly: Boolean(familyFriendly),
      count: typeof count === 'number' ? count : 75,
      apiKey: String(apiKey)
    });
    res.json({ songs, raw });
  } catch (err) {
    const status = err.message?.includes('API key') ? 401 : err.message?.includes('OpenAI') ? 502 : 500;
    res.status(status).json({ error: err.message || 'Failed to generate songs' });
  }
});

// Song fact / trivia tidbit for "pop-up video" style when host reveals a song (Music Bingo)
// Optional: frontend calls GET /api/song-fact?artist=...&title=... and shows the fact below the grid.
// Extend with DB or external API later; for now returns placeholder or static entries.
const SONG_FACTS = new Map([
  ['Hey Jude|The Beatles', 'Recorded at Trident Studios in London; the "na na na" coda was partly improvised.'],
  ['Bohemian Rhapsody|Queen', 'Freddie Mercury wrote the song in the 1970s; the operatic section has no chorus.'],
]);
function getSongFact(artist, title) {
  if (!artist || !title) return null;
  const key = `${String(title).trim()}|${String(artist).trim()}`;
  return SONG_FACTS.get(key) || null;
}
app.get('/api/song-fact', (req, res) => {
  const artist = req.query.artist;
  const title = req.query.title;
  const fact = getSongFact(artist, title);
  res.json({ fact: fact || null });
});

// Song metadata (key, tempo, year, playCount, tags, etc.) from MusicBrainz + Spotify + Last.fm.
app.get('/api/song-metadata', async (req, res) => {
  const artist = req.query.artist;
  const title = req.query.title;
  if (!artist || !title) {
    return res.status(400).json({ error: 'Missing artist or title query' });
  }
  try {
    const track = await enrichTrack(artist, title);
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch metadata' });
  }
});

// Chart-style top tracks by tag (Last.fm), e.g. ?tag=kids&limit=75 for "top 75 kids songs".
app.get('/api/top-tracks-by-tag', async (req, res) => {
  const tag = req.query.tag;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);
  if (!tag || typeof tag !== 'string' || !tag.trim()) {
    return res.status(400).json({ error: 'Missing or invalid tag query' });
  }
  try {
    const tracks = await getChartStyleList({ tag: tag.trim(), limit });
    res.json({ tag: tag.trim(), tracks });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch top tracks' });
  }
});

// =============================================================================
// AI Builder (Phase 1: private drafts + export; no public library yet)
// =============================================================================
// Non‑negotiable: anything presented as factual must be cross‑referenced.
// In Phase 1, we enforce this at "publish/share" time. Draft/local play may
// contain unverified facts, but they are marked UNVERIFIED and must not be shared.

const AI_BUILDER_ALLOWED_BUILDS = ['trivia_pack', 'myth_vs_truth', 'icebreakers', 'edutainment'];

function toStr(x) {
  return typeof x === 'string' ? x : '';
}

function normalizeIntent(body) {
  const intent = body?.intent && typeof body.intent === 'object' ? body.intent : {};
  return {
    build: toStr(intent.build),
    title: toStr(intent.title),
    venue_type: Array.isArray(intent.venue_type) ? intent.venue_type.filter((v) => typeof v === 'string') : [],
    audience: intent.audience && typeof intent.audience === 'object' ? intent.audience : {},
    duration_minutes: Number.isFinite(intent.duration_minutes) ? intent.duration_minutes : undefined,
    energy_waveform: Array.isArray(intent.energy_waveform) ? intent.energy_waveform.filter((v) => typeof v === 'string') : [],
    notes: toStr(intent.notes),
  };
}

function nextQuestionsForIntent(intent) {
  const questions = [];

  if (!AI_BUILDER_ALLOWED_BUILDS.includes(intent.build)) {
    questions.push({
      id: 'build',
      prompt: 'What are you building?',
      type: 'single_select',
      options: [
        { id: 'trivia_pack', label: 'Trivia pack (fact-checked + explanations)' },
        { id: 'myth_vs_truth', label: 'Myth vs Truth (gentle explanations + prompts)' },
        { id: 'icebreakers', label: 'Icebreakers (opinion/story prompts)' },
        { id: 'edutainment', label: 'Edutainment (teach-then-check)' },
      ],
    });
  }

  if (!intent.title) {
    questions.push({
      id: 'title',
      prompt: 'What is the title/theme?',
      type: 'text',
      placeholder: 'e.g., 80s Night, Curiosity & Shared Truths, Team Night',
    });
  }

  const minAge = Number.isFinite(intent.audience?.min_age) ? intent.audience.min_age : undefined;
  const maxAge = Number.isFinite(intent.audience?.max_age) ? intent.audience.max_age : undefined;
  if (!(minAge >= 0) || !(maxAge >= 0)) {
    questions.push({
      id: 'audience',
      prompt: 'Who is this for?',
      type: 'audience_range',
      fields: [
        { id: 'min_age', label: 'Min age', type: 'number', default: 4 },
        { id: 'max_age', label: 'Max age', type: 'number', default: 99 },
        { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Mixed ages, family-friendly' },
      ],
    });
  }

  if (!intent.venue_type?.length) {
    questions.push({
      id: 'venue_type',
      prompt: 'Where is this being hosted?',
      type: 'multi_select',
      options: [
        { id: 'brewery', label: 'Brewery' },
        { id: 'sports_bar', label: 'Sports bar' },
        { id: 'school', label: 'School' },
        { id: 'library', label: 'Library' },
        { id: 'home', label: 'Home' },
      ],
      allow_multiple: true,
    });
  }

  if (!Number.isFinite(intent.duration_minutes)) {
    questions.push({
      id: 'duration_minutes',
      prompt: 'How long should it run?',
      type: 'number',
      min: 5,
      max: 120,
      default: 30,
    });
  }

  // Energy waveform (optional in Phase 1; we can auto-fill defaults).
  return { done: questions.length === 0, questions };
}

// Optional: GET so you can verify AI Builder backend in browser (e.g. .../api/ai-builder/health)
app.get('/api/ai-builder/health', (_, res) => res.json({ ok: true, service: 'ai-builder' }));

app.post('/api/ai-builder/next-questions', (req, res) => {
  const intent = normalizeIntent(req.body);
  const result = nextQuestionsForIntent(intent);
  res.json({ intent, ...result });
});

// Phase 1 generator: returns a skeleton "experience spec" plus draft nodes.
// UI can iterate without needing the full AI generation step yet.
app.post('/api/ai-builder/generate', (req, res) => {
  const intent = normalizeIntent(req.body);
  const { done } = nextQuestionsForIntent(intent);
  if (!done) {
    return res.status(400).json({ error: 'Intent incomplete. Call /api/ai-builder/next-questions first.', intent });
  }

  const experience = {
    experience_id: `draft-${Date.now()}`,
    title: intent.title || 'Untitled',
    venue_type: intent.venue_type?.length ? intent.venue_type : ['home'],
    audience: {
      min_age: Number.isFinite(intent.audience?.min_age) ? intent.audience.min_age : 4,
      max_age: Number.isFinite(intent.audience?.max_age) ? intent.audience.max_age : 99,
      notes: toStr(intent.audience?.notes) || 'Mixed ages, family-friendly',
    },
    core_theme: intent.build === 'myth_vs_truth' ? 'Curiosity & Shared Truths' : 'Play, Learn, Connect',
    energy_waveform: [
      'arrival_calm',
      'gentle_engagement',
      'curiosity_build',
      'competitive_spike',
      'community_release',
      'warm_close',
    ],
    modules: [
      {
        module_id: 'arrival_01',
        type: 'warm_up',
        energy_level: 'low',
        interaction_style: 'discussion',
        question_format: 'open_prompt',
        content: {
          prompt: 'What’s something you believed as a kid that you later updated?',
          visuals_optional: true,
        },
        host_guidance: {
          tone: 'calm',
          instructions: 'Let tables talk for 30–60 seconds. No answers collected.',
        },
      },
    ],
    scoring: {
      competitive_weight: 0.2,
      participation_weight: 0.8,
      notes: 'Competition is optional; participation and conversation are primary.',
    },
    printable_assets: true,
    localization_ready: true,
    accessibility_notes: 'Can be run without screens; host reads prompts aloud.',
  };

  // Draft nodes (intentionally minimal in Phase 1)
  const draft_nodes = [
    {
      id: `node-${Date.now()}`,
      claim_type: intent.build === 'icebreakers' ? 'opinion_prompt' : 'factual_claim',
      type: intent.build === 'myth_vs_truth' ? 'myth_vs_truth' : 'fact',
      title: 'Draft question',
      primaryClaim: 'Replace with a real claim/prompt',
      verifiedAnswer: intent.build === 'icebreakers' ? null : null,
      explanationSimple: '',
      explanationExpanded: '',
      confidenceLevel: 'low',
      sources: [],
      ageAdaptations: {
        kids: '',
        teens: '',
        adults: '',
      },
      conversationPrompts: ['What do you think?', 'Why might people believe this?'],
      energyLevel: 'medium',
      localizationNotes: '',
      sensitivityTags: [],
      verification: {
        status: 'unverified',
        required_sources: intent.build === 'icebreakers' ? 0 : 2,
      },
    },
  ];

  res.json({ experience, draft_nodes });
});

// Verification gate: Phase 1 is “source-count validation”, not web crawling.
// Anything factual requires >=2 sources to be considered VERIFIED.
app.post('/api/ai-builder/verify', async (req, res) => {
  let nodes = Array.isArray(req.body?.nodes) ? req.body.nodes : [];
  const factualTypes = ['factual_claim', 'myth_vs_truth'];

  const updatedNodes = await Promise.all(
    nodes.map(async (n) => {
      const claimType = toStr(n?.claim_type) || 'factual_claim';
      let sources = Array.isArray(n?.sources) ? n.sources : [];
      const factual = factualTypes.includes(claimType);

      if (factual && sources.length < 2) {
        const claimText = toStr(n?.primaryClaim) || toStr(n?.title) || toStr(n?.claim) || '';
        if (claimText) {
          try {
            const fetched = await fetchTrustedSources(claimText, 3);
            const newSources = fetched.map((s) => ({ url: s.url, title: s.title || s.domain }));
            sources = [...sources, ...newSources].slice(0, 5);
          } catch {
            // keep existing sources
          }
        }
      }

      return { ...n, sources };
    })
  );

  nodes = updatedNodes;

  const results = nodes.map((n) => {
    const claimType = toStr(n?.claim_type) || 'factual_claim';
    const sources = Array.isArray(n?.sources) ? n.sources : [];
    const factual = factualTypes.includes(claimType);
    const ok = factual ? sources.length >= 2 : true;
    return {
      id: n?.id ?? null,
      claim_type: claimType,
      verification_status: ok ? 'verified' : (factual ? 'unverified' : 'not_required'),
      required_sources: factual ? 2 : 0,
      source_count: sources.length,
      notes: ok ? null : 'Factual content must include at least 2 independent sources before it can be shared.',
    };
  });

  res.json({ results, updatedNodes });
});

// =============================================================================
// Game sessions — room code, host, players, songs, bingo
// =============================================================================

const games = new Map();

function getGame(code) {
  const id = (code || '').toUpperCase().trim();
  return id ? games.get(id) : null;
}

function createGame(opts = {}) {
  let code;
  do { code = nanoidCode(); } while (games.has(code));
  const gameType = opts.gameType === 'trivia' ? 'trivia' : 'music-bingo';
  const game = {
    code,
    hostId: null,
    eventConfig: opts.eventConfig || { gameTitle: gameType === 'trivia' ? 'Trivia' : 'Playroom', venueName: '', accentColor: '#e94560' },
    players: new Map(),
    songPool: [],
    revealed: [],
    winner: null,
    started: false,
    welcomeDismissed: false, // when true, display shows first question/call sheet; when false, shows welcome panel
    freeSpace: true,
    winCondition: 'line',
    gameType,
    // Waiting room: mini-game and theme before host starts main event (default ON so players get a welcome screen)
    waitingRoom: {
      game: 'roll-call',
      theme: 'default',
      hostMessage: 'Starting soon',
      logoAnimation: 'bounce',
      stretchyImageSource: 'playroom',
      mazeCenterSource: 'playroom'
    },
    // Roll Call leaderboard (stubbed): playerId -> { bestTimeMs, displayName }
    rollCallScores: new Map(),
    // Trivia state (when gameType === 'trivia')
    trivia: gameType === 'trivia' ? {
      packId: opts.packId || '',
      questions: Array.isArray(opts.questions) ? opts.questions : [],
      currentIndex: 0,
      revealed: false,
      scores: {},
      answers: {} // playerId -> { questionIndex -> answer }
    } : null
  };
  games.set(code, game);
  return game;
}

function getTriviaPayload(game) {
  if (!game?.trivia) return null;
  const t = game.trivia;
  const q = t.questions[t.currentIndex] || null;
  return {
    packId: t.packId,
    questions: t.questions,
    currentIndex: t.currentIndex,
    revealed: t.revealed,
    scores: t.scores,
    currentQuestion: q
  };
}

/** Roll Call leaderboard: sorted by bestTimeMs (asc), for waiting room UI */
function getRollCallLeaderboard(game) {
  if (!game?.rollCallScores) return [];
  const list = [];
  for (const [playerId, data] of game.rollCallScores) {
    const p = game.players.get(playerId);
    list.push({
      playerId,
      displayName: p?.name || 'Player',
      bestTimeMs: data.bestTimeMs
    });
  }
  return list.sort((a, b) => a.bestTimeMs - b.bestTimeMs);
}

io.on('connection', (socket) => {
  socket.on('host:create', ({ baseUrl, gameType, packId, questions, eventConfig } = {}) => {
    const isTrivia = gameType === 'trivia';
    const game = createGame({
      gameType: isTrivia ? 'trivia' : 'music-bingo',
      packId: isTrivia ? (packId || '') : undefined,
      questions: isTrivia ? (Array.isArray(questions) ? questions : []) : undefined,
      eventConfig: eventConfig && typeof eventConfig === 'object' ? eventConfig : undefined
    });
    game.hostId = socket.id;
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const origin = baseUrl || getBaseUrl(socket);
    const payload = {
      code: game.code,
      joinUrl: `${origin}/join/${game.code}`,
      songPool: game.songPool,
      revealed: game.revealed,
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType,
      waitingRoom: game.waitingRoom
    };
    if (game.trivia) payload.trivia = getTriviaPayload(game);
    socket.emit('game:created', payload);
  });

  socket.on('event:preview', ({ code }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('event:preview-error', { message: 'Event not found' });
      return;
    }
    const payload = {
      eventConfig: game.eventConfig,
      gameType: game.gameType,
      gameTitle: game.eventConfig?.gameTitle || 'Playroom'
    };
    if (game.trivia) payload.trivia = getTriviaPayload(game);
    socket.emit('event:preview-ok', payload);
  });

  socket.on('host:set-win-condition', ({ code, winCondition }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.winCondition = winCondition || 'line';
    io.to(`game:${game.code}`).emit('game:win-condition-updated', { winCondition: game.winCondition });
  });

  socket.on('host:set-event-config', ({ code, eventConfig }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.eventConfig = eventConfig && typeof eventConfig === 'object' ? eventConfig : {};
    io.to(`game:${game.code}`).emit('game:event-config-updated', { eventConfig: game.eventConfig });
  });

  // Waiting room: host sets mini-game (roll-call, fidget/stretch, or none), theme, and message
  socket.on('host:set-waiting-room', ({ code, game: wrGame, theme, hostMessage, logoAnimation, stretchyImageSource, stretchyImageUrl, mazeCenterSource, mazeCenterImageUrl }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    if (wrGame !== undefined) game.waitingRoom.game = (wrGame === 'roll-call' || wrGame === 'fidget') ? wrGame : null;
    if (theme !== undefined && typeof theme === 'string') game.waitingRoom.theme = theme;
    if (hostMessage !== undefined && typeof hostMessage === 'string') game.waitingRoom.hostMessage = hostMessage;
    if (logoAnimation !== undefined && ['none', 'bounce', 'breathing', 'glow'].includes(logoAnimation)) game.waitingRoom.logoAnimation = logoAnimation;
    if (stretchyImageSource !== undefined && ['playroom', 'venue-logo', 'custom'].includes(stretchyImageSource)) game.waitingRoom.stretchyImageSource = stretchyImageSource;
    if (stretchyImageUrl !== undefined) game.waitingRoom.stretchyImageUrl = typeof stretchyImageUrl === 'string' ? stretchyImageUrl : undefined;
    if (mazeCenterSource !== undefined && ['playroom', 'venue-logo', 'custom', 'music-note', 'question-mark'].includes(mazeCenterSource)) game.waitingRoom.mazeCenterSource = mazeCenterSource;
    if (mazeCenterImageUrl !== undefined) game.waitingRoom.mazeCenterImageUrl = typeof mazeCenterImageUrl === 'string' ? mazeCenterImageUrl : undefined;
    io.to(`game:${game.code}`).emit('game:waiting-room-updated', { waitingRoom: game.waitingRoom });
  });

  socket.on('host:set-songs', ({ code, songs }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.songPool = Array.isArray(songs) ? songs : [];
    io.to(`game:${game.code}`).emit('game:songs-updated', { songPool: game.songPool });
  });

  socket.on('host:set-trivia-questions', ({ code, questions }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    game.trivia.questions = Array.isArray(questions) ? questions : [];
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
  });

  socket.on('host:reveal', ({ code, song }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    if (!song || game.revealed.includes(song)) return;
    game.revealed.push(song);
    io.to(`game:${game.code}`).emit('game:revealed', { song, revealed: game.revealed });
  });

  socket.on('host:start', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.started = true;
    game.welcomeDismissed = false;
    io.to(`game:${game.code}`).emit('game:started', { welcomeDismissed: false });
  });

  socket.on('host:dismiss-welcome', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.welcomeDismissed = true;
    io.to(`game:${game.code}`).emit('game:welcome-dismissed', {});
  });

  socket.on('host:reset', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id) return;
    game.revealed = [];
    game.winner = null;
    game.started = false;
    game.welcomeDismissed = false;
    game.rollCallScores.clear();
    io.to(`game:${game.code}`).emit('game:reset', {});
  });

  socket.on('player:join', ({ code, name }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('join:error', { message: 'Game not found' });
      return;
    }
    const playerId = socket.id;
    game.players.set(playerId, { id: playerId, name: name || 'Player', card: null });
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const joinPayload = {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      started: game.started,
      freeSpace: game.freeSpace,
      winCondition: game.winCondition,
      eventConfig: game.eventConfig,
      gameType: game.gameType,
      waitingRoom: game.waitingRoom
    };
    if (game.trivia) joinPayload.trivia = getTriviaPayload(game);
    // Stubbed Roll Call leaderboard for waiting room
    joinPayload.rollCallLeaderboard = getRollCallLeaderboard(game);
    socket.emit('join:ok', joinPayload);
    socket.to(`game:${game.code}`).emit('player:joined', {
      id: playerId,
      name: game.players.get(playerId).name,
      count: game.players.size
    });
  });

  socket.on('player:card', ({ code, card }) => {
    const game = getGame(code);
    if (!game) return;
    const p = game.players.get(socket.id);
    if (p) p.card = card;
  });

  // Roll Call (waiting room): player submits finish time; leaderboard is stubbed here
  socket.on('player:roll-call-score', ({ code, timeMs }) => {
    const game = getGame(code);
    if (!game) return;
    const p = game.players.get(socket.id);
    if (!p || typeof timeMs !== 'number' || timeMs <= 0) return;
    let data = game.rollCallScores.get(socket.id);
    if (!data) {
      data = { bestTimeMs: timeMs };
      game.rollCallScores.set(socket.id, data);
    } else {
      data.bestTimeMs = Math.min(data.bestTimeMs, timeMs);
    }
    const leaderboard = getRollCallLeaderboard(game);
    io.to(`game:${game.code}`).emit('game:roll-call-leaderboard', { leaderboard });
  });

  socket.on('player:bingo', ({ code }) => {
    const game = getGame(code);
    if (!game || game.winner) return;
    const p = game.players.get(socket.id);
    if (!p) return;
    game.winner = { id: p.id, name: p.name };
    io.to(`game:${game.code}`).emit('game:winner', { winner: game.winner });
  });

  socket.on('display:join', ({ code }) => {
    const game = getGame(code);
    if (!game) {
      socket.emit('display:error', { message: 'Game not found' });
      return;
    }
    socket.join(`game:${game.code}`);
    socket.gameCode = game.code;
    const displayPayload = {
      code: game.code,
      songPool: game.songPool,
      revealed: game.revealed,
      eventConfig: game.eventConfig,
      winner: game.winner,
      gameType: game.gameType,
      started: game.started,
      welcomeDismissed: game.welcomeDismissed,
      waitingRoom: game.waitingRoom,
      rollCallLeaderboard: getRollCallLeaderboard(game)
    };
    if (game.trivia) displayPayload.trivia = getTriviaPayload(game);
    socket.emit('display:ok', displayPayload);
  });

  // --- Trivia ---
  socket.on('host:trivia-start', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    game.started = true;
    game.welcomeDismissed = false;
    game.trivia.currentIndex = 0;
    game.trivia.revealed = false;
    io.to(`game:${game.code}`).emit('game:started', { welcomeDismissed: false });
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
  });

  socket.on('host:trivia-next', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    const t = game.trivia;
    if (t.currentIndex < t.questions.length - 1) {
      t.currentIndex += 1;
      t.revealed = false;
    }
    const payload = getTriviaPayload(game);
    io.to(`game:${game.code}`).emit('game:trivia-state', payload);
  });

  socket.on('host:trivia-reveal', ({ code }) => {
    const game = getGame(code);
    if (!game || game.hostId !== socket.id || !game.trivia) return;
    const t = game.trivia;
    const q = t.questions[t.currentIndex];
    if (!q) return;
    t.revealed = true;
    const correct = (q.correctAnswer || '').trim().toLowerCase();
    const scores = { ...t.scores };
    const pointsPerCorrect = (typeof q.points === 'number' && q.points >= 0) ? q.points : 1;
    for (const [playerId, answers] of Object.entries(t.answers)) {
      const ans = (answers[t.currentIndex] || '').trim().toLowerCase();
      if (ans === correct) {
        scores[playerId] = (scores[playerId] || 0) + pointsPerCorrect;
      }
    }
    t.scores = scores;
    io.to(`game:${game.code}`).emit('game:trivia-reveal', {
      questionIndex: t.currentIndex,
      correctAnswer: q.correctAnswer,
      scores: t.scores
    });
  });

  socket.on('player:trivia-answer', ({ code, questionIndex, answer }) => {
    const game = getGame(code);
    if (!game || !game.trivia) return;
    const t = game.trivia;
    if (t.revealed || questionIndex !== t.currentIndex) return;
    if (!t.answers[socket.id]) t.answers[socket.id] = {};
    t.answers[socket.id][questionIndex] = answer;
  });

  socket.on('disconnect', () => {
    const code = socket.gameCode;
    if (!code) return;
    const game = getGame(code);
    if (!game) return;
    if (game.hostId === socket.id) {
      io.to(`game:${code}`).emit('game:ended', { message: 'Host left' });
      games.delete(code);
      return;
    }
    if (game.players.has(socket.id)) {
      game.players.delete(socket.id);
    }
    socket.to(`game:${code}`).emit('player:left', { id: socket.id, count: game.players.size });
  });
});

function getBaseUrl(socket) {
  const req = socket.request;
  const host = req?.headers?.host || 'localhost:5173';
  const proto = req?.headers?.['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Music Bingo backend on port ${PORT}`);
});
