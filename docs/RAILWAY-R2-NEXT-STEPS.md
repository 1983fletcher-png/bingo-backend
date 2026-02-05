# Railway + R2 — next steps

Your local `.env` is set up for R2. To get **image uploads working in production**, add the same R2 variables to your **Railway** backend service.

---

## Quick setup (paste in terminal)

**Prerequisites:** Your `.env` already has all six `R2_*` variables filled in (same as you use locally).

**One command** — paste this into your terminal (uses `npx` if Railway CLI isn’t installed, so no global install or sudo; then login in browser, link project, push R2 vars):

```bash
bash -c 'cd "/Users/jasonfletcher/Documents/Cursor AI /Music Bingo Backend" && ./scripts/railway-r2-setup.sh'
```

When prompted: complete **railway login** in the browser, then for **railway link** choose your **workspace** → **music-bingo-backend** (or your project name) → **backend service**. After that, the script pushes your R2 variables and Railway redeploys. No secrets are printed.

**Or run step-by-step:** from the repo root, run `./scripts/railway-r2-setup.sh` (same script; use the one-liner above if you’re not already in the repo).

---

## Option A: Railway dashboard (manual)

1. Open **[railway.app](https://railway.app)** and sign in.
2. Open your **project** (e.g. `music-bingo-backend`) → click your **backend service**.
3. Go to **Variables** (or **Settings** → **Environment variables**).
4. Add these **six** variables. Use the **exact names** below; values are the same as in your local `.env`:

   | Variable name           | Where to get the value        |
   |-------------------------|-------------------------------|
   | `R2_ACCOUNT_ID`         | Cloudflare R2 → Account ID   |
   | `R2_ACCESS_KEY_ID`      | R2 API token → Access Key ID |
   | `R2_SECRET_ACCESS_KEY`  | R2 API token → Secret Access Key |
   | `R2_BUCKET_NAME`        | Your bucket name (e.g. `playroom-assets`) |
   | `R2_ENDPOINT`           | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` or jurisdiction-specific URL |
   | `R2_PUBLIC_BASE_URL`    | Public URL (e.g. `https://xxx.r2.dev` or custom domain, no trailing slash) |

5. **Save**. Railway will redeploy with the new variables. After that, `POST /api/upload-image` will use R2 in production.

---

## Option B: Railway CLI (from your machine)

If you use the Railway CLI and have already run `railway link` in this repo, you can push your **local** R2 vars to Railway in one go. Values are read from your `.env` (never committed).

**From the project root:**

```bash
./scripts/set-railway-r2-vars.sh
```

- Requires: **Railway CLI** installed (`npm install -g @railway/cli`), **logged in** (`railway login`), and **linked** (`railway link` + select your backend service).
- The script only sets variables whose names start with `R2_`; it does not change any other Railway variables.
- After it runs, Railway will redeploy. You can confirm in the dashboard under **Variables**.

---

## Checklist

| Step | Done |
|------|------|
| R2 bucket + API token created in Cloudflare | ☐ |
| Local `.env` has all six `R2_*` variables | ☐ |
| Railway backend service has the same six variables (dashboard or CLI) | ☐ |
| Redeploy finished; test `POST /api/upload-image` on your Railway URL | ☐ |

---

## More detail

- **Getting R2 credentials:** See **docs/R2-SETUP.md** (Cloudflare steps, endpoint options, public URL).
- **Backend behavior:** **docs/R2-SETUP.md** also describes what the backend does with these variables and how to call the upload API.
