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
