/**
 * Validation Layer — Dynamic Image Ingestion Pipeline
 *
 * Cross-checks license, dimensions, hash dedup, and optional concept match.
 * Ensures no copyrighted or low-quality images slip through.
 */

import crypto from 'crypto';
import { ALLOWED_LICENSES_DISPLAY, getSourceForUrl } from './sources.js';

/** Normalize license string from source (Commons, NASA, etc.) to allowed type. */
const LICENSE_NORMALIZE = {
  'public domain': 'public-domain',
  'pd': 'public-domain',
  'cc0': 'cc0',
  'cc0 1.0': 'cc0',
  'cc by': 'cc-by',
  'cc by 4.0': 'cc-by',
  'cc by 2.0': 'cc-by',
  'cc by-sa': 'cc-by-sa',
  'cc by-sa 4.0': 'cc-by-sa',
  'cc by-sa 3.0': 'cc-by-sa',
};

/** Default min width/height if not specified. */
export const DEFAULT_MIN_WIDTH = 600;
export const DEFAULT_MIN_HEIGHT = 400;

/**
 * Validate license. Returns { valid: boolean, normalized?: string, reason?: string }.
 */
export function validateLicense(licenseFromSource) {
  if (!licenseFromSource || typeof licenseFromSource !== 'string') {
    return { valid: false, reason: 'Missing license' };
  }
  const normalized = licenseFromSource.trim().toLowerCase();
  const match = ALLOWED_LICENSES_DISPLAY.some(
    (l) => l.toLowerCase() === normalized || normalized.includes(l.toLowerCase())
  );
  if (!match) {
    return { valid: false, reason: `License not allowed: ${licenseFromSource}` };
  }
  const type = LICENSE_NORMALIZE[normalized] ?? (normalized.includes('cc by-sa') ? 'cc-by-sa' : normalized.includes('cc by') ? 'cc-by' : 'public-domain');
  return { valid: true, normalized: type };
}

/**
 * Validate dimensions. Returns { valid: boolean, reason?: string }.
 */
export function validateDimensions(width, height, minWidth = DEFAULT_MIN_WIDTH, minHeight = DEFAULT_MIN_HEIGHT) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    return { valid: false, reason: 'Missing or invalid dimensions' };
  }
  if (w < minWidth || h < minHeight) {
    return { valid: false, reason: `Below minimum size: ${w}x${h} (min ${minWidth}x${minHeight})` };
  }
  return { valid: true };
}

/**
 * Compute content hash for dedup (SHA-256, first 16 hex chars).
 */
export function contentHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

/**
 * Check if image is from a trusted source (by URL).
 */
export function validateSourceUrl(url) {
  const source = getSourceForUrl(url);
  return !!source;
}

/**
 * Concept check: ensure alt/description contains at least one of the required keywords (case-insensitive).
 * Used to avoid wrong-concept images when auto-fetching.
 * Returns { valid: boolean, matched?: string[] }.
 */
export function validateConcept(altOrDescription, requiredKeywords) {
  if (!requiredKeywords || requiredKeywords.length === 0) {
    return { valid: true };
  }
  const text = (altOrDescription || '').toLowerCase();
  const matched = requiredKeywords.filter((kw) => text.includes(kw.toLowerCase()));
  return {
    valid: matched.length > 0,
    matched,
  };
}

/**
 * Full validation for a candidate image (from fetcher).
 * Returns { valid: boolean, errors: string[], warnings: string[] }.
 */
export function validateCandidate(candidate, options = {}) {
  const {
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    requireConcept = false,
    conceptKeywords = [],
  } = options;
  const errors = [];
  const warnings = [];

  if (!candidate.url) errors.push('Missing url');
  else if (!validateSourceUrl(candidate.url)) errors.push('URL not from trusted source');

  const licenseResult = validateLicense(candidate.license ?? candidate.licenseType);
  if (!licenseResult.valid) errors.push(licenseResult.reason);

  if (candidate.width != null && candidate.height != null) {
    const dimResult = validateDimensions(candidate.width, candidate.height, minWidth, minHeight);
    if (!dimResult.valid) warnings.push(dimResult.reason);
  } else {
    warnings.push('Dimensions unknown; will be checked after download');
  }

  const altOrDesc = candidate.altText ?? candidate.description ?? candidate.alt ?? '';
  if (altOrDesc.length < 10) warnings.push('Alt text too short for accessibility');

  if (requireConcept && conceptKeywords.length > 0) {
    const conceptResult = validateConcept(altOrDesc, conceptKeywords);
    if (!conceptResult.valid) errors.push(`Concept mismatch: no keyword match in alt/description (expected one of: ${conceptKeywords.join(', ')})`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedLicense: licenseResult.normalized,
  };
}
