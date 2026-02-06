/**
 * Master Source List — Dynamic Image Ingestion Pipeline
 *
 * Public-domain and CC0/CC-BY repositories with base URLs, license types,
 * and categorization. Used by the figure pipeline for validation and fetcher routing.
 *
 * @see docs/IMAGE-SOURCE-WHITELIST.md
 */

/** License type for pipeline validation and metadata. */
export const LICENSE_TYPES = {
  PUBLIC_DOMAIN: 'public-domain',
  CC0: 'cc0',
  CC_BY: 'cc-by',
  CC_BY_SA: 'cc-by-sa',
};

/** Display license strings that map to allowed use. Reject NC, ND, and unclear. */
export const ALLOWED_LICENSES_DISPLAY = [
  'Public Domain',
  'PD',
  'CC0',
  'CC0 1.0',
  'CC BY',
  'CC BY 4.0',
  'CC BY-SA 4.0',
  'CC BY 2.0',
  'CC BY-SA 3.0',
];

/** Image categorization for section mapping and trivia. */
export const IMAGE_CATEGORIES = [
  'portrait',
  'diagram',
  'experiment',
  'concept',
  'place',
  'artifact',
  'document',
  'other',
];

/**
 * Master source list: base URL, license default, API hint, and categorization scheme.
 * "search" indicates the source supports programmatic search (API); otherwise use manual URL list.
 */
export const MASTER_SOURCES = [
  {
    id: 'wikimedia-commons',
    name: 'Wikimedia Commons',
    baseUrl: 'https://commons.wikimedia.org',
    domains: ['commons.wikimedia.org', 'upload.wikimedia.org'],
    apiUrl: 'https://commons.wikimedia.org/w/api.php',
    licenseDefault: 'varies',
    allowedLicenses: ['Public Domain', 'CC0', 'CC0 1.0', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC BY 2.0', 'CC BY-SA 3.0'],
    search: 'api',
    categories: IMAGE_CATEGORIES,
    notes: 'MediaWiki API: query list=search (namespace 6), then prop=imageinfo for url, size, extmetadata (license).',
  },
  {
    id: 'nasa',
    name: 'NASA Images',
    baseUrl: 'https://images.nasa.gov',
    apiUrl: 'https://images-api.nasa.gov',
    licenseDefault: 'Public Domain',
    allowedLicenses: ['Public Domain'],
    search: 'api',
    categories: ['diagram', 'experiment', 'concept', 'place', 'other'],
    notes: 'NASA API returns media with nasa_id; most content is PD.',
  },
  {
    id: 'smithsonian',
    name: 'Smithsonian Collections',
    baseUrl: 'https://www.si.edu',
    apiUrl: 'https://api.si.edu/openaccess/api',
    licenseDefault: 'varies',
    allowedLicenses: ['Public Domain', 'CC0', 'CC BY 4.0'],
    search: 'api',
    categories: IMAGE_CATEGORIES,
    notes: 'Open Access API; verify license per asset.',
  },
  {
    id: 'loc',
    name: 'Library of Congress',
    baseUrl: 'https://www.loc.gov',
    apiUrl: 'https://www.loc.gov/collections',
    licenseDefault: 'varies',
    allowedLicenses: ['Public Domain', 'No known restrictions'],
    search: 'api',
    categories: ['portrait', 'document', 'place', 'artifact', 'other'],
    notes: 'LOC has search API; many PD prints and photos.',
  },
  {
    id: 'usgs',
    name: 'USGS',
    baseUrl: 'https://www.usgs.gov',
    licenseDefault: 'Public Domain',
    allowedLicenses: ['Public Domain'],
    search: 'manual',
    categories: ['diagram', 'experiment', 'place', 'other'],
    notes: 'Government science; PD. Use manual URL list or future API.',
  },
  {
    id: 'noaa',
    name: 'NOAA',
    baseUrl: 'https://www.noaa.gov',
    licenseDefault: 'Public Domain',
    allowedLicenses: ['Public Domain'],
    search: 'manual',
    categories: ['diagram', 'experiment', 'place', 'other'],
    notes: 'Government; PD. Manual URL list or future API.',
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    baseUrl: 'https://unsplash.com',
    apiUrl: 'https://api.unsplash.com',
    licenseDefault: 'CC0',
    allowedLicenses: ['Unsplash License', 'CC0'],
    search: 'api',
    categories: ['portrait', 'place', 'concept', 'other'],
    notes: 'API key required. Free to use; check current license.',
  },
  {
    id: 'pexels',
    name: 'Pexels',
    baseUrl: 'https://www.pexels.com',
    apiUrl: 'https://api.pexels.com',
    licenseDefault: 'CC0',
    allowedLicenses: ['Pexels License', 'CC0'],
    search: 'api',
    categories: ['portrait', 'place', 'concept', 'other'],
    notes: 'API key required. Free for use.',
  },
];

/** Get source by ID. */
export function getSourceById(id) {
  return MASTER_SOURCES.find((s) => s.id === id) || null;
}

/** Check if a URL belongs to a known source (by base URL or domains). */
export function getSourceForUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return MASTER_SOURCES.find(
      (s) =>
        url.startsWith(s.baseUrl) ||
        (s.domains && s.domains.some((d) => host === d || host.endsWith('.' + d)))
    ) || null;
  } catch {
    return null;
  }
}
