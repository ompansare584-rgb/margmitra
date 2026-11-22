import test from "node:test";
import assert from "node:assert/strict";
import { data } from "./helpers.mjs";
import { spreadSkills, buildPlan, weekTasks, progress, MAX_SKILLS } from "../frontend/src/lib/plan.js";

const ids = n => Array.from({ length: n }, (_, i) => "s" + i);

test("spread: every skill appears, never more than 2 per week up to 12 skills", () => {
  for (let n = 0; n <= 12; n++) {
    const w = spreadSkills(ids(n));
    assert.equal(w.length, 6);
    const flat = new Set(w.flat());
    assert.equal(flat.size, n);
    w.forEach(x => assert.ok(x.length <= 2));
  }
});
test("spread: fewer skills than weeks fills all 6 weeks, biggest gap gets spare weeks first", () => {
  const w = spreadSkills(["a", "b", "c", "d"]);
  assert.deepEqual(w, [["a"], ["a"], ["b"], ["b"], ["c"], ["d"]]);
  assert.ok(spreadSkills(["a"]).every(x => x[0] === "a"));
});
test("spread: 7 to 12 skills keep order, extra goes to earlier weeks", () => {
  const w = spreadSkills(ids(8));
  assert.deepEqual(w.map(x => x.length), [2, 2, 1, 1, 1, 1]);
  assert.deepEqual(w.flat(), ids(8));
});
test("buildPlan: 8 weeks, kinds, leftover gaps go to 'later'", () => {
  const c = data.careers.find(x => x.id === "electrician"); // 20 skills
  const p = buildPlan(c, {});
  assert.equal(p.weeks.length, 8);
  assert.deepEqual(p.weeks.map(w => w.kind), ["learn", "learn", "learn", "learn", "learn", "learn", "practice", "review"]);
  assert.equal(new Set(p.weeks.flatMap(w => w.skills)).size, MAX_SKILLS);
  assert.equal(p.later.length, 20 - MAX_SKILLS);
});
test("buildPlan: skills already at required level are not planned", () => {
  const c = data.careers.find(x => x.id === "welder");
  const lv = Object.fromEntries(c.skills.map(s => [s.skill_id, s.required_level]));
  const p = buildPlan(c, lv);
  assert.equal(p.weeks.flatMap(w => w.skills).length, 0);
});
test("buildPlan is deterministic", () => {
  const c = data.careers.find(x => x.id === "copa_operator");
  assert.deepEqual(buildPlan(c, { ms_word: 2 }), buildPlan(c, { ms_word: 2 }));
});
test("tasks and progress", () => {
  const c = data.careers.find(x => x.id === "retail_sales_associate");
  const p = { ...buildPlan(c, {}), done: {} };
  const hq = id => data.questions.some(q => q.skill_id === id);
  const keys = p.weeks.flatMap(w => weekTasks(w, hq));
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(progress(p, hq), { done: 0, total: keys.length, percent: 0 });
  keys.forEach(k => (p.done[k] = true));
  assert.equal(progress(p, hq).percent, 100);
});
