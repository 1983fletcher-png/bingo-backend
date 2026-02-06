/**
 * IMAGE INGESTION PIPELINE — CLOUDFLARE R2
 *
 * Pipeline: Source → Validate (license) → Normalize (future: resize) → Upload to R2 → Register (return record).
 * If validation fails → image is rejected. Images live in R2; frontend renders from structured data only.
 *
 * Two flows:
 * - ingestImage(): generic learning image (hash key, single file).
 * - ingestVolcanoImage(): volcano/learning page image with slug/role, R2 key structure, object metadata, VolcanoImage record.
 */
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { getR2Client, getR2Config } from './r2.js';

/* -----------------------------
   ALLOWED IMAGE SOURCES
----------------------------- */

export const TRUSTED_SOURCES = [
  'wikimedia.org',
  'nasa.gov',
  'noaa.gov',
  'usgs.gov',
  'si.edu',
  'loc.gov',
];

export const ALLOWED_LICENSES = [
  'Public Domain',
  'CC0',
  'CC0 1.0',
  'CC BY 4.0',
  'CC BY-SA 4.0',
];

/** Map display license to machine-readable type for registry and R2 metadata. */
const LICENSE_TYPE_MAP = {
  'Public Domain': 'public-domain',
  'CC0': 'public-domain',
  'CC0 1.0': 'public-domain',
  'CC BY 4.0': 'cc-by',
  'CC BY-SA 4.0': 'cc-by-sa',
};

/** Key prefix in R2 for learning/verified images (content-addressable by hash). */
export const LEARNING_IMAGES_PREFIX = 'learning-images';

/** Key prefix for volcano (and future learning-page) images: volcanoes/{slug}/{role}/{id}.ext */
export const VOLCANO_IMAGES_PREFIX = 'volcanoes';

/* -----------------------------
   IMAGE METADATA TYPE
----------------------------- */

/**
 * @typedef {Object} ImageMetadata
 * @property {string} title
 * @property {string} description
 * @property {string} altText
 * @property {string} sourceName
 * @property {string} sourceUrl
 * @property {string} license
 * @property {boolean} attributionRequired
 * @property {string[]} tags
 * @property {string[]} concepts
 * @property {boolean} verified
 */

/* -----------------------------
   SOURCE VALIDATION
----------------------------- */

function validateSource(url) {
  if (!url || typeof url !== 'string') return false;
  return TRUSTED_SOURCES.some((domain) => url.includes(domain));
}

function validateLicense(license) {
  return ALLOWED_LICENSES.includes(license);
}

function validateMetadata(metadata) {
  return (
    metadata &&
    metadata.verified === true &&
    metadata.altText &&
    metadata.altText.length >= 10 &&
    metadata.sourceUrl &&
    metadata.sourceName
  );
}

/* -----------------------------
   IMAGE INGEST
----------------------------- */

/**
 * Ingest an image from a trusted source: validate → fetch → store in R2 → return registered asset.
 * Fails fast if source, license, or metadata is invalid. Returned shape matches ImageAsset (learningEngine).
 *
 * @param {{ imageUrl: string, metadata: ImageMetadata }} options
 * @returns {Promise<{ id: string, url: string, thumbnailUrl: string, altText: string, sourceType: string, sourceName: string, sourceUrl: string, license: string, attributionRequired: boolean, tags: string[], concepts: string[], verified: true }} Registered asset
 * @throws {Error} If source not trusted, license not allowed, metadata incomplete, or fetch/upload fails
 */
export async function ingestImage({ imageUrl, metadata }) {
  if (!validateSource(imageUrl)) {
    throw new Error('Image source is not trusted.');
  }

  if (!validateLicense(metadata.license)) {
    throw new Error('Image license not allowed.');
  }

  if (!validateMetadata(metadata)) {
    throw new Error('Image metadata incomplete or unverified.');
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const extension = (contentType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
  const key = `${LEARNING_IMAGES_PREFIX}/${hash}.${extension}`;

  const config = getR2Config();
  if (!config) {
    throw new Error('R2 not configured. Set R2_* env vars.');
  }

  const client = getR2Client();
  if (!client) {
    throw new Error('R2 client unavailable.');
  }

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const publicUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`
    : key;

  return {
    id: hash,
    url: publicUrl,
    thumbnailUrl: publicUrl,
    altText: metadata.altText,
    sourceType: 'public_domain',
    sourceName: metadata.sourceName,
    sourceUrl: metadata.sourceUrl,
    license: metadata.license,
    attributionRequired: metadata.attributionRequired === true,
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    concepts: Array.isArray(metadata.concepts) ? metadata.concepts : [],
    verified: true,
  };
}

/* -----------------------------
   VOLCANO IMAGE INGEST (R2 key structure + object metadata)
   Key: volcanoes/{slug}/{role}/{id}.webp
   R2 object metadata: volcano, license, source, attribution, role — for auditing/compliance.
   Returns VolcanoImage-shaped record; frontend uses registry (JSON or DB), never filenames.
----------------------------- */

/**
 * @param {Object} options
 * @param {string} options.imageUrl - Trusted source URL
 * @param {string} options.volcanoSlug - e.g. "baking-soda-volcano"
 * @param {string} options.role - "hero" | "section" | "gallery" | "diagram"
 * @param {number} [options.priority=0] - Order within role
 * @param {string} [options.caption] - Optional caption
 * @param {Object} options.metadata - Same as ingestImage (altText, sourceName, sourceUrl, license, attributionRequired, tags, concepts, verified)
 * @returns {Promise<{ id: string, volcanoSlug: string, r2: { bucket: string, key: string, publicUrl: string }, src: { lg: string, md: string, sm: string }, alt: string, caption?: string, usage: { role: string, priority: number }, license: { type: string, source: string, attribution?: string, sourceUrl: string }, dimensions: { width: number, height: number }, createdAt: string }>}
 */
export async function ingestVolcanoImage({
  imageUrl,
  volcanoSlug,
  role,
  priority = 0,
  caption,
  metadata,
}) {
  if (!validateSource(imageUrl)) throw new Error('Image source is not trusted.');
  if (!validateLicense(metadata.license)) throw new Error('Image license not allowed.');
  if (!validateMetadata(metadata)) throw new Error('Image metadata incomplete or unverified.');
  const allowedRoles = ['hero', 'section', 'gallery', 'diagram'];
  if (!allowedRoles.includes(role)) throw new Error(`Invalid role: ${role}`);

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const ext = (contentType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
  const key = `${VOLCANO_IMAGES_PREFIX}/${volcanoSlug}/${role}/${hash}.${ext}`;

  const config = getR2Config();
  if (!config) throw new Error('R2 not configured. Set R2_* env vars.');
  const client = getR2Client();
  if (!client) throw new Error('R2 client unavailable.');

  const licenseType = LICENSE_TYPE_MAP[metadata.license] || 'public-domain';
  const attribution = metadata.attributionRequired ? (metadata.sourceName || '') : '';

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        volcano: volcanoSlug,
        license: licenseType,
        source: String(metadata.sourceName || '').slice(0, 256),
        attribution: String(attribution).slice(0, 256),
        role,
      },
    })
  );

  const publicUrl = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`
    : key;

  const imageId = `${volcanoSlug}-${role}-${hash}`;
  const now = new Date().toISOString();

  return {
    id: imageId,
    volcanoSlug,
    r2: { bucket: config.bucket, key, publicUrl },
    src: { lg: publicUrl, md: publicUrl, sm: publicUrl },
    alt: metadata.altText,
    caption: caption || undefined,
    usage: { role, priority },
    license: {
      type: licenseType,
      source: metadata.sourceName || '',
      attribution: metadata.attributionRequired ? metadata.sourceName : undefined,
      sourceUrl: metadata.sourceUrl || '',
    },
    dimensions: { width: 0, height: 0 },
    createdAt: now,
  };
}
