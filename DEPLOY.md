# Deploy MargMitra (free): backend on Render, frontend on Vercel

Replace YOURNAME with your own account names. Do the steps in order.
(Hugging Face Docker Spaces are marked "Paid" for new accounts, so this guide uses Render.)

## 0. Test locally first
    powershell -ExecutionPolicy Bypass -File .\setup.ps1
    powershell -ExecutionPolicy Bypass -File .\start.ps1
You should see a green "सर्व्हर जोडलेला आहे" pill at http://localhost:5173.

## 1. Put the code on GitHub
Create an EMPTY repository named margmitra on github.com (no README), then:
    git init
    git add .
    git commit -m "Phase 0 skeleton"
    git branch -M main
    git remote add origin https://github.com/YOURNAME/margmitra.git
    git push -u origin main

## 2. Backend on Render (free web service)
1. Sign up at render.com with your GitHub account.
2. New -> Web Service -> connect the margmitra repository.
3. Fill the form exactly:
   - Name: margmitra-api
   - Root Directory: backend
   - Runtime / Language: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free
4. Create Web Service and wait 2-4 minutes until it says Live.
5. Open https://margmitra-api.onrender.com/health (Render shows your exact URL at the top of the page).
   You should see {"status":"ok","service":"margmitra-api"}
If the build uses the wrong Python, add an environment variable PYTHON_VERSION = 3.11.9 (the file backend/.python-version already asks for it).

## 3. Frontend on Vercel
    npm.cmd install -g vercel
    cd frontend
    vercel login
    vercel link
    vercel env add VITE_API_URL production
When asked for the value paste your Render URL, for example: https://margmitra-api.onrender.com
    vercel --prod
Vercel prints your public URL, for example https://margmitra.vercel.app

(No command line? Go to vercel.com -> Add New Project -> import the GitHub repo -> set Root Directory to "frontend" -> add environment variable VITE_API_URL -> Deploy.)

## 4. Allow your Vercel site to call the backend (CORS)
Render -> your service -> Environment -> Add Environment Variable:
    Key:   ALLOWED_ORIGINS
    Value: https://margmitra.vercel.app      (your exact Vercel URL, no slash at the end)
Save. Render redeploys by itself.

## 5. Check
Open your Vercel URL. You should see the green "Server connected" pill.
The free Render server sleeps after about 15 minutes without visitors, and the first visit can take about a minute.
Open the link yourself 10 minutes before every demo.

## After changing code
Push to GitHub (git add . / git commit / git push): Render redeploys the backend by itself.
Frontend: cd frontend, then   vercel --prod
Changing VITE_API_URL needs a new   vercel --prod   because Vite bakes it in at build time.

## Limits to remember
- Render free: 512 MB memory, sleeps when idle, files on its disk are lost on restart. Student data must go to a free hosted database (Neon or Supabase) in the later phases, not to local files.

## Phase 3 additions (backend settings on Render -> Environment)
- `OFFICER_KEY` = a long random password for the officer dashboard (without it /officer/stats is switched off).
- `MIN_GROUP` = 5 (optional; values below 5 are ignored).
- `DB_PATH` (optional). Render free disk is ephemeral: saved sessions disappear on restart/redeploy. Fine for a demo; for real data move to Neon/Supabase (Phase 7).
- Run backend tests: `.venv\Scripts\python -m pip install -r backend\requirements-dev.txt` then `cd backend` and `..\.venv\Scripts\python -m unittest discover -s tests -v`
