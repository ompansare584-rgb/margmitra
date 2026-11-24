import test from "node:test";
import assert from "node:assert/strict";
import { data } from "./helpers.mjs";
import { SAMPLE_STATS, SAMPLE_MIN_GROUP, csvField, toCsv } from "../frontend/src/lib/officer.js";

test("sample data: flagged, all ids exist, no group below the minimum", () => {
  assert.equal(SAMPLE_STATS.sample, true);
  const skills = new Set(data.skills.map(s => s.id)), careers = new Set(data.careers.map(c => c.id)), d = new Set(data.districts.map(x => x.id));
  SAMPLE_STATS.top_skill_gaps.forEach(r => { assert.ok(skills.has(r.key), r.key); assert.ok(r.count >= SAMPLE_MIN_GROUP); });
  SAMPLE_STATS.top_careers.forEach(r => { assert.ok(careers.has(r.key), r.key); assert.ok(r.count >= SAMPLE_MIN_GROUP); });
  SAMPLE_STATS.by_district.forEach(r => { assert.ok(d.has(r.key), r.key); assert.ok(r.count >= SAMPLE_MIN_GROUP); });
  assert.ok(SAMPLE_STATS.total_students >= SAMPLE_STATS.top_careers.reduce((a, r) => a + r.count, 0));
});
test("csv escaping and formula guard", () => {
  assert.equal(csvField('a,b'), '"a,b"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvField(12), '12');
});
test("csv for sample data carries the SAMPLE line", () => {
  const out = toCsv([{ title: "T", rows: [["x", 7]] }], { sample: true, minGroup: 5 });
  assert.ok(out.startsWith("SAMPLE DATA"));
  assert.ok(out.includes("x,7"));
  assert.ok(!toCsv([], { sample: false, minGroup: 5 }).includes("SAMPLE"));
});
