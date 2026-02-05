# Cloudflare R2 setup — step-by-step

Use Cloudflare R2 (S3-compatible storage) to store uploaded images and assets. Follow these steps so the backend can upload and serve them.

---

## 1. Cloudflare Dashboard — get your values

1. **Log in** to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. **R2** → **Overview** → **Create bucket**. Name it (e.g. `playroom-assets`). Create.
3. **Account ID:** On the R2 overview page, note your **Account ID** (right sidebar or in the R2 URL).
4. **API token:** **R2** → **Manage R2 API Tokens** → **Create API token**.
   - Name: e.g. `playroom-backend`.
   - Permissions: **Object Read & Write** (or at least edit for the bucket you use).
   - Optional: **Specify bucket** → select your bucket, or leave “Apply to all buckets” if you prefer.
   - Create. You’ll see:
     - **Access Key ID** (like an username)
     - **Secret Access Key** (like a password) — **copy and store it now**; it won’t be shown again.
5. **Endpoint:**
   - **Default:** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (replace `<ACCOUNT_ID>` with your account ID).
   - **Jurisdiction-specific:** If you turned on “Use jurisdiction specific endpoints for S3 clients,” use the endpoint Cloudflare shows there (e.g. a different host for EU). Paste that full URL.
6. **Bucket name:** The name you gave the bucket (e.g. `playroom-assets`).
7. **Public access (for image URLs):** **R2** → your bucket → **Settings** → **Public access**.
   - Enable **Allow Access** and choose either:
     - **R2.dev subdomain** — Cloudflare gives you a URL like `https://<id>.r2.dev`. Use that as the public base.
     - **Custom domain** — e.g. `https://assets.yourdomain.com`. You’ll need to add the domain in Cloudflare and attach it to the bucket.
   - The **public base URL** is what you’ll set as `R2_PUBLIC_BASE_URL` (e.g. `https://xxx.r2.dev` or `https://assets.yourdomain.com`).

---

## 2. Where to put the env vars

**Don’t paste your secret keys in Cursor chat** — chat can be stored. Put them only in your **`.env`** file (and in Railway’s Variables) so they stay private.

### Local (`.env`)

1. In your project root, open **`.env`** (create it if needed — e.g. copy from `.env.example`).
2. Copy the block below into `.env`. Then **paste your real values after each `=`** (no spaces around `=`).

```bash
# Cloudflare R2 — paste your values after the = (no quotes needed)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=
```

3. Fill each line: e.g. `R2_ACCESS_KEY_ID=abc123...` (the token’s Access Key ID), `R2_SECRET_ACCESS_KEY=xyz...` (Secret Access Key), etc. Save the file.
4. Restart the backend (or run `npm run dev`) so it picks up the new vars. Then `POST /api/upload-image` will use R2.

- Replace `your_cloudflare_account_id` with your **Account ID** (step 3).
- Replace `your_r2_access_key_id` and `your_r2_secret_access_key` with the **Access Key ID** and **Secret Access Key** from the API token (step 4).
- Replace `playroom-assets` with your **bucket name** (step 6).
- **R2_ENDPOINT:** Use the default `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` or, if you use jurisdiction-specific endpoints, paste the **exact** endpoint URL Cloudflare gives you.
- **R2_PUBLIC_BASE_URL:** The base URL for public object access (e.g. `https://xxx.r2.dev` from R2.dev, or your custom domain). No trailing slash. Required if you want the API to return a direct **url** to the uploaded image; otherwise the API still uploads but returns only **key**.

Never commit `.env` to git. It’s in `.gitignore`.

### Railway (production)

**Quick path:** See **docs/RAILWAY-R2-NEXT-STEPS.md** for a copy-paste table and an optional CLI script that pushes your local `.env` R2 vars to Railway.

1. Open your **Railway** project → your **backend service**.
2. **Variables** (or **Settings** → **Environment variables**).
3. Add the **same** variables as above:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_ENDPOINT`
   - `R2_PUBLIC_BASE_URL`
4. Save. Railway will redeploy with the new vars.

---

## 3. What the backend does

- **Upload:** `POST /api/upload-image` with body `{ file: "<base64>", mimeType: "image/png", prefix?: "uploads" }`. The server uploads to R2 and returns `{ url, key }` (or `{ error }`). If `R2_PUBLIC_BASE_URL` is set, `url` is the public URL to use for the image.
- **Config check:** If any required R2 env var is missing, the upload endpoint returns `503` with a message that upload is not configured.

---

## 4. Quick checklist

| Step | Where | What |
|------|--------|------|
| 1 | Cloudflare | Create R2 bucket; note Account ID |
| 2 | Cloudflare | Create R2 API token; copy Access Key ID + Secret Access Key |
| 3 | Cloudflare | Enable public access on bucket; note public base URL (r2.dev or custom domain) |
| 4 | Local | Add R2_* vars to `.env` |
| 5 | Railway | Add same R2_* vars to the backend service |
| 6 | App | Use `POST /api/upload-image` (e.g. from Host/Display for logos); use returned `url` in your UI |

---

## 5. Optional: jurisdiction-specific endpoint

If you created your API token or bucket with **“Use jurisdiction specific endpoints for S3 clients”**:

- Cloudflare shows a **different endpoint URL** (e.g. for a specific region/jurisdiction).
- Set **R2_ENDPOINT** to that **exact** URL and leave **R2_ACCOUNT_ID** set (it’s still used in docs/tooling). The backend uses **R2_ENDPOINT** when present, so the S3 client will use the jurisdiction-specific endpoint.

You can paste that endpoint value straight from the Cloudflare page into `R2_ENDPOINT`.
