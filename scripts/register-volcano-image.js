#!/usr/bin/env node
/**
 * Append an ingested VolcanoImage (from ingestVolcanoImage) to the registry.
 * Usage: node scripts/register-volcano-image.js < path/to/record.json
 * Or: node scripts/ingest-volcano-image.js ... | node scripts/register-volcano-image.js
 *
 * Reads one VolcanoImage JSON object from stdin, appends to frontend/src/data/volcano-images.json
 * under the image's volcanoSlug and usage.role.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

const REGISTRY_PATH = new URL('../frontend/src/data/volcano-images.json', import.meta.url);

async function readStdin() {
  const lines = [];
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) lines.push(line);
  return lines.join('\n');
}

function main() {
  readStdin().then((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      console.error('No JSON on stdin. Pipe a VolcanoImage record.');
      process.exit(1);
    }
    let record;
    try {
      record = JSON.parse(trimmed);
    } catch (e) {
      console.error('Invalid JSON:', e.message);
      process.exit(1);
    }
    const { volcanoSlug, usage } = record;
    if (!volcanoSlug || !usage?.role) {
      console.error('Record must have volcanoSlug and usage.role');
      process.exit(1);
    }
    const role = usage.role;
    if (!['hero', 'section', 'gallery', 'diagram'].includes(role)) {
      console.error('usage.role must be hero, section, gallery, or diagram');
      process.exit(1);
    }

    const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
    if (!registry[volcanoSlug]) {
      registry[volcanoSlug] = { hero: [], section: [], gallery: [], diagram: [] };
    }
    const existing = registry[volcanoSlug][role];
    if (existing.some((img) => img.id === record.id)) {
      console.error('Image id already in registry:', record.id);
      process.exit(1);
    }
    registry[volcanoSlug][role].push(record);
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
    console.log('Registered', record.id, 'under', volcanoSlug, role);
  });
}

main();
