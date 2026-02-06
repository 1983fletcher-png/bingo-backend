#!/usr/bin/env node
/**
 * Full-Site Scraper & Cloudflare R2 Uploader
 * VLC-style: drop in a URL → scrape → upload images to R2 → return structured JSON
 *
 * Extracts: events, menus, logos, social links, images. Uploads images to R2 and
 * replaces URLs with R2 public URLs (when R2_PUBLIC_BASE_URL is set).
 *
 * Requirements:
 *   - Node 20+
 *   - Puppeteer (local only; not installed on Railway): run `npm install puppeteer` once, then `npm run scrape:site`
 *   - .env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME,
 *     R2_PUBLIC_BASE_URL (see lib/r2.js / .env.example)
 *
 * Usage:
 *   node scripts/scrape-site.js <url>
 *   node scripts/scrape-site.js "https://millsriverbrewing.com"
 *   (outputs JSON to stdout; pipe to file or jq as needed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { uploadToR2 } from '../lib/r2.js';

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

const IMAGE_PREFIX = 'scraped';

function getMimeFromUrl(url) {
  const p = new URL(url, 'https://example.com').pathname.toLowerCase();
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.webp')) return 'image/webp';
  if (p.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

async function fetchAndUploadImage(url, prefix = IMAGE_PREFIX) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'image/*' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || getMimeFromUrl(url);
    const ext = (contentType.split('/')[1] || 'jpg').replace(/^x-/, '');
    const result = await uploadToR2(buffer, contentType, prefix, ext);
    if (result.error) {
      console.warn('R2 upload failed:', url, result.error);
      return null;
    }
    return result.url || null;
  } catch (err) {
    console.warn('Image fetch/upload failed:', url, err.message);
    return null;
  }
}

export async function scrapeSite(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (err) {
    console.error('Page load failed:', err.message);
    await browser.close();
    return null;
  }

  const data = await page.evaluate(() => {
    const events = [];
    const menus = [];
    const images = [];
    const logos = [];
    const socials = {};

    document.querySelectorAll('*').forEach((el) => {
      if (el.innerText && /(event|calendar|trivia|show|gig)/i.test(el.innerText)) {
        events.push({
          title: el.innerText.split('\n')[0] || 'Untitled Event',
          description: el.innerText,
          date: el.getAttribute('data-date') || '',
          time: el.getAttribute('data-time') || '',
          image: el.querySelector('img') ? el.querySelector('img').src : null,
        });
      }
    });

    document.querySelectorAll('*').forEach((el) => {
      if (el.innerText && /(menu|drink|cocktail|beer|price)/i.test(el.innerText)) {
        const priceMatch = el.innerText.match(/\$\d+(?:\.\d{2})?/);
        menus.push({
          name: el.innerText.split('\n')[0] || 'Menu Item',
          price: priceMatch ? priceMatch[0] : '',
          image: el.querySelector('img') ? el.querySelector('img').src : null,
        });
      }
    });

    const logoEl = document.querySelector('img.logo, header img, .logo img');
    if (logoEl?.src) logos.push(logoEl.src);

    document.querySelectorAll('a').forEach((a) => {
      const href = (a.href || '').toLowerCase();
      if (href.includes('facebook.com')) socials.facebook = a.href;
      if (href.includes('instagram.com')) socials.instagram = a.href;
      if (href.includes('twitter.com') || href.includes('x.com')) socials.twitter = a.href;
      if (href.includes('youtube.com')) socials.youtube = a.href;
      if (href.includes('tiktok.com')) socials.tiktok = a.href;
    });

    document.querySelectorAll('img').forEach((img) => {
      if (img.src) images.push(img.src);
    });

    return { events, menus, images, logos, socials };
  });

  await browser.close();

  const allImageUrls = [
    ...(data.images || []),
    ...(data.events.map((e) => e.image).filter(Boolean)),
    ...(data.menus.map((m) => m.image).filter(Boolean)),
    ...(data.logos || []),
  ];
  const uniqueUrls = [...new Set(allImageUrls)];
  const uploadedMap = {};
  for (const u of uniqueUrls) {
    const r2Url = await fetchAndUploadImage(u);
    if (r2Url) uploadedMap[u] = r2Url;
  }

  data.events = data.events.map((e) => ({ ...e, image: uploadedMap[e.image] ?? e.image }));
  data.menus = data.menus.map((m) => ({ ...m, image: uploadedMap[m.image] ?? m.image }));
  data.images = (data.images || []).map((i) => uploadedMap[i] ?? i);
  data.logos = (data.logos || []).map((l) => uploadedMap[l] ?? l);

  return data;
}

const url = process.argv[2];
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain && !url) {
  console.error('Usage: node scripts/scrape-site.js <url>');
  process.exit(1);
}
if (isMain && url) {
  scrapeSite(url)
    .then((data) => {
      if (data === null) process.exit(1);
      console.log(JSON.stringify(data, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
