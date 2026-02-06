#!/usr/bin/env node
/**
 * Example: ingest one learning image (baking soda volcano) into R2.
 * Run from repo root with R2_* env vars set: node scripts/ingest-learning-image.js
 * If the example URL returns 404, replace with a current Public Domain image from
 * https://commons.wikimedia.org (same metadata shape).
 */
import { ingestImage } from '../lib/imageIngest.js';

async function ingestVolcanoImage() {
  return ingestImage({
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/3f/Baking_soda_vinegar_reaction.jpg',
    metadata: {
      title: 'Baking Soda and Vinegar Reaction',
      description: 'Foamy reaction caused by carbon dioxide gas',
      altText:
        'A baking soda and vinegar volcano erupting with foamy bubbles',
      sourceName: 'Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Baking_soda_vinegar_reaction.jpg',
      license: 'Public Domain',
      attributionRequired: false,
      tags: ['volcano', 'experiment', 'chemistry'],
      concepts: ['acid-base reaction', 'carbon dioxide'],
      verified: true,
    },
  });
}

ingestVolcanoImage()
  .then((asset) => {
    console.log('Ingested:', asset.id);
    console.log('URL:', asset.url);
    console.log('License:', asset.license);
  })
  .catch((err) => {
    console.error('Ingest failed:', err.message);
    process.exit(1);
  });
