# MargMitra: deploy guide (free tiers)

Order: **Neon (database) -> Render (backend) -> Vercel (frontend) -> back to Render (CORS) -> smoke test.**
Time: about 40 minutes the first time. Screen names below are from memory of these sites; a button may be worded slightly differently.
Nothing here was run from the build sandbox, so treat the first deploy as the real test.

Code must already be pushed to GitHub (`git add . ; git commit -m "..." ; git push`).

---
## 1. Database on Neon (optional but recommended)
Without it, saved sessions are lost every time Render restarts the free server. For a demo that is acceptable; for real pilot data it is not.

1. Open neon.tech, sign in with GitHub, create a project named `margmitra` (pick the region closest to India if offered).
2. Open the project's **Connection details** and copy the connection string. **You should see** a long text starting with `postgresql://` and ending with `?sslmode=require`.
3. Keep it somewhere private (a notes file). Never put it in the code or on GitHub.

Most likely failures:
- Password contains a special character and the string looks broken: copy the string again exactly as Neon shows it.
- Pasted with spaces or quotes around it in Render: remove them.
- First request after idle is slow (database waking up): wait a few seconds and retry.

## 2. Backend on Render
1. render.com -> sign in with GitHub -> **New +** -> **Web Service** -> pick your repo.
2. Fill in:
   - Name: `margmitra-api`
   - **Root Directory: `backend`**
   - Runtime/Language: **Python 3** (not Docker)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Instance type: **Free**
   - (The repo also has `render.yaml`; "New + -> Blueprint" can read it instead of typing the above.)
3. Under **Environment**, add:
   - `PYTHON_VERSION` = `3.11.9`
   - `OFFICER_KEY` = a long random password. PowerShell can make one: `-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 24 | % {[char]$_})`
   - `DATABASE_URL` = the Neon string from step 1 (skip to use a temporary SQLite file)
   - `ALLOWED_ORIGINS` = `http://localhost:5173` for now (you change it in step 4)
4. Click **Create Web Service**. **You should see** build logs ending in "Your service is live".
5. Open `https://margmitra-api.onrender.com/health` (use your own name). **You should see** `{"status":"ok","service":"margmitra-api"}`. The first open after a sleep can take up to a minute.

Most likely failures:
- "Could not open requirements.txt" or module not found: Root Directory is not `backend`.
- Build fails on `psycopg`: set `PYTHON_VERSION` to `3.11.9` exactly, then redeploy.
- Service starts then crashes with "Address already in use / port": the start command must use `$PORT`.

## 3. Frontend on Vercel
1. vercel.com -> sign in with GitHub -> **Add New -> Project** -> import the repo.
2. **Root Directory: `frontend`**. Framework should auto-detect as **Vite**.
3. **Environment Variables:** `VITE_API_URL` = `https://margmitra-api.onrender.com` (your Render URL, **no slash at the end**).
4. Click **Deploy**. **You should see** a confetti/success page and a URL like `https://margmitra-xxxx.vercel.app`.
5. Open it. **You should see** the Marathi welcome screen.

Most likely failures:
- Page loads but "Server not reachable": `VITE_API_URL` was missing or wrong when the build ran. Fix it in Project Settings -> Environment Variables, then **Redeploy** (the value is baked in at build time).
- Build fails: open the build log; copy the first red error and send it to me.
- 404 or blank page: Root Directory is not `frontend`.

## 4. Allow your frontend in the backend (CORS)
1. Render -> `margmitra-api` -> Environment -> set `ALLOWED_ORIGINS` = your exact Vercel URL, e.g. `https://margmitra-xxxx.vercel.app` (no trailing slash; several URLs can be separated by commas).
2. Save. Render redeploys by itself (1-2 minutes).
3. Reload the frontend. **You should see** "Server connected" at the bottom.

Most likely failures:
- Still "Server not reachable": trailing slash, `http` instead of `https`, or you are on a Vercel *preview* URL that differs from the one you listed.
- Browser console shows "blocked by CORS policy": same cause.
- Works on laptop, not phone: the phone is using an older cached page; reload.

## 5. Smoke test (10 points). Do it on a real phone.
1. Open the Vercel URL on the phone. See the Marathi welcome screen.
2. Toggle मराठी / English. All text changes; nothing shows raw keys like `edu_iti`.
3. Fill profile (ITI, Pune, 18+, one interest) and continue.
4. Type "mala taar jodni yete" in skills, tap Find skills, tap the suggestion. "Wiring" appears.
5. Add one more skill from search, set levels. Do the quick check (answer 3 questions).
6. Results show 5 careers with a fit % each; open one and read the gaps.
7. Make an 8-week plan; tick a task; progress % moves.
8. Share anonymously (tick consent). See "Shared. Thank you!". Then tap **Delete my shared data**. See "Deleted."
9. Open `<your-url>/#officer`: **Show sample data** shows an orange **SAMPLE DATA** ribbon. Enter your `OFFICER_KEY` and **Load live data**: with fewer than 5 shared records you see "Fewer than 5 students..." (this is correct).
10. Backend-asleep fallback: turn on airplane mode or wait 20 minutes, reload. The app still works for steps 1-7 and shows "Server not reachable... The app still works". Sharing fails politely.

## 6. Wake-up routine: 10 minutes before ANY demo
The free Render server sleeps after about 15 minutes without use and takes up to a minute to wake.
1. 10 min before: run `.\scripts\wake.ps1 -Url https://margmitra-api.onrender.com`. Wait for "AWAKE".
2. Open the frontend on the demo device. Check "Server connected".
3. Do one full run (profile -> results -> plan) so everything is loaded.
4. Open `/#officer` and press **Show sample data** once, so the screen is ready.
5. 2 minutes before: open `/health` once more so the server does not fall asleep.
6. Keep screenshots/a screen recording of the full flow as a backup in case the venue Wi-Fi fails.

## Settings summary
| Where | Name | Value |
|---|---|---|
| Render | Root Directory | `backend` |
| Render | Build / Start | `pip install -r requirements.txt` / `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Render | PYTHON_VERSION | `3.11.9` |
| Render | ALLOWED_ORIGINS | your Vercel URL, no trailing slash |
| Render | OFFICER_KEY | long random password (switches the officer page on) |
| Render | DATABASE_URL | Neon string (optional) |
| Render | MIN_GROUP | optional, minimum 5 |
| Vercel | Root Directory | `frontend` |
| Vercel | VITE_API_URL | your Render URL, no trailing slash |

## Honest limits
- Render free tier: sleeps, cold start up to ~1 minute, 512 MB RAM.
- Without `DATABASE_URL`, shared data disappears on restart. The Postgres code path has not been run in testing: after step 2 do a share + delete from the app and look at the Render logs for errors.
- Officer access is a single shared key. That is fine for a demo, not for a real department rollout (needs proper login).
- Run backend tests locally: `.venv\Scripts\python -m pip install -r backend\requirements-dev.txt` then `cd backend` and `..\.venv\Scripts\python -m unittest discover -s tests -v`.
