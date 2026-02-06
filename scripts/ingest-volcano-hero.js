#!/usr/bin/env node
/**
 * Ingest one hero image for baking-soda-volcano and output VolcanoImage JSON.
 * Run from repo root with R2_* set. To register: node scripts/ingest-volcano-hero.js | node scripts/register-volcano-image.js
 * If the default URL 404s, replace HERO_IMAGE_URL and SOURCE_URL with a current PD image from Wikimedia/NASA/USGS.
 */
import { ingestVolcanoImage } from '../lib/imageIngest.js';

const HERO_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/3/3f/Baking_soda_vinegar_reaction.jpg';
const SOURCE_URL = 'https://commons.wikimedia.org/wiki/File:Baking_soda_vinegar_reaction.jpg';

ingestVolcanoImage({
  imageUrl: HERO_IMAGE_URL,
  volcanoSlug: 'baking-soda-volcano',
  role: 'hero',
  priority: 0,
  metadata: {
    title: 'Baking Soda and Vinegar Reaction',
    description: 'Foamy eruption from acid-base reaction',
    altText: 'A baking soda and vinegar volcano erupting with foamy bubbles',
    sourceName: 'Wikimedia Commons',
    sourceUrl: SOURCE_URL,
    license: 'Public Domain',
    attributionRequired: false,
    tags: ['volcano', 'experiment', 'chemistry'],
    concepts: ['acid-base reaction', 'carbon dioxide'],
    verified: true,
  },
})
  .then((record) => {
    console.log(JSON.stringify(record, null, 2));
  })
  .catch((err) => {
    console.error('Ingest failed:', err.message);
    process.exit(1);
  });
