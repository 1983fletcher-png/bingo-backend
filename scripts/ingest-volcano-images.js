#!/usr/bin/env node
/**
 * Volcano Image Ingestion Script — R2-ready, checklist-enforced.
 *
 * Requirements: Node 18+, npm install sharp @aws-sdk/client-s3 (already in package.json).
 * R2_* env vars: set in .env (script loads from repo root) or export before running.
 *
 * - Source legality: trusted URLs only; license public-domain | cc-by | cc-by-sa
 * - Metadata: alt, source, sourceUrl, license
 * - Min width 800px (reject smaller)
 * - Convert to WebP (sharp, quality 80)
 * - Key: volcanoes/{slug}/{role}/{hash}.webp
 * - Hash (SHA-256) for dedup
 * - Merges into frontend/src/data/volcano-images.json
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config } from '../lib/r2.js';
import { TRUSTED_SOURCES } from '../lib/imageIngest.js';

const REGISTRY_PATH = path.join(__dirname, '../frontend/src/data/volcano-images.json');

const ALLOWED_LICENSES = ['public-domain', 'cc-by', 'cc-by-sa'];
const ALLOWED_ROLES = ['hero', 'section', 'diagram', 'gallery'];
const MIN_WIDTH = 800;
const WEBP_QUALITY = 80;

function validateSource(url) {
  if (!url || typeof url !== 'string') return false;
  return TRUSTED_SOURCES.some((domain) => url.includes(domain));
}

function validateInput(img) {
  const err = [];
  if (!img.url) err.push('url required');
  else if (!validateSource(img.url)) err.push('url not from trusted source');
  if (!img.alt || img.alt.length < 10) err.push('alt required (min 10 chars)');
  if (!img.source) err.push('source required');
  if (!img.sourceUrl) err.push('sourceUrl required');
  if (!img.license || !ALLOWED_LICENSES.includes(img.license)) err.push('license must be public-domain | cc-by | cc-by-sa');
  if (!img.volcanoSlug) err.push('volcanoSlug required');
  if (!img.role || !ALLOWED_ROLES.includes(img.role)) err.push('role must be hero | section | diagram | gallery');
  if (err.length) throw new Error(`Validation failed: ${err.join('; ')}`);
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function normalizeToWebp(buffer) {
  return sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function getImageMetadata(buffer) {
  const meta = await sharp(buffer).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}

/**
 * @param {Array<{ url: string, alt: string, caption?: string, role: string, license: string, source: string, sourceUrl: string, volcanoSlug: string, priority?: number }>} imagesToIngest
 */
async function ingestImages(imagesToIngest) {
  const config = getR2Config();
  if (!config) throw new Error('R2 not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL in .env');
  const client = getR2Client();
  if (!client) throw new Error('R2 client unavailable.');

  let registry = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  }

  const publicBase = (config.publicBaseUrl || '').replace(/\/$/, '');

  for (const img of imagesToIngest) {
    try {
      validateInput(img);
      console.log(`Downloading ${img.url} ...`);
      const rawBuffer = await downloadImage(img.url);

      const meta = await getImageMetadata(rawBuffer);
      if (meta.width < MIN_WIDTH) {
        console.error(`❌ Skipped (width ${meta.width}px < ${MIN_WIDTH}px): ${img.url}`);
        continue;
      }

      const hash = hashBuffer(rawBuffer);
      const webpBuffer = await normalizeToWebp(rawBuffer);

      const key = `volcanoes/${img.volcanoSlug}/${img.role}/${hash}.webp`;

      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: webpBuffer,
          ContentType: 'image/webp',
          Metadata: {
            volcano: String(img.volcanoSlug).slice(0, 256),
            license: String(img.license).slice(0, 64),
            source: String(img.source).slice(0, 256),
            role: String(img.role).slice(0, 64),
          },
        })
      );

      const publicUrl = publicBase ? `${publicBase}/${key}` : key;
      const imageId = `${img.volcanoSlug}-${img.role}-${hash}`;
      const now = new Date().toISOString();

      const record = {
        id: imageId,
        volcanoSlug: img.volcanoSlug,
        r2: { bucket: config.bucket, key, publicUrl },
        src: { lg: publicUrl, md: publicUrl, sm: publicUrl },
        alt: img.alt,
        caption: img.caption || undefined,
        usage: { role: img.role, priority: img.priority ?? 0 },
        license: {
          type: img.license,
          source: img.source,
          sourceUrl: img.sourceUrl,
          attribution: img.attribution ?? (img.license === 'cc-by' || img.license === 'cc-by-sa' ? img.source : undefined),
          attributionName: img.attributionName,
          attributionUrl: img.attributionUrl,
        },
        dimensions: { width: meta.width, height: meta.height },
        createdAt: now,
      };

      if (!registry[img.volcanoSlug]) {
        registry[img.volcanoSlug] = { hero: [], section: [], gallery: [], diagram: [] };
      }
      const roleArray = registry[img.volcanoSlug][img.role];
      if (roleArray.some((r) => r.id === imageId)) {
        console.log(`⏭️  Duplicate (hash exists): ${imageId}`);
        continue;
      }
      roleArray.push(record);
      console.log(`✅ Uploaded → ${key}`);
    } catch (err) {
      console.error(`❌ Failed ${img.url}: ${err.message}`);
    }
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('Registry saved:', REGISTRY_PATH);
}

// ----------------------------- USAGE -----------------------------
// Expand imagesToIngest with your volcano images. Verify alt, caption, license before running.
// If an example URL 404s, replace with a current PD image from Wikimedia Commons or NASA.

const imagesToIngest = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Reykjanes_Peninsula_Eruption%2C_Iceland_-_November_24th%2C_2024_%2854160954317%29.jpg',
    alt: 'Reykjanes Peninsula volcanic eruption in Iceland, November 2024',
    caption: 'Satellite view of eruption — connects real volcanoes to the baking soda experiment.',
    role: 'hero',
    license: 'public-domain',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Reykjanes_Peninsula_Eruption,_Iceland_-_November_24th,_2024_(54160954317).jpg',
    volcanoSlug: 'baking-soda-volcano',
    priority: 0,
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/La_Cumbre_Volcano_lava_flow%2C_Fernandina_Island%2C_Gal%C3%A1pagos_Islands%2C_Ecuador_-_30_April_2024_%2853694865943%29.jpg',
    alt: 'La Cumbre volcano lava flow, Galápagos Islands',
    caption: 'Lava flow from La Cumbre — real volcanic activity.',
    role: 'section',
    license: 'public-domain',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:La_Cumbre_Volcano_lava_flow,_Fernandina_Island,_Galápagos_Islands,_Ecuador_-_30_April_2024_(53694865943).jpg',
    volcanoSlug: 'baking-soda-volcano',
    priority: 0,
  },
  // Add more (materials flatlay, diagram) when you have PD URLs; verify alt, license before running.
];

ingestImages(imagesToIngest).catch((err) => {
  console.error(err);
  process.exit(1);
});
