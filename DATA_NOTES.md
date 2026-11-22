# Data notes (Phase 1)

Edit the CSV files in `data/` (Excel or VS Code), then run:

    node scripts/build_data.mjs

It validates everything and rewrites `frontend/src/data/data.json`. If it prints ERROR, fix that line and run again.

## Counts
123 skills | 12 careers | 191 career-skill links (14-20 per career) | 90 questions (3 each for 30 skills) | 60 resource placeholders | 4 schemes | 0 institutes

## Rules used
- Education rank: class10=1, iti=2, class12=2, diploma=3, degree=4. A career is shown if user rank >= career min_education rank.
- weight 1-3 (importance), required_level 1-3 (1 basic, 2 working, 3 solid).
- Questions: 4 options each, `|` separated, correct_index starts at 0. The app should shuffle options with a seeded random.
- Deviation from the master prompt: separate options_en / options_mr columns; 14-20 skills per career (electrician has 20).
- Skills have categories foundation / soft / technical only.

## Honesty
- All Marathi text is an AI draft. A Marathi speaker must review it.
- Question answers were written from common textbook knowledge; have a teacher/ITI instructor check them.
- Resources are search placeholders on official provider homepages (verified=false). No course links are invented.
- Schemes are generic and verified=false. Check each official page before showing any rule, amount or eligibility.
- Pune institutes are NOT included; add real ones from official DVET/MSBTE lists.
