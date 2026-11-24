import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { root } from "./helpers.mjs";

const read = f => JSON.parse(fs.readFileSync(path.join(root, "frontend/src/i18n", f), "utf8"));
const en = read("en.json"), mr = read("mr.json");
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const src = walk(path.join(root, "frontend/src")).filter(f => /\.jsx?$/.test(f)).map(f => fs.readFileSync(f, "utf8")).join("\n");

test("English and Marathi have exactly the same keys", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(mr).sort());
});
test("placeholders match in both languages", () => {
  for (const k of Object.keys(en)) {
    const ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(ph(en[k]), ph(mr[k]), `placeholder mismatch in ${k}`);
  }
});
test("every t('key') used in the code exists", () => {
  const used = [...src.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)].map(m => m[1]);
  for (const k of used) assert.ok(k in en, "missing key " + k);
});
test("no empty strings", () => {
  for (const [k, v] of [...Object.entries(en), ...Object.entries(mr)]) assert.ok(v.trim(), k);
});
