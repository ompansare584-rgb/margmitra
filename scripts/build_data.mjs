// Usage: node scripts/build_data.mjs   (reads /data/*.csv, writes frontend/src/data/data.json)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(f); f = ""; if (row.some(x => x !== "")) rows.push(row); row = [];
    } else f += c;
  }
  if (f !== "" || row.length) { row.push(f); if (row.some(x => x !== "")) rows.push(row); }
  const [h, ...rest] = rows;
  return (h || []).length ? rest.map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").trim()]))) : [];
}
const load = n => parseCSV(fs.readFileSync(path.join(root, "data", n), "utf8"));
const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);
const list = s => (s ? s.split(";").map(x => x.trim()).filter(Boolean) : []);

const districts = load("districts.csv");
const skills = load("skills.csv"), careers = load("careers.csv"), cs = load("career_skills.csv"),
  questions = load("questions.csv"), resources = load("resources.csv"),
  institutes = load("institutes.csv"), schemes = load("schemes.csv");

const uniq = (arr, what) => { const s = new Set(); arr.forEach(x => { if (s.has(x.id)) err(`duplicate ${what} id ${x.id}`); s.add(x.id); }); return s; };
const skillIds = uniq(skills, "skill"), careerIds = uniq(careers, "career");
uniq(questions, "question"); uniq(resources, "resource"); uniq(schemes, "scheme");

const EDU = ["class10", "class12", "iti", "diploma", "degree"];
const CATS = ["foundation", "soft", "technical"];
skills.forEach(s => {
  if (!s.name_en || !s.name_mr) err(`skill ${s.id}: missing name`);
  if (!CATS.includes(s.category)) err(`skill ${s.id}: bad category ${s.category}`);
});
careers.forEach(c => {
  if (!EDU.includes(c.min_education)) err(`career ${c.id}: bad min_education`);
  if (!c.name_mr || !c.description_mr) err(`career ${c.id}: missing Marathi`);
});
const perCareer = {}, usedSkills = new Set(), seen = new Set();
cs.forEach(r => {
  if (!careerIds.has(r.career_id)) err(`career_skills: unknown career ${r.career_id}`);
  if (!skillIds.has(r.skill_id)) err(`career_skills: unknown skill ${r.skill_id}`);
  const k = r.career_id + "/" + r.skill_id; if (seen.has(k)) err(`career_skills: duplicate ${k}`); seen.add(k);
  const w = +r.weight, l = +r.required_level;
  if (![1, 2, 3].includes(w)) err(`career_skills ${k}: weight must be 1-3`);
  if (![1, 2, 3].includes(l)) err(`career_skills ${k}: required_level must be 1-3`);
  (perCareer[r.career_id] ||= []).push(r); usedSkills.add(r.skill_id);
});
careerIds.forEach(id => { const n = (perCareer[id] || []).length; if (n < 12 || n > 20) err(`career ${id}: has ${n} skills (need 12-20)`); });
skillIds.forEach(id => { if (!usedSkills.has(id)) warn(`skill ${id} is not used by any career`); });

const qPer = {};
questions.forEach(q => {
  if (!skillIds.has(q.skill_id)) err(`question ${q.id}: unknown skill`);
  const oe = q.options_en.split("|"), om = q.options_mr.split("|"), ci = +q.correct_index;
  if (oe.length !== 4 || om.length !== 4) err(`question ${q.id}: need 4 options in both languages`);
  if (!(ci >= 0 && ci < oe.length)) err(`question ${q.id}: bad correct_index`);
  if (!q.question_en || !q.question_mr) err(`question ${q.id}: missing text`);
  qPer[q.skill_id] = (qPer[q.skill_id] || 0) + 1;
});
resources.forEach(r => {
  if (!skillIds.has(r.skill_id)) err(`resource ${r.id}: unknown skill`);
  if (!/^https:\/\//.test(r.url)) err(`resource ${r.id}: url must start with https://`);
});
const unv = x => x.filter(r => r.verified !== "true").length;
if (unv(resources)) warn(`${unv(resources)} resources not verified (verified=false) - replace with exact links`);
if (unv(schemes)) warn(`${unv(schemes)} schemes not verified - check each official page`);
if (!institutes.length) warn("institutes.csv is empty - add real Pune institutes from official lists");

const rank = { class10: 1, iti: 2, class12: 2, diploma: 3, degree: 4 };
uniq(districts, "district");
if (districts.length !== 36) warn(`districts: expected 36, found ${districts.length}`);
const data = {
  districts,
  generated_at: new Date().toISOString(),
  education_rank: rank,
  skills: skills.map(s => ({ ...s, aliases_en: list(s.aliases_en), aliases_mr: list(s.aliases_mr) })),
  careers: careers.map(c => ({ ...c, interest_tags: list(c.interest_tags),
    skills: (perCareer[c.id] || []).map(r => ({ skill_id: r.skill_id, weight: +r.weight, required_level: +r.required_level })) })),
  questions: questions.map(q => ({ id: q.id, skill_id: q.skill_id, question_en: q.question_en, question_mr: q.question_mr,
    options_en: q.options_en.split("|"), options_mr: q.options_mr.split("|"), correct_index: +q.correct_index })),
  resources: resources.map(r => ({ ...r, verified: r.verified === "true" })),
  institutes: institutes.map(r => ({ ...r, verified: r.verified === "true" })),
  schemes: schemes.map(r => ({ ...r, verified: r.verified === "true" })),
};
console.log(`skills ${skills.length} | careers ${careers.length} | career-skill links ${cs.length} | questions ${questions.length} (${Object.keys(qPer).length} skills) | resources ${resources.length} | institutes ${institutes.length} | schemes ${schemes.length}`);
warns.forEach(w => console.log("WARN  " + w));
if (errors.length) { errors.forEach(e => console.log("ERROR " + e)); console.log(`\n${errors.length} error(s). data.json NOT written.`); process.exit(1); }
fs.mkdirSync(path.join(root, "frontend/src/data"), { recursive: true });
fs.writeFileSync(path.join(root, "frontend/src/data/data.json"), JSON.stringify(data));
const tags = [...new Set(careers.flatMap(c => list(c.interest_tags)))].sort();
fs.writeFileSync(path.join(root, "backend/ref_ids.json"), JSON.stringify({
  skills: [...skillIds], careers: [...careerIds], districts: districts.map(d => d.id), interest_tags: tags }, null, 1));
console.log("OK - wrote backend/ref_ids.json and frontend/src/data/data.json");
