# MargMitra demo script

Everything below describes only what the prototype really does. Do not add claims beyond it.

## Before you start (10 minutes ahead)
1. `.\scripts\wake.ps1 -Url https://YOUR-API.onrender.com` until it says AWAKE.
2. Open the Vercel URL on the phone you will demo on. Bottom of the screen must say "Server connected".
3. Run the full flow once (profile, skills, results, plan), then **Start over**.
4. Open `/#officer`, press **Show sample data** once, then go back to the student app.
5. Have a screen recording of the full flow ready in case Wi-Fi fails.
6. Demo input to type: `mala taar jodni yete, arc welding`. Profile: ITI, Pune, 18 or above, interest "Machines and repair".

---
## A. 90-second screen demo
| Time | What you do on screen | What you say |
|---|---|---|
| 0:00-0:10 | Welcome screen. Tap मराठी / English once. | "MargMitra is a free career guide in Marathi for ITI, diploma and 12th-pass students." |
| 0:10-0:25 | Profile: ITI, Pune, 18+, one interest. Next. | "No name, phone or Aadhaar. The student only picks education, district and interests." |
| 0:25-0:45 | Skills: type `mala taar jodni yete`, tap Find skills, tap **Wiring**. Search "multimeter", add it. | "Students can type the way they speak, even Marathi in English letters. The app suggests skills and the student confirms each one. This is text matching, not a black box." |
| 0:45-0:55 | Quick check: answer 2 or 3 questions (or tap Skip). | "An optional 3-question check sets the skill level from answers, not only self-rating." |
| 0:55-1:10 | Results: point at the top career, the % and the "Build first" line. Open **See details**. | "Fit is a transparent score: how many required skills they already have, plus a small weight for interests. Details show the exact gaps and where to look for free courses." |
| 1:10-1:20 | **Make my 8-week plan**, tick one task, show progress. | "Six weeks to learn, one to practise, one to review. Retaking a check updates their fit." |
| 1:20-1:30 | Open `/#officer`, **Show sample data**. Point at the orange ribbon. | "Officers see only anonymous totals, and groups under 5 are hidden. This screen shows SAMPLE data with invented numbers. Real numbers appear only from students who chose to share." |

---
## B. 5-minute pitch (follows the six slides)
Speak slowly. Total about 5:00.

**Slide 1: Title (0:20)**
- "We are team OGGY&COCKROACHES from VIT Pune. This is MargMitra, a Marathi-first career guide for ITI, diploma and 12th-pass students."
- Note: say "career guide". Do not say "AI model".

**Slide 2: The problem (1:00)**
- "Students choosing a path after Class 10, Class 12, ITI or diploma get almost no personal guidance."
- Use only the statistics printed on the slide and name the source when you say each number. About 1 counsellor per 60,000 students is our own calculation from the cited figures; say "roughly".
- Do not mention any survey of our own. We have not run one.

**Slide 3: Solution and innovation (1:10)**
- "A student types what they can do, in Marathi or English. The app suggests matching skills from a list of about 120, the student confirms, and rules rank 12 careers by fit."
- "They get the exact skill gaps and an 8-week plan, plus government programme links."
- "Officers get an anonymous district skill-gap summary. Small groups are hidden."
- Innovation, honestly: Marathi-first, transparent scoring, privacy by design, one dataset behind both student and officer views.
- Show the 90-second demo here, or live.

**Slide 4: Feasibility and implementation (1:00)**
- "A working prototype is built: React web app, Python FastAPI backend, free hosting."
- "It has not been tested with students yet. Next step is a 3-month pilot in Pune district, with the dataset checked by ITI instructors."
- Costs and partners are estimates and proposals, not confirmed.

**Slide 5: Impact and scalability (0:45)**
- "Free for students. Targets: 10,000 students in year 1 across 5 districts. This is a target, not a result."
- "We will measure the share of users who apply to a course or apprenticeship after their plan. We do not claim jobs."
- "More careers and languages are added as data, not code."

**Slide 6: Team and support (0:45)**
- "Om Suresh Pansare leads product and backend. Om Vijay Gawande works on frontend and data."
- The ask: mentorship, a pilot with a government department, funding, testing/IP support.
- "With support we will verify our dataset with ITI experts and run a 1,000-student pilot."

---
## C. Questions you will probably get (honest answers)
| Question | Answer |
|---|---|
| Is this AI? | "The scoring is rule-based and transparent. Free text is matched to skills with lightweight text matching, and the student confirms every match. We chose this so every result can be explained." |
| Have you tested it with students? | "Not yet. The prototype was built in the last few days. Testing with students is the first step of the pilot." |
| Is the career and skill data correct? | "It is our draft. Skill lists, quiz answers and Marathi text are marked for review by ITI instructors and a Marathi editor. Links and scheme entries are marked unverified until checked." |
| Why not ChatGPT? | "A general chatbot can be wrong about Maharashtra courses and schemes. Ours only shows items from a curated dataset and gives the same result for the same input." |
| What about privacy? | "Nothing typed is sent to a server. Sharing is optional, anonymous and needs consent, with parent consent under 18. Students can delete their record. Officer view hides groups under 5." |
| What if there is no internet? | "The student flow runs in the browser once loaded. Only sharing and the officer view need the server." |
| What does it cost to run? | "Free tiers for the prototype. The pilot estimate on slide 4 is an estimate, not a quote." |
| Who is the user and who is the buyer? | "Students use it free. The district skills office or ITIs would adopt it; that is a proposal, not a signed partnership." |

## D. Never say
- "We surveyed / tested with N students." / any invented numbers or minutes-to-finish.
- "AI embeddings / MiniLM / machine learning model" (not used).
- "Voice input", "works offline", "PWA" (not built).
- "Verified dataset", "official partner", "approved by" (not true yet).
- "Nearby ITIs" (the institute list is empty until real ones are added).
