# STATE

Project: MargMitra (मार्गमित्र), Seva First Innovation Challenge 2026, Maharashtra.

## Done
- Phase 0: skeleton. Vite + React + Tailwind v4 frontend, FastAPI backend with /health, Marathi/English toggle (en.json, mr.json), backend status pill, Noto Sans Devanagari via @fontsource.
- Deployment files: setup.ps1, start.ps1, backend/.python-version, DEPLOY.md (backend on Render free web service, frontend on Vercel).

## Decisions
- Tailwind v4 via @tailwindcss/vite; colours in src/index.css under @theme.
- Frontend runs all deterministic logic later; backend only does /understand, /sessions, /officer/stats, delete.
- Language saved in localStorage key "lang", default Marathi.
- Backend allowed origins come from the ALLOWED_ORIGINS environment variable.
- Hugging Face Docker Spaces are marked Paid, so the backend deploys to Render free (512 MB RAM, sleeps when idle, ephemeral disk). Student data must go to a free hosted Postgres (Neon or Supabase).
- OPEN QUESTION for Phase 2: torch + sentence-transformers probably will not fit in 512 MB. Decide then between a lightweight matcher (character n-gram TF-IDF plus fuzzy alias matching) and an external embedding service.
- Backend ping waits up to 60 s because a sleeping free Space is slow to wake.

## Next
- Phase 1: dataset (skills, careers, career_skills, questions, resources, institutes, schemes) for the 12 careers.

## Phase 1 - dataset (done)
- data/*.csv created; scripts/build_data.mjs validates and writes frontend/src/data/data.json (passes).
- 123 skills, 12 careers, 191 links, 90 questions, 60 resource placeholders, 4 schemes, 0 institutes.
- Next: Phase 2 (scoring + matcher + tests).

## Phase 2 - scoring + matcher + tests (done)
- frontend/src/lib/scoring.js (eligibility, coverage, interest, fit, gaps, ranking, quiz level), shuffle.js (seeded), matcher.js (free text -> skills).
- Matcher decision: NO neural model (would not fit Render 512 MB). Uses Unicode normalisation, whole-phrase match, spelling-variant matching (edit distance) and trigram match on skill names/aliases (English, Marathi, Roman-Marathi). Runs in the browser. Student must confirm every suggestion.
- Tests: tests/*.test.mjs, 15 passing. Run: `cd frontend && npm test`.
- Matcher eval on 30 self-written phrases (eval/matcher_eval.json): precision 81%, recall 100%. Own small set, tuned while building - NOT independent. Known weak spot: similar-spelling false matches (e.g. billing/milling); confirm step handles it.
- WORDING: deck/form must say "language-aware text matching" not "AI/ML model". See TODO_VERIFY.md.
- Next: Phase 3 (API).

## Phase 3 - API (done, route tests not run in my sandbox)
- backend: models.py (strict, no personal fields, consent + under-18 parental consent), db.py (SQLite, delete token stored hashed), stats.py (min group 5, small groups hidden), refs.py + ref_ids.json (written by build_data.mjs), main.py (POST /sessions, DELETE /sessions/{id}, GET /officer/stats, rate limit, CORS limited).
- DEVIATION: no /understand endpoint. Free-text matching runs in the browser (Phase 2), so nothing typed is sent to a server.
- data/districts.csv (36 districts, EN+MR) -> data.json.districts.
- frontend/src/api.js: saveSession, deleteSession, getOfficerStats.
- Tests: 12 core tests pass (python -m unittest); 1 route test needs fastapi+httpx, skipped here.
- Next: Phase 4 (student UI).

## Phase 4 - student UI (done)
- Flow: Welcome -> Profile (education, district, age, interests) -> Skills (free text matcher + search + level 1-3) -> optional Quiz (3 Qs per skill, max 5 skills; level set from answers) -> Results (top 5 / all careers, fit %, gaps, learn links, schemes, anonymous share with consent, delete my data).
- Files: src/App.jsx, src/components/{Welcome,Profile,Skills,Quiz,Results,ui}.jsx, src/lib/{i18n,store}.js, i18n en/mr (94 keys each).
- Tested in a real browser (bundled with esbuild, Playwright, 390px wide): full flow in English, Marathi toggle, reload keeps language, consent gating, under-18 parental box, graceful failure with server offline. NOT checked: Tailwind styling/looks (Tailwind not available in my sandbox), Vite build.
- Quiz rule: a tested skill's level = quiz result (0-3), replacing the self-rating. 0/3 correct = level 0.
- Skills without questions (only 30 have) keep the self-rating.
- Next: Phase 5 (8-week plan + checkpoints).

## Phase 5 - 8-week plan + checkpoints (done)
- lib/plan.js: weeks 1-6 learn (top 12 skill gaps, max 2 per week, spare weeks to biggest gaps), week 7 practice on a real task, week 8 review. Pure/deterministic; 7 unit tests (22 JS tests total).
- components/Plan.jsx: pick 3/5/8 hours per week, tick tasks, progress %, "fit now vs at start", per-skill 3-question checkpoint (updates the skill level), resource links, "later" skills list. Plan saved in the browser (localStorage). One plan at a time.
- Reached from a career's detail page ("Make my 8-week plan") and "My plan" on results.
- Tested in browser: plan creation, progress, checkpoint, persistence across reload, Marathi.
- Plan text is a generic template; no invented course content or durations.
- Next: Phase 6 (officer dashboard).

## Phases 6-8 (done)
- Phase 6: Officer dashboard (`/#officer`): key login, district filter, totals/gaps/careers/education/districts, CSV export, orange SAMPLE DATA ribbon for invented demo numbers, groups < 5 hidden.
- Phase 7: render.yaml, Postgres support via DATABASE_URL (psycopg, written but NOT run in sandbox), scripts/wake.ps1, DEPLOY.md (steps, smoke test, wake-up routine).
- Phase 8: README.md, docs/demo-script.md (90-second demo + 5-minute pitch), final TODO_VERIFY.md.
- Tests: 31 JS tests + 12 Python core tests pass; browser flow, plan, checkpoint and officer screen tested at phone width. Not run here: API route tests (no FastAPI), Postgres path, Vite/Tailwind build, deployed site.
