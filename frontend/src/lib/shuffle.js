// Seeded shuffle so quiz option order is stable for a given session seed.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function seedFrom(str) {
  let h = 2166136261;
  for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** Returns {options_en, options_mr, correct_index} with options reordered together. */
export function shuffleQuestion(q, seed) {
  const rnd = mulberry32(seedFrom(seed + ":" + q.id));
  const idx = q.options_en.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, options_en: idx.map(i => q.options_en[i]), options_mr: idx.map(i => q.options_mr[i]),
    correct_index: idx.indexOf(q.correct_index) };
}
