#!/usr/bin/env node
/**
 * Nikola Tesla Biography Page — R2 image ingest
 *
 * Purpose: Build Tesla biography page with verified public-domain (or CC) images,
 * upload to Cloudflare R2, and merge into frontend registry (volcano-images.json).
 *
 * Requirements:
 *   - Node 18+
 *   - npm install sharp @aws-sdk/client-s3 (already in package.json)
 *   - .env with R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *     R2_BUCKET_NAME, R2_PUBLIC_BASE_URL (see lib/r2.js)
 *
 * All images: public domain or CC0/CC-BY from Wikimedia Commons.
 * Keys: volcanoes/nikola-tesla/hero/{hash}.webp, volcanoes/nikola-tesla/section/{hash}.webp
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config } from '../lib/r2.js';
import { TRUSTED_SOURCES } from '../lib/imageIngest.js';

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

const REGISTRY_PATH = path.join(__dirname, '../frontend/src/data/volcano-images.json');
const SLUG = 'nikola-tesla';
const MIN_WIDTH = 600;
const WEBP_QUALITY = 80;

function validateSource(url) {
  return url && TRUSTED_SOURCES.some((d) => url.includes(d));
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function toWebp(buffer, url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  if (ext === '.svg') {
    try {
      return await sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer();
    } catch (e) {
      console.warn(`⚠️  SVG→WebP failed for ${url}, skipping conversion:`, e.message);
      return null;
    }
  }
  return sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer();
}

async function getMeta(buffer) {
  try {
    const meta = await sharp(buffer).metadata();
    return { width: meta.width ?? 0, height: meta.height ?? 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}

// ---------- Image definitions (public domain / CC from Wikimedia) ----------
const IMAGES = [
  {
    slotId: 'hero-image',
    role: 'hero',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/N.Tesla.JPG',
    alt: 'Nikola Tesla portrait in lab',
    caption: 'Nikola Tesla — the man who electrified the world.',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:N.Tesla.JPG',
    license: 'public-domain',
    tags: ['tesla', 'portrait', 'scientist', 'inventor'],
    concepts: ['electricity', 'AC', 'invention'],
  },
  {
    slotId: 'early-life-1',
    role: 'section',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Smiljan_-_Birthplace_of_Nikola_Tesla.jpg',
    alt: 'Tesla birthplace in Smiljan',
    caption: 'Smiljan — birthplace of Nikola Tesla.',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Smiljan_-_Birthplace_of_Nikola_Tesla.jpg',
    license: 'public-domain',
    tags: ['tesla', 'birthplace', 'early-life'],
    concepts: ['childhood', 'Smiljan'],
  },
  {
    slotId: 'inventions-AC',
    role: 'section',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Tesla_AC_motor.svg',
    alt: 'Diagram of Tesla AC motor',
    caption: 'Tesla AC motor — diagram.',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tesla_AC_motor.svg',
    license: 'public-domain',
    tags: ['AC', 'motor', 'invention'],
    concepts: ['electricity', 'alternating current'],
  },
  {
    slotId: 'inventions-Tesla-coil',
    role: 'section',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Tesla_coil_2.JPG',
    alt: 'Tesla coil in lab',
    caption: 'Tesla coil — high-voltage experiment.',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tesla_coil_2.JPG',
    license: 'public-domain',
    tags: ['tesla coil', 'experiment', 'high voltage'],
    concepts: ['electricity', 'experiments'],
  },
  {
    slotId: 'modern-influence-1',
    role: 'section',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/AC_power_lines.jpg',
    alt: 'Modern AC power lines',
    caption: 'Modern AC grid — Tesla’s legacy.',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:AC_power_lines.jpg',
    license: 'public-domain',
    tags: ['electricity', 'modern', 'AC grid'],
    concepts: ['legacy', 'technology'],
  },
];

async function run() {
  if (!validateSource(IMAGES[0].url)) {
    throw new Error('Image URLs must be from trusted sources (e.g. wikimedia.org). See lib/imageIngest.js TRUSTED_SOURCES.');
  }

  const config = getR2Config();
  if (!config) {
    throw new Error(
      'R2 not configured. Set R2_ACCOUNT_ID (or R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL in .env'
    );
  }
  const client = getR2Client();
  if (!client) throw new Error('R2 client unavailable.');

  let registry = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  }
  if (!registry[SLUG]) {
    registry[SLUG] = { hero: [], section: [], gallery: [], diagram: [] };
  }
  const heroRecords = [];
  const sectionRecords = [];

  const publicBase = (config.publicBaseUrl || '').replace(/\/$/, '');

  for (const img of IMAGES) {
    try {
      if (!validateSource(img.url)) {
        console.error(`❌ Skipped (untrusted source): ${img.slotId}`);
        continue;
      }
      console.log(`Downloading ${img.slotId} ...`);
      const raw = await download(img.url);
      const meta = await getMeta(raw);
      if (meta.width > 0 && meta.width < MIN_WIDTH) {
        console.error(`❌ Skipped (width ${meta.width}px < ${MIN_WIDTH}px): ${img.slotId}`);
        continue;
      }

      const hash = hashBuffer(raw);
      const webp = await toWebp(raw, img.url);
      const isSvg = img.url.toLowerCase().includes('.svg');
      const body = webp || raw;
      const contentType = webp ? 'image/webp' : (isSvg ? 'image/svg+xml' : 'image/jpeg');
      const ext = webp ? '.webp' : (isSvg ? '.svg' : '.jpg');
      const key = `volcanoes/${SLUG}/${img.role}/${hash}${ext}`;

      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          Metadata: {
            slot: String(img.slotId).slice(0, 64),
            license: String(img.license).slice(0, 64),
            source: String(img.sourceName).slice(0, 256),
          },
        })
      );

      const publicUrl = publicBase ? `${publicBase}/${key}` : key;
      const imageId = `${SLUG}-${img.role}-${hash}`;
      const now = new Date().toISOString();
      const dimensions = meta.width && meta.height ? { width: meta.width, height: meta.height } : { width: 800, height: 600 };

      const record = {
        id: imageId,
        volcanoSlug: SLUG,
        r2: { bucket: config.bucket, key, publicUrl },
        src: { lg: publicUrl, md: publicUrl, sm: publicUrl },
        alt: img.alt,
        caption: img.caption,
        usage: { role: img.role, priority: 0 },
        license: {
          type: img.license,
          source: img.sourceName,
          sourceUrl: img.sourceUrl,
        },
        dimensions,
        createdAt: now,
      };

      if (img.role === 'hero') {
        if (heroRecords.some((r) => r.id === imageId)) {
          console.log(`⏭️  Duplicate: ${imageId}`);
        } else {
          heroRecords.push(record);
          console.log(`✅ ${img.slotId} → ${key}`);
        }
      } else {
        if (sectionRecords.some((r) => r.id === imageId)) {
          console.log(`⏭️  Duplicate: ${imageId}`);
        } else {
          sectionRecords.push(record);
          console.log(`✅ ${img.slotId} → ${key}`);
        }
      }
    } catch (err) {
      console.error(`❌ ${img.slotId}:`, err.message);
    }
  }

  registry[SLUG].hero = heroRecords;
  registry[SLUG].section = sectionRecords;
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('Registry updated:', REGISTRY_PATH);
  console.log(`  ${heroRecords.length} hero, ${sectionRecords.length} section`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
