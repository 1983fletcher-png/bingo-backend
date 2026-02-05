# Let Cursor (and scripts) push to GitHub and sync to the live app

So that the agent can **push** and **sync the frontend to music-bingo-app** without you typing credentials, do this one-time setup.

---

## Why plain `git push` fails (use the token instead)

When Cursor or a script runs **`git push origin main`** without your GitHub credentials, Git tries to prompt for a username. In that environment there is no terminal for input, so you get:

```text
fatal: could not read Username for 'https://github.com': Device not configured
```

**Fix:** Do **not** use plain `git push`. Use the **GitHub token** so Git never has to ask for a username:

1. Put **GITHUB_TOKEN** in this repo's **.env** (or **env**) — see below.
2. Use **scripts/git-push-with-token.sh** (or **deploy-playroom.sh**, which calls it). The script reads the token from `.env` and pushes using `https://TOKEN@github.com/...`, so the push goes straight to GitHub with no prompt.

That way every push from Cursor or CI uses the token and succeeds.

---

## From Cursor: always use the token

**We use the GitHub token for every push** so there are no "could not read Username" or "Device not configured" errors.

- **Do not** run plain `git push origin main` from the agent/Cursor — it will fail with the error above.
- **Do** ensure **GITHUB_TOKEN** is in this repo's **.env** or **env** file (see below).
- **Do** use **scripts/git-push-with-token.sh** (or **deploy-playroom.sh** / **sync-and-push-roll-call.sh**, which use it) so the token is used automatically.
- Scripts load `.env` / `env` from the repo root and use the token in the push URL.

This is the standard from now on for smooth pushes.

---

## 1. GitHub Personal Access Token (PAT)

1. On GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. **Generate new token (classic)**.
3. Name it (e.g. `Playroom deploy`), set **Expiration** (e.g. 90 days or no expiration).
4. Scopes: enable **repo** (full control of private repositories).
5. Generate and **copy the token** (you won’t see it again).

---

## 2. Give Cursor the token

**Option A — Cursor env (recommended)**  
In Cursor: **Settings → Cursor Settings → General**, or your project’s env:

- Add an environment variable: **`GITHUB_TOKEN`** = your PAT.

**Option B — Shell / deploy script**  
Before running deploy or sync scripts:

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
./scripts/deploy-playroom.sh
```

**Option C — .env (do not commit)**  
In the repo root (and add `GITHUB_TOKEN` to `.gitignore` if you put it in a file):

```bash
# .env (never commit this file)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Then in scripts or Cursor you can `source .env` or `set -a; source .env; set +a` before running deploy/sync.

---

## 3. What uses the token

- **`scripts/git-push-with-token.sh`**  
  If `GITHUB_TOKEN` is set, it pushes the **current repo** to `origin main` using the token. Otherwise it runs a normal `git push origin main`.

- **`scripts/deploy-playroom.sh`**  
  Uses `git-push-with-token.sh` to push **this repo** (Music Bingo Backend). So with `GITHUB_TOKEN` set, the agent can commit and push from here.

- **`scripts/sync-and-push-roll-call.sh`**  
  After copying Roll Call files into music-bingo-app, it runs `git-push-with-token.sh` **from the app repo**, so that repo is pushed too (same token if both are under your account).

- **`scripts/sync-full-frontend-and-push.sh`**  
  Copies the **full frontend** (Host, Play, Print, components, data, lib, types, etc.) into music-bingo-app, then commits and pushes the app repo via `git-push-with-token.sh`.

---

## 4. Where is music-bingo-app?

Sync scripts need the path to the **music-bingo-app** repo (the one Netlify builds).

**Option A — Env var**  
Set once:

```bash
export MUSIC_BINGO_APP_PATH="/full/path/to/music-bingo-app"
```

Then run:

```bash
./scripts/sync-full-frontend-and-push.sh
# or
./scripts/sync-and-push-roll-call.sh
```

with no arguments; they use `MUSIC_BINGO_APP_PATH` if set.

**Option B — Clone next to this repo**  
```bash
cd "/path/to/parent"
git clone https://github.com/YOUR_USER/music-bingo-app.git
```

Then:

```bash
./scripts/sync-full-frontend-and-push.sh ../music-bingo-app
```

**Option C — Automatic guess**  
`./scripts/sync-full-frontend-and-push.sh` (and the roll-call script) try `..` and `../music-bingo-app` if `MUSIC_BINGO_APP_PATH` is not set.

---

## 5. One-command flow (after setup)

With **GITHUB_TOKEN** and (if needed) **MUSIC_BINGO_APP_PATH** set:

1. **Backend only (commit + push this repo)**  
   ```bash
   ./scripts/deploy-playroom.sh
   ```

2. **Sync full frontend to live app (copy + commit + push music-bingo-app)**  
   ```bash
   ./scripts/sync-full-frontend-and-push.sh
   ```
   Or with path:  
   `./scripts/sync-full-frontend-and-push.sh /path/to/music-bingo-app`

3. **Roll Call only (smaller sync)**  
   ```bash
   ./scripts/sync-and-push-roll-call.sh
   ```
   Or:  
   `./scripts/sync-and-push-roll-call.sh ../music-bingo-app`

After step 2, Netlify will build and deploy the updated music-bingo-app, including the Print tab and the rest of the frontend.
