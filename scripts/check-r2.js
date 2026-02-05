#!/usr/bin/env node
/**
 * Check if R2 is configured (does not log any secrets).
 * Run from project root: node scripts/check-r2.js
 * Loads .env from project root if the file exists.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
import { isR2Configured } from '../lib/r2.js';

const configured = isR2Configured();
console.log(configured ? 'R2 is configured. Upload endpoint will work.' : 'R2 is NOT configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME (and optionally R2_ENDPOINT, R2_PUBLIC_BASE_URL) in .env');
process.exit(configured ? 0 : 1);
