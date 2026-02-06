#!/usr/bin/env node
/**
 * Dynamic Figure Ingestion — Keyword-driven image search, validate, R2 upload, output schema
 *
 * Usage:
 *   node scripts/ingest-figure-dynamic.js data/figures/nikola-tesla.config.json
 *   node scripts/ingest-figure-dynamic.js data/figures/nikola-tesla.config.json --dry-run
 *   node scripts/ingest-figure-dynamic.js data/figures/nikola-tesla.config.json --out output/tesla-page.json
 *
 * Loads figure config (figure, lifespan, sections with keywords), fetches image candidates
 * from Wikimedia Commons (and optionally NASA), validates license/dimensions/concept,
 * uploads to R2 at figures/<figure_slug>/<id>.<ext>, and writes JSON in the scalable
 * page template schema (heroImage, sections with images, metadata, triviaTags).
 *
 * Requires: .env with R2_* vars (see lib/r2.js). Optional: --dry-run (no upload, no write).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPipelineFromConfig } from '../lib/imageIngest/figurePipeline.js';

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

const args = process.argv.slice(2);
const configPath = args.find((a) => !a.startsWith('--')) || 'data/figures/nikola-tesla.config.json';
const dryRun = args.includes('--dry-run');
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

async function main() {
  console.log('Figure config:', configPath);
  if (dryRun) console.log('Dry run: no R2 upload, no file write.');

  const options = {
    minWidth: 600,
    minHeight: 400,
    maxImagesPerSection: 5,
    skipFetch: false,
    skipUpload: dryRun,
  };

  const output = await runPipelineFromConfig(configPath, options);

  const json = JSON.stringify(output, null, 2);
  if (outPath && !dryRun) {
    const dir = path.dirname(path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath));
    if (dir) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, json, 'utf8');
    console.log('Wrote:', outPath);
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
