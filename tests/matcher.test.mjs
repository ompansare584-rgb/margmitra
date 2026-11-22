import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { data, root } from "./helpers.mjs";
import { buildIndex, matchSkills, normalize, dice } from "../frontend/src/lib/matcher.js";

const index = buildIndex(data.skills);
const ids = t => matchSkills(t, index).map(m => m.skill_id);

test("normalize keeps Devanagari and strips punctuation", () => {
  assert.equal(normalize("  वायरिंग, अर्थिंग!! "), "वायरिंग अर्थिंग");
  assert.equal(normalize("MS-Excel"), "ms excel");
});
test("dice basics", () => { assert.equal(dice("abc", "abc"), 1); assert.ok(dice("wiring", "wiering") > 0.5); assert.ok(dice("wiring", "welding") < 0.5); });
test("exact English, Marathi and Roman-Marathi", () => {
  assert.ok(ids("I can do arc welding").includes("arc_welding"));
  assert.ok(ids("मला टायपिंग येते").includes("typing_skills"));
  assert.ok(ids("mala taar jodni yete").includes("wiring"));
});
test("empty or unrelated text gives nothing", () => {
  assert.deepEqual(matchSkills("", index), []);
  assert.deepEqual(ids("I like cricket and cooking"), []);
});
test("eval set: report precision/recall (own examples, see DATA_NOTES)", () => {
  const cases = JSON.parse(fs.readFileSync(path.join(root, "eval/matcher_eval.json"), "utf8"));
  let tp = 0, fp = 0, fn = 0; const misses = [];
  for (const c of cases) {
    const got = new Set(ids(c.text)), exp = new Set(c.expect);
    for (const g of got) exp.has(g) ? tp++ : (fp++, misses.push(`FP "${c.text}" -> ${g}`));
    for (const e of exp) if (!got.has(e)) { fn++; misses.push(`FN "${c.text}" missing ${e}`); }
  }
  const p = tp / (tp + fp || 1), r = tp / (tp + fn || 1);
  console.log(`matcher eval: ${cases.length} cases | precision ${(p * 100).toFixed(0)}% | recall ${(r * 100).toFixed(0)}%`);
  misses.forEach(m => console.log("  " + m));
  assert.ok(r >= 0.6 && p >= 0.5, "matcher quality below minimum");
});
