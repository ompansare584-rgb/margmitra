# MargMitra (मार्गमित्र)

A free, Marathi-first career-pathway web app for ITI, diploma, 10th and 12th-pass students in Maharashtra.
A student says what they can do and like; MargMitra shows the best-fit careers, the exact skill gaps and an 8-week plan.
Anonymised, consent-based totals give a district officer a skill-gap view.

Built for the Seva First Innovation Challenge 2026 (Education and Employability: career guidance, skill-gap identification and learning-to-career pathways). Team OGGY&COCKROACHES.

**Status: working prototype. It has NOT been tested with students or used by any institute.** No survey or pilot results exist.

## What it does
1. **Profile**: education, district (36 Maharashtra districts), age band, interests.
2. **Skills**: type in Marathi, English or Roman-script Marathi ("taar jodni"), tap suggested skills, or search 123 skills; rate each Basic / Working / Good.
3. **Quick check (optional)**: 3 questions per skill (30 skills have questions); the answers set the skill level.
4. **Results**: 12 careers ranked by fit %, with skill gaps, learning links and government programmes.
5. **8-week plan**: 6 weeks learning, 1 week practice, 1 week review; tick tasks, retake checkpoints, see fit change.
6. **Share (optional)**: anonymous summary after consent (parent/guardian consent for under 18). Students can delete it.
7. **Officer view** (`/#officer`): totals by skill gap, career, education and district. Groups smaller than 5 are hidden. Has a clearly labelled SAMPLE DATA mode for demos.

## How it works (no black box)
- **Fit score** = round(100 x (0.8 x coverage + 0.2 x interest)).
  coverage = sum(weight x min(student level, required level) / required level) / sum(weights). interest = matching interest tags / the career's tags.
  Careers are filtered by education first (10th < ITI = 12th < diploma < degree). Same input always gives the same output.
- **Free text to skills** is lightweight text matching (Unicode normalisation, whole-phrase match, edit-distance for spelling slips, trigram match against skill names and aliases). It is **not** a trained AI/ML model. The student confirms every suggestion.
- **Data** is curated by the team in `data/*.csv` (skills, careers, links, questions, resources, schemes) and compiled to JSON by `scripts/build_data.mjs`, which validates it.

## Architecture
```
frontend/  React + Vite + Tailwind v4 (Marathi/English). All scoring, matching and plan logic run in the browser.
backend/   FastAPI. Only: POST /sessions, DELETE /sessions/{id}, GET /officer/stats, GET /health.
           SQLite locally; Postgres (Neon/Supabase) when DATABASE_URL is set.
data/      CSV source of truth -> frontend/src/data/data.json and backend/ref_ids.json
```
Nothing a student types in the free-text box is sent to a server.

## Run it on Windows
```powershell
.\setup.ps1     # once: creates .venv, installs Python and Node packages
.\start.ps1     # opens backend (port 8000) and frontend (http://localhost:5173)
```
Tests:
```powershell
cd frontend ; npm test                       # JavaScript tests (scoring, matcher, plan)
node scripts\build_data.mjs                  # validates the dataset
cd ..\backend
..\.venv\Scripts\python -m pip install -r requirements-dev.txt
..\.venv\Scripts\python -m unittest discover -s tests -v
```
Deploy: see `DEPLOY.md` (Neon + Render + Vercel, free tiers).

## Privacy
- Stored only if the student consents: random session id, education, district, age band (under 18 / 18+), language, interests, top career, fit, skill gaps, timestamp.
- Never collected: name, phone, email, Aadhaar, address, free text.
- The API rejects any extra field. Under-18 students need a parent/guardian consent tick (DPDP Act 2023 requirement for children's data).
- The delete token is shown once; only its hash is stored. Students can delete their record any time.
- The officer view shows totals only and hides any group smaller than 5.
- A lawyer or school authority should review the privacy text before real students use it.

## Limitations (please read)
- Not tested with students; no accuracy or outcome numbers exist. The matcher scored 81% precision / 100% recall on 30 phrases written by the developer (tuned on the same phrases), which is not an independent result.
- Marathi text and quiz answers are AI drafts that need review by a Marathi speaker and an ITI/diploma instructor.
- Resource links are general provider homepages (`verified=false`); scheme entries are generic and `verified=false`. Check every link and rule on the official site before relying on it.
- No institutes are included yet (`data/institutes.csv` is empty). Add real ones from official DVET/MSBTE lists.
- Only 12 careers and 123 skills; 30 skills have quiz questions.
- No voice input, no offline/PWA mode.
- Free hosting sleeps after ~15 minutes idle (first load can take up to a minute); without `DATABASE_URL` shared data is lost on restart.
- Officer access uses one shared key; a real rollout needs proper login.
- The Postgres code path and the API route tests have not been run in the build sandbox.

## Files to know
`STATE.md` (what was built per phase), `TODO_VERIFY.md` (what a human must check), `DATA_NOTES.md` (dataset rules), `DEPLOY.md`, `docs/demo-script.md`.
