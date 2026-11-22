import test from "node:test";
import assert from "node:assert/strict";
import { data } from "./helpers.mjs";
import { coverage, fitScore, interestScore, skillGaps, rankCareers, eligibleCareers, levelFromQuiz } from "../frontend/src/lib/scoring.js";
import { shuffleQuestion } from "../frontend/src/lib/shuffle.js";

const career = id => data.careers.find(c => c.id === id);
const full = c => Object.fromEntries(c.skills.map(s => [s.skill_id, s.required_level]));

test("coverage is 0 with no skills and 1 with all required levels", () => {
  const c = career("electrician");
  assert.equal(coverage(c, {}), 0);
  assert.equal(coverage(c, full(c)), 1);
});
test("levels above required do not add extra", () => {
  const c = career("welder");
  const lv = Object.fromEntries(c.skills.map(s => [s.skill_id, 3]));
  assert.equal(coverage(c, lv), 1);
});
test("coverage formula on a hand-made career", () => {
  const c = { skills: [{ skill_id: "a", weight: 3, required_level: 3 }, { skill_id: "b", weight: 1, required_level: 2 }], interest_tags: [] };
  // a: 3*1.5/3=1.5 ; b: 1*2/2=1 -> (1.5+... ) a level 3? use a=3->3*3/3=3 ; here a=1 -> 3*1/3=1 ; b=2 -> 1 ; total 2/4 = .5
  assert.equal(coverage(c, { a: 1, b: 2 }), 0.5);
});
test("interest score and fit rounding", () => {
  const c = career("electrician"); // tags machines;electronics
  assert.equal(interestScore(c, ["machines"]), 0.5);
  assert.equal(interestScore(c, ["machines", "electronics", "x"]), 1);
  assert.equal(fitScore(c, full(c), ["machines", "electronics"]), 100);
  assert.equal(fitScore(c, full(c), []), 80);
  assert.equal(fitScore(c, {}, []), 0);
});
test("education filter", () => {
  const ids = e => eligibleCareers(data, e).map(c => c.id);
  assert.ok(ids("class10").includes("electrician"));
  assert.ok(!ids("class10").includes("junior_web_developer"));
  assert.ok(ids("iti").includes("junior_web_developer"));
  assert.ok(ids("diploma").length === 12);
  assert.throws(() => eligibleCareers(data, "phd"));
});
test("gaps sorted by size and shrink as skills improve", () => {
  const c = career("electrician");
  const g0 = skillGaps(c, {});
  assert.equal(g0.length, c.skills.length);
  for (let i = 1; i < g0.length; i++) assert.ok(g0[i - 1].gap >= g0[i].gap);
  const lv = { [g0[0].skill_id]: 3 };
  assert.ok(!skillGaps(c, lv).some(g => g.skill_id === g0[0].skill_id));
});
test("ranking is deterministic and sorted", () => {
  const input = { education: "iti", levels: { basic_electricity: 3, wiring: 3, electrical_safety: 3 }, interests: ["machines"] };
  const a = rankCareers(data, input), b = rankCareers(data, input);
  assert.deepEqual(a.map(x => x.career.id), b.map(x => x.career.id));
  for (let i = 1; i < a.length; i++) assert.ok(a[i - 1].fit >= a[i].fit);
  assert.equal(a[0].career.id, "electrician");
});
test("fit always between 0 and 100", () => {
  for (const c of data.careers) {
    for (const lv of [{}, full(c)]) { const f = fitScore(c, lv, c.interest_tags); assert.ok(f >= 0 && f <= 100); }
  }
});
test("quiz level mapping", () => {
  assert.equal(levelFromQuiz(3, 3), 3); assert.equal(levelFromQuiz(2, 3), 2);
  assert.equal(levelFromQuiz(1, 3), 1); assert.equal(levelFromQuiz(0, 3), 0); assert.equal(levelFromQuiz(0, 0), 0);
});
test("shuffle keeps the correct answer and is stable per seed", () => {
  for (const q of data.questions) {
    const s = shuffleQuestion(q, "seed1");
    assert.equal(s.options_en[s.correct_index], q.options_en[q.correct_index]);
    assert.equal(s.options_mr[s.correct_index], q.options_mr[q.correct_index]);
    assert.deepEqual(s, shuffleQuestion(q, "seed1"));
  }
});
