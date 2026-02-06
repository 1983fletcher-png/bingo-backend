/**
 * Figure Pipeline — Dynamic Image Ingestion
 *
 * Orchestrates: figure config → keyword fetch → validate → R2 upload (figures/<figure>/<id>.<ext>)
 * → metadata generation → output schema (Learn & Grow + trivia-ready).
 *
 * R2 folder structure: figures/<figure_slug>/<image_id>.<ext>
 */

import fs from 'fs';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Config } from '../r2.js';
import { contentHash, validateCandidate, validateDimensions, DEFAULT_MIN_WIDTH, DEFAULT_MIN_HEIGHT } from './validate.js';
import { fetchByKeywords, fetchImageBuffer } from './fetcher.js';
import sharp from 'sharp';

const FIGURES_PREFIX = 'figures';
const WEBP_QUALITY = 80;

/**
 * Slugify figure name for R2 key and config.
 */
export function slugifyFigureName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Upload buffer to R2 at figures/<figureSlug>/<imageId>.<ext>
 * Converts to WebP when possible. Returns public URL.
 */
async function uploadToR2(buffer, figureSlug, imageId, mimeType) {
  const config = getR2Config();
  if (!config) throw new Error('R2 not configured');
  const client = getR2Client();
  if (!client) throw new Error('R2 client unavailable');

  const isSvg = mimeType?.includes('svg');
  let body = buffer;
  let contentType = mimeType || 'image/jpeg';
  let ext = '.webp';

  if (!isSvg) {
    try {
      body = await sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer();
    } catch {
      ext = path.extname(imageId) || '.jpg';
      contentType = mimeType || 'image/jpeg';
    }
  } else {
    ext = '.svg';
    contentType = 'image/svg+xml';
  }

  const key = `${FIGURES_PREFIX}/${figureSlug}/${imageId}${ext}`;
  const publicBase = (config.publicBaseUrl || '').replace(/\/$/, '');
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return publicBase ? `${publicBase}/${key}` : key;
}

/**
 * Run pipeline for one figure.
 *
 * @param {Object} figureConfig - { figure, lifespan, slug?, quickFacts, sections: [{ id, title, content?, keywords?, conceptKeywords? }], sources, triviaTags }
 * @param {Object} options - { minWidth, minHeight, maxImagesPerSection, skipFetch, manualImageUrls: { sectionId: [urls] } }
 * @returns {Promise<Object>} Output schema: figure, lifespan, heroImage, quickFacts, sections, sources, triviaTags, metadata
 */
export async function runFigurePipeline(figureConfig, options = {}) {
  const {
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxImagesPerSection = 5,
    skipFetch = false,
    skipUpload = false,
    manualImageUrls = {},
  } = options;

  const slug = figureConfig.slug || slugifyFigureName(figureConfig.figure);
  const output = {
    figure: figureConfig.figure,
    lifespan: figureConfig.lifespan,
    heroImage: '',
    quickFacts: figureConfig.quickFacts ?? {},
    sections: [],
    sources: figureConfig.sources ?? [],
    triviaTags: figureConfig.triviaTags ?? [],
    metadata: {},
  };

  const seenHashes = new Set();

  async function processCandidate(candidate, sectionId, slotIndex, role = 'section') {
    const hash = contentHash(await fetchImageBuffer(candidate.url));
    if (seenHashes.has(hash)) return null;
    seenHashes.add(hash);

    const validation = validateCandidate(candidate, {
      minWidth,
      minHeight,
      requireConcept: !!figureConfig.sections?.find((s) => s.id === sectionId)?.conceptKeywords?.length,
      conceptKeywords: figureConfig.sections?.find((s) => s.id === sectionId)?.conceptKeywords ?? [],
    });
    if (!validation.valid) return null;

    let buffer;
    try {
      buffer = await fetchImageBuffer(candidate.url);
    } catch (e) {
      return null;
    }
    let w = candidate.width ?? 0;
    let h = candidate.height ?? 0;
    try {
      const meta = await sharp(buffer).metadata();
      w = meta.width ?? w;
      h = meta.height ?? h;
    } catch (_) {
      // SVG or unsupported; use candidate dimensions or skip size check
    }
    if (w && h && (w < minWidth || h < minHeight)) return null;

    const imageId = `${sectionId}-${slotIndex}-${hash}`;
    const r2Url = skipUpload
      ? `(dry-run)${candidate.url}`
      : await uploadToR2(buffer, slug, imageId, candidate.mime || 'image/jpeg');

    const altText = candidate.description || candidate.title || candidate.altText || 'Image';
    const tags = candidate.tags ?? [];
    const concepts = candidate.concepts ?? [];

    output.metadata[imageId] = {
      altText,
      tags,
      concepts,
      sourceName: candidate.source ?? 'Wikimedia Commons',
      sourceUrl: candidate.sourceUrl ?? candidate.url,
      license: candidate.normalizedLicense ?? candidate.license,
      r2Url,
    };

    return { r2Url, imageId, altText, tags, concepts };
  }

  // Hero: first section with role hero or first image from "intro" / "hero"
  const heroSection = figureConfig.sections?.find((s) => s.id === 'intro' || s.id === 'hero' || s.role === 'hero');
  const heroKeywords = heroSection?.keywords ?? [figureConfig.figure, 'portrait'];
  if (!skipFetch && heroKeywords.length > 0) {
    const heroCandidates = await fetchByKeywords(heroKeywords.join(' '), { commonsLimit: 5 });
    for (const c of heroCandidates) {
      const result = await processCandidate(c, 'hero', 0, 'hero');
      if (result) {
        output.heroImage = result.r2Url;
        output.metadata['hero-0'] = output.metadata[result.imageId];
        break;
      }
    }
  }

  // Sections with optional keywords
  for (const section of figureConfig.sections ?? []) {
    if (section.id === 'hero' || section.id === 'intro') continue;
    const sectionOutput = {
      id: section.id,
      title: section.title,
      content: section.content ?? '',
      images: [],
      subSections: section.subSections ?? [],
    };

    const urls = manualImageUrls[section.id];
    if (urls?.length) {
      for (let i = 0; i < urls.length; i++) {
        const result = await processCandidate(
          { url: urls[i], license: 'Public Domain', description: section.title },
          section.id,
          i
        );
        if (result) sectionOutput.images.push(result.r2Url);
      }
    } else if (!skipFetch && (section.keywords?.length || section.conceptKeywords?.length)) {
      const query = (section.keywords ?? [section.title]).join(' ');
      const candidates = await fetchByKeywords(query, { commonsLimit: maxImagesPerSection });
      let added = 0;
      for (const c of candidates) {
        if (added >= maxImagesPerSection) break;
        const result = await processCandidate(c, section.id, added);
        if (result) {
          sectionOutput.images.push(result.r2Url);
          added++;
        }
      }
    }

    output.sections.push(sectionOutput);
  }

  return output;
}

/**
 * Load figure config from JSON file and run pipeline.
 */
export async function runPipelineFromConfig(configPath, options = {}) {
  const fullPath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath);
  const json = fs.readFileSync(fullPath, 'utf8');
  const config = JSON.parse(json);
  return runFigurePipeline(config, options);
}
