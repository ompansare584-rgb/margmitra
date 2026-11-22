// Free-text -> skill suggestions. Runs in the browser, no model download, no network.
// Method: Unicode normalisation + whole-phrase match + character-trigram fuzzy match
// against skill names and aliases (English, Marathi, Roman-script Marathi).
// This is a lightweight text-matching method, NOT a neural/LLM model. The UI must let
// the student confirm every suggestion.

export function normalize(s) {
  return String(s ?? "").normalize("NFC").toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
function trigrams(s) {
  const p = "  " + s + " ";
  const m = new Map();
  for (let i = 0; i + 3 <= p.length; i++) { const g = p.slice(i, i + 3); m.set(g, (m.get(g) || 0) + 1); }
  return m;
}
export function dice(a, b) {
  if (a === b) return 1;
  const A = trigrams(a), B = trigrams(b);
  let inter = 0, na = 0, nb = 0;
  for (const v of A.values()) na += v;
  for (const v of B.values()) nb += v;
  for (const [g, v] of A) if (B.has(g)) inter += Math.min(v, B.get(g));
  return na + nb ? (2 * inter) / (na + nb) : 0;
}

export function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const levSim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);

export function buildIndex(skills) {
  return skills.map(s => {
    const phrases = [s.name_en, s.name_mr, ...s.aliases_en, ...s.aliases_mr]
      .map(normalize).filter(p => p.length >= 3);
    return { id: s.id, phrases: [...new Set(phrases)].map(p => ({ p, tokens: p.split(" ") })) };
  });
}

const FUZZY_MIN = 0.80;   // multi-word window similarity (trigram dice)
const TYPO_MIN = 0.78;    // single-word spelling similarity (edit distance)
const THRESHOLD = 0.70;   // minimum score to suggest

function scorePhrase(text, textTokens, ph) {
  // 1) whole-phrase containment on word boundaries
  if ((" " + text + " ").includes(" " + ph.p + " ")) return 1;
  let best = 0;
  // 2) fuzzy: spelling variants / typos
  if (ph.p.length >= 5) {
    const n = ph.tokens.length;
    if (n === 1) {
      for (const w of textTokens) {
        if (w.length < 4) continue;
        const d = levSim(ph.p, w);
        if (d >= TYPO_MIN && d > best) best = d;
      }
    } else {
      for (let len = Math.max(1, n - 1); len <= n + 1; len++) {
        for (let i = 0; i + len <= textTokens.length; i++) {
          const d = dice(ph.p, textTokens.slice(i, i + len).join(" "));
          if (d >= FUZZY_MIN && d > best) best = d;
        }
      }
    }
  }
  // 3) phrases with 3+ meaningful words: all words present in any order
  const need = ph.tokens.filter(t => t.length >= 3);
  if (need.length >= 3 && need.every(t => textTokens.some(w => w === t || (t.length >= 5 && w.length >= 4 && levSim(t, w) >= 0.85)))) {
    best = Math.max(best, 0.85);
  }
  return best;
}

/** Returns [{skill_id, score, matched}] sorted by score desc. */
export function matchSkills(text, index, { threshold = THRESHOLD, limit = 12 } = {}) {
  const t = normalize(text);
  if (!t) return [];
  const toks = t.split(" ");
  const out = [];
  for (const sk of index) {
    let best = 0, via = "";
    for (const ph of sk.phrases) {
      const s = scorePhrase(t, toks, ph);
      if (s > best) { best = s; via = ph.p; }
    }
    if (best >= threshold) out.push({ skill_id: sk.id, score: Math.round(best * 100) / 100, matched: via });
  }
  return out.sort((a, b) => b.score - a.score || a.skill_id.localeCompare(b.skill_id)).slice(0, limit);
}
