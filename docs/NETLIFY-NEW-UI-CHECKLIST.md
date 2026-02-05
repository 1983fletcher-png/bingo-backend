# Get the new Playroom UI live on Netlify

If you deployed twice and still see the old UI (no four-card home, no calendar, no Learn & Grow), Netlify is almost certainly **not** building from this repo’s `frontend/` folder. Use this checklist.

---

## 1. Netlify must build from **bingo-backend** (this repo)

- Go to **https://app.netlify.com** → your Playroom site → **Site configuration** → **Build & deploy** → **Build settings**.
- **Repository:** it must be **bingo-backend**  
  - Repo: `1983fletcher-png/bingo-backend`  
- If it’s set to **music-bingo-app**, change it to **bingo-backend**.  
  The new UI (four-card home, calendar, Learn, Join entry, Create) lives in **bingo-backend/frontend/**.

---

## 2. Build settings (must match)

These are in `netlify.toml`; Netlify uses them if the UI doesn’t override. Confirm in the Netlify UI:

| Setting           | Value                          |
|-------------------|---------------------------------|
| **Base directory** | `frontend`                     |
| **Build command**  | `npm ci && npm run build`     |
| **Publish directory** | `dist` (relative to base = `frontend/dist`) |
| **Branch**         | `main` (or your default)      |

If **Base directory** is empty or wrong, Netlify will build the repo root (no React app) and you’ll get the wrong or broken site.

---

## 3. Environment variables

Under **Site configuration** → **Environment variables**:

- **`VITE_SOCKET_URL`** = your backend URL (e.g. `https://your-app.up.railway.app`, no trailing slash).
- **`VITE_API_URL`** = same URL (optional).

Redeploy after changing env vars.

---

## 4. Deploy the latest code

- Ensure the latest code is on **main**: push from this repo so GitHub has the four-card + calendar + Learn UI.
- In Netlify: **Deploys** → **Trigger deploy** → **Clear cache and deploy site** (so the build is fresh).

---

## 5. After deploy

- Wait for the build to finish (check **Deploys** for success).
- Hard refresh the live site: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

You should see:

- Four-card home (Host, Join, Create a page, Learn & Grow)
- Calendar button/link and `/calendar` page
- `/join`, `/create`, `/learn` and Learn card detail

---

## Quick fix summary

1. **Build settings** → Repository = **bingo-backend**, Base directory = **frontend**, Publish = **dist**.
2. **Trigger deploy** → **Clear cache and deploy site**.
3. Hard refresh the site in your browser.
