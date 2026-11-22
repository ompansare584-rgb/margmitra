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
