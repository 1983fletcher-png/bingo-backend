/**
 * Trusted sources for automatic fact verification.
 * Fetches from Wikipedia (en), Simple English Wikipedia, and DBpedia
 * so we can attach 2+ independent sources without the user pasting URLs.
 *
 * All requests use a descriptive User-Agent per Wikimedia and DBpedia guidelines.
 */

const USER_AGENT = 'PlayroomFactCheck/1.0 (https://theplayroom.net; educational trivia & edutainment)';

function cleanClaimForSearch(claim) {
  if (typeof claim !== 'string') return '';
  return claim
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

/**
 * Search English Wikipedia (opensearch), then get page summary.
 * @param {string} searchText
 * @returns {Promise<{ url: string, title: string, snippet: string, domain: string } | null>}
 */
async function fetchWikipediaSummary(searchText) {
  const q = encodeURIComponent(cleanClaimForSearch(searchText));
  if (!q) return null;
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=1&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;
    const searchJson = await searchRes.json();
    const titles = searchJson[1];
    const urls = searchJson[3];
    const title = titles?.[0];
    const url = urls?.[0];
    if (!title || !url) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });
    if (!summaryRes.ok) return { url, title, snippet: title, domain: 'en.wikipedia.org' };
    const summaryJson = await summaryRes.json();
    const snippet = summaryJson.extract || summaryJson.description || title;
    return { url, title, snippet: String(snippet).slice(0, 500), domain: 'en.wikipedia.org' };
  } catch {
    return null;
  }
}

/**
 * Search Simple English Wikipedia, then get page summary.
 * @param {string} searchText
 * @returns {Promise<{ url: string, title: string, snippet: string, domain: string } | null>}
 */
async function fetchSimpleWikipediaSummary(searchText) {
  const q = encodeURIComponent(cleanClaimForSearch(searchText));
  if (!q) return null;
  try {
    const searchUrl = `https://simple.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=1&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!searchRes.ok) return null;
    const searchJson = await searchRes.json();
    const titles = searchJson[1];
    const urls = searchJson[3];
    const title = titles?.[0];
    const url = urls?.[0];
    if (!title || !url) return null;

    const summaryUrl = `https://simple.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });
    if (!summaryRes.ok) return { url, title, snippet: title, domain: 'simple.wikipedia.org' };
    const summaryJson = await summaryRes.json();
    const snippet = summaryJson.extract || summaryJson.description || title;
    return { url, title, snippet: String(snippet).slice(0, 500), domain: 'simple.wikipedia.org' };
  } catch {
    return null;
  }
}

/**
 * DBpedia Lookup API — structured knowledge base derived from Wikipedia.
 * @param {string} searchText
 * @returns {Promise<{ url: string, title: string, snippet: string, domain: string } | null>}
 */
async function fetchDBpediaLookup(searchText) {
  const q = encodeURIComponent(cleanClaimForSearch(searchText));
  if (!q) return null;
  try {
    const url = `https://lookup.dbpedia.org/api/search?query=${q}&format=json&maxResults=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const doc = json.docs?.[0];
    if (!doc) return null;
    const resource = Array.isArray(doc.resource) ? doc.resource[0] : doc.resource;
    const label = Array.isArray(doc.label) ? doc.label[0] : doc.label;
    const comment = Array.isArray(doc.comment) ? doc.comment[0] : doc.comment;
    if (!resource) return null;
    const title = (label || resource).replace(/<\/?B>/g, '').trim();
    const snippet = (comment || title || '').replace(/<\/?B>/g, '').trim().slice(0, 500);
    return {
      url: resource.replace('http://dbpedia.org/resource/', 'https://dbpedia.org/page/').replace(/ /g, '_'),
      title,
      snippet,
      domain: 'dbpedia.org',
    };
  } catch {
    return null;
  }
}

const SOURCE_FETCHERS = [
  { name: 'Wikipedia', fn: fetchWikipediaSummary },
  { name: 'Simple Wikipedia', fn: fetchSimpleWikipediaSummary },
  { name: 'DBpedia', fn: fetchDBpediaLookup },
];

/**
 * Fetch up to maxSources from trusted APIs. Dedupes by URL.
 * @param {string} claim — claim or question text to look up
 * @param {number} maxSources — default 3
 * @returns {Promise<Array<{ url: string, title: string, snippet: string, domain: string }>>}
 */
async function fetchTrustedSources(claim, maxSources = 3) {
  const seen = new Set();
  const out = [];
  for (const { fn } of SOURCE_FETCHERS) {
    if (out.length >= maxSources) break;
    const one = await fn(claim);
    if (one && one.url && !seen.has(one.url)) {
      seen.add(one.url);
      out.push(one);
    }
  }
  return out;
}

export {
  fetchWikipediaSummary,
  fetchSimpleWikipediaSummary,
  fetchDBpediaLookup,
  fetchTrustedSources,
  USER_AGENT,
};
