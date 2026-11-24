import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { root } from "./helpers.mjs";

// The snapshot sent to the server must contain only these fields (matches backend/models.py).
test("saveSession payload fields are the approved list", () => {
  const results = fs.readFileSync(path.join(root, "frontend/src/components/Results.jsx"), "utf8");
  const block = results.slice(results.indexOf("saveSession({"), results.indexOf("})", results.indexOf("saveSession({")));
  const keys = [...block.matchAll(/^\s+([a-z_]+):/gm)].map(m => m[1]).sort();
  assert.deepEqual(keys, ["age_band", "consent", "district", "education", "fit", "interests", "language", "parental_consent", "skill_gaps", "top_career_id"]);
});
test("no free text is sent anywhere", () => {
  const api = fs.readFileSync(path.join(root, "frontend/src/api.js"), "utf8");
  assert.ok(!/understand/.test(api));
});
