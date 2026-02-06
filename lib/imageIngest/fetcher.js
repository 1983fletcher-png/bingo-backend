/**
 * Image Fetcher Module — Dynamic Image Ingestion Pipeline
 *
 * Pulls image candidates by keywords (figure name, invention, concept, life stage).
 * Checks metadata from source: license, alt text, dimensions.
 * Implemented for Wikimedia Commons API; other sources can be added.
 */

import { getSourceById } from './sources.js';
import { validateLicense } from './validate.js';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

/**
 * Search Wikimedia Commons for images. Returns array of candidates with url, license, alt, dimensions.
 *
 * @param {string} query - Search query (e.g. "Nikola Tesla", "Tesla coil")
 * @param {number} [limit=20] - Max results
 * @returns {Promise<Array<{ url: string, title: string, description: string, license: string, width: number, height: number, thumbUrl?: string }>>}
 */
export async function searchCommons(query, limit = 20) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata|mime',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${COMMONS_API}?${params}`);
  if (!res.ok) throw new Error(`Commons API error: ${res.status}`);
  const data = await res.json();

  const pages = data.query?.pages ?? {};
  const results = [];

  for (const [pageId, page] of Object.entries(pages)) {
    if (page.pageid === undefined) continue;
    const info = page.imageinfo?.[0];
    if (!info || !info.url) continue;

    const ext = page.title?.replace(/^File:/i, '');
    const usageTerms = info.extmetadata?.LicenseShortName?.value ?? info.extmetadata?.UsageTerms?.value ?? '';
    const license = parseCommonsLicense(usageTerms);
    const licenseCheck = validateLicense(license);
    if (!licenseCheck.valid) continue;

    const description = info.extmetadata?.ImageDescription?.value ?? '';
    const artist = info.extmetadata?.Artist?.value ?? '';

    results.push({
      url: info.url,
      thumbUrl: info.thumburl ?? info.url,
      title: ext ?? page.title,
      description: stripHtml(description),
      artist: stripHtml(artist),
      license,
      normalizedLicense: licenseCheck.normalized,
      width: info.width ?? 0,
      height: info.height ?? 0,
      mime: info.mime,
      fileTitle: page.title,
    });
  }

  return results;
}

function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseCommonsLicense(usageTerms) {
  if (!usageTerms) return 'Unknown';
  const s = usageTerms.toLowerCase();
  if (s.includes('public domain') || s.includes('pd-')) return 'Public Domain';
  if (s.includes('cc0')) return 'CC0';
  if (s.includes('cc by-sa')) return 'CC BY-SA 4.0';
  if (s.includes('cc by')) return 'CC BY 4.0';
  return usageTerms;
}

/**
 * Fetch image buffer from URL (for upload). Used by pipeline after validation.
 */
export async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Stub: NASA image search. Returns empty array until implemented.
 * API: https://images-api.nasa.gov/search?q=...
 */
export async function searchNasa(query, limit = 10) {
  const apiUrl = 'https://images-api.nasa.gov/search';
  const params = new URLSearchParams({ q: query, media_type: 'image', limit: String(limit) });
  try {
    const res = await fetch(`${apiUrl}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.collection?.items ?? [];
    return items
      .filter((i) => i.links?.[0]?.href && i.data?.[0])
      .map((i) => {
        const d = i.data[0];
        return {
          url: i.links.find((l) => l.rel === 'preview')?.href ?? i.links[0].href,
          title: d.title ?? '',
          description: d.description ?? '',
          license: 'Public Domain',
          normalizedLicense: 'public-domain',
          width: 0,
          height: 0,
          nasaId: d.nasa_id,
        };
      });
  } catch {
    return [];
  }
}

/**
 * Multi-source fetch: run Commons (and optionally NASA) with keywords, merge and dedupe by URL.
 */
export async function fetchByKeywords(keywords, options = {}) {
  const { commonsLimit = 15, includeNasa = false } = options;
  const query = Array.isArray(keywords) ? keywords.join(' ') : String(keywords);
  const [commons, nasa] = await Promise.all([
    searchCommons(query, commonsLimit),
    includeNasa ? searchNasa(query, 5) : Promise.resolve([]),
  ]);

  const byUrl = new Map();
  for (const c of commons) {
    byUrl.set(c.url, { ...c, source: 'wikimedia-commons' });
  }
  for (const n of nasa) {
    if (!byUrl.has(n.url)) byUrl.set(n.url, { ...n, source: 'nasa' });
  }
  return Array.from(byUrl.values());
}
