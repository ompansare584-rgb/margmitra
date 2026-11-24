# Items to verify before the demo

Nothing yet. Every URL, course, institute and scheme added later with verified=false is listed here.

## Phase 1 data checks (user)
- [ ] Marathi reviewed by a Marathi speaker: skills.csv, careers.csv, questions.csv, schemes.csv, resources.csv
- [ ] Question answers checked by a teacher/instructor (questions.csv)
- [ ] Replace the 60 placeholder resources with exact course links, set verified=true
- [ ] Open the 4 scheme links, confirm they work, set verified=true only after checking
- [ ] Add real Pune institutes to institutes.csv (name, type, district, city, trades_or_courses, contact_url, verified)

## Phase 2 wording check (user)
- [ ] Form/deck: do not claim a trained AI/ML model reads free text. Use: "Free-text answers in Marathi or English are matched to skills using language-aware text matching; the student confirms every match. Career scores are calculated by transparent rules, not a black box."
- [ ] Matcher accuracy (81% precision, 100% recall) is on 30 phrases I wrote. Don't quote it as a study result. Test with 10 real phrases from friends.

## Phase 3 checks (user)
- [ ] Run backend tests on your PC (command in DEPLOY.md) - the route test must pass; tell me if it fails.
- [ ] District names/Marathi spellings in data/districts.csv (Ahilyanagar, Chhatrapati Sambhajinagar, Dharashiv are the new official names - confirm).
- [ ] Privacy text for the app: lawyer/teacher review before real students use it (DPDP Act).

## Phase 4 checks (user)
- [ ] Run `.\start.ps1`, open http://localhost:5173 on laptop AND phone (same Wi-Fi, use laptop IP:5173) and click through everything once. Send me screenshots of anything ugly or broken.
- [ ] Marathi UI text in src/i18n/mr.json read by a Marathi speaker.
- [ ] Try on a real student/friend; note where they get stuck.

## Phase 5 checks (user)
- [ ] Click through a plan on laptop and phone; tell me if wording/steps feel wrong for an ITI student.
- [ ] Marathi plan text read by a Marathi speaker (keys task*, week*, plan* in mr.json).

## FINAL checklist before submission / demo (you)
- [ ] `.\setup.ps1`, `.\start.ps1`, click the whole flow on laptop + phone. Run the backend tests (route test must pass).
- [ ] Deploy per DEPLOY.md; do the 10-point smoke test; set OFFICER_KEY; run scripts\wake.ps1 before any demo.
- [ ] Deck/form: remove every claim the prototype does not support: voice input, "AI maps text", MiniLM, PWA, "nearby ITIs", own survey (120 students / 82%), "18 minutes measured in our test", "verified dataset".
- [ ] Slide 4 stage tick: "Working Prototype" only once the deployed site works; otherwise keep "Idea" / "Proof of Concept".
- [ ] Marathi text (mr.json, data CSVs) and quiz answers reviewed by a human.
- [ ] Replace placeholder resource links, check scheme links, add real Pune institutes.
- [ ] Privacy text reviewed (DPDP Act) before real students use it.
