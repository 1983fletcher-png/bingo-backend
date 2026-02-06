/**
 * Cloudflare R2 (S3-compatible) storage. Used for uploading images and assets.
 * Only active when R2_* env vars are set. See docs/R2-SETUP.md.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdef', 12);

let cachedClient = null;

/**
 * @returns {import('@aws-sdk/client-s3').S3ClientConfig & { bucket: string, publicBaseUrl: string | null } | null}
 */
export function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const endpoint = process.env.R2_ENDPOINT?.trim() || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : null);
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim() || null;
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint, publicBaseUrl };
}

function getConfig() {
  return getR2Config();
}

/**
 * @returns {S3Client|null} S3 client configured for R2, or null if R2 is not configured
 */
export function getR2Client() {
  if (cachedClient) return cachedClient;
  const config = getConfig();
  if (!config) return null;
  cachedClient = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return cachedClient;
}

/**
 * @returns {boolean} True if R2 is configured and usable
 */
export function isR2Configured() {
  return getConfig() !== null;
}

/**
 * Upload a buffer to R2. Key will be prefix/randomId.ext (or prefix/randomId if no extension).
 * @param {Buffer} buffer - File content
 * @param {string} mimeType - e.g. 'image/png', 'image/jpeg'
 * @param {string} [prefix='uploads'] - Key prefix (folder)
 * @param {string} [extension] - Optional file extension (e.g. 'png') for key
 * @returns {{ url: string, key: string } | { error: string }} Public URL (if R2_PUBLIC_BASE_URL set) and key, or error
 */
export async function uploadToR2(buffer, mimeType, prefix = 'uploads', extension = null) {
  const config = getConfig();
  if (!config) return { error: 'R2 not configured. Set R2_* env vars.' };
  const client = getR2Client();
  if (!client) return { error: 'R2 client unavailable.' };

  const ext = extension || (mimeType && mimeType.split('/')[1]) || 'bin';
  const safeExt = ext.replace(/[^a-z0-9]/gi, '') || 'bin';
  const key = `${prefix}/${nanoid()}.${safeExt}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
      })
    );
    const url = config.publicBaseUrl
      ? `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : null;
    return { url, key };
  } catch (err) {
    return { error: err.message || 'Upload failed' };
  }
}
