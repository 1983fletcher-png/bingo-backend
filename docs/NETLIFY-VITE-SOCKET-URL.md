# Live site: set VITE_SOCKET_URL in Netlify

**Set VITE_SOCKET_URL in Netlify to your Railway backend URL (no trailing slash) and redeploy so the app can connect.**

---

## Steps

1. **Netlify** → your site → **Site configuration** → **Environment variables**.
2. Add or edit:
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** your Railway backend URL, e.g. `https://bingo-backend-production-xxxx.up.railway.app`
   - **No trailing slash.**
   - **Scopes:** Production (and any branch you deploy from).
3. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.

The URL is baked in at **build time**. After the new deploy, the Create poll page will show “This build connects to: *your-railway-hostname*” when it’s correct.
