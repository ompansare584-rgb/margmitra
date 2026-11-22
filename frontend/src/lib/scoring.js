// Deterministic career-fit scoring. No AI, no network. Same input -> same output.
export const W_COVERAGE = 0.8;
export const W_INTEREST = 0.2;

/** Careers the student is eligible for, by education rank. */
export function eligibleCareers(data, education) {
  const rank = data.education_rank;
  const u = rank[education];
  if (u === undefined) throw new Error("unknown education: " + education);
  return data.careers.filter(c => u >= rank[c.min_education]);
}

/** coverage 0..1 = sum(weight * min(user, required)/required) / sum(weight) */
export function coverage(career, levels) {
  let num = 0, den = 0;
  for (const s of career.skills) {
    const have = Math.max(0, Math.min(3, levels[s.skill_id] ?? 0));
    num += s.weight * Math.min(have, s.required_level) / s.required_level;
    den += s.weight;
  }
  return den ? num / den : 0;
}

/** interest 0..1 = matching tags / career tags */
export function interestScore(career, interests = []) {
  if (!career.interest_tags.length) return 0;
  const set = new Set(interests);
  const hit = career.interest_tags.filter(t => set.has(t)).length;
  return Math.min(1, hit / career.interest_tags.length);
}

export function fitScore(career, levels, interests = []) {
  return Math.round(100 * (W_COVERAGE * coverage(career, levels) + W_INTEREST * interestScore(career, interests)));
}

/** Skills still missing for a career, biggest gap first. gap = weight * (required - have)/required */
export function skillGaps(career, levels, limit = Infinity) {
  return career.skills
    .map(s => {
      const have = Math.max(0, Math.min(3, levels[s.skill_id] ?? 0));
      const missing = Math.max(0, s.required_level - have);
      return { skill_id: s.skill_id, have, required: s.required_level, weight: s.weight,
        gap: s.weight * missing / s.required_level };
    })
    .filter(g => g.gap > 0)
    .sort((a, b) => b.gap - a.gap || b.weight - a.weight || a.skill_id.localeCompare(b.skill_id))
    .slice(0, limit);
}

/** Ranked careers: [{career, fit, coverage, interest, gaps}] */
export function rankCareers(data, { education, levels, interests = [] }) {
  return eligibleCareers(data, education)
    .map(c => ({ career: c, fit: fitScore(c, levels, interests),
      coverage: coverage(c, levels), interest: interestScore(c, interests), gaps: skillGaps(c, levels) }))
    .sort((a, b) => b.fit - a.fit || a.career.name_en.localeCompare(b.career.name_en));
}

/** Quiz result -> level. 3 questions: 3 right=3, 2=2, 1=1, 0=0 (generalised by ratio). */
export function levelFromQuiz(correct, total) {
  if (!total) return 0;
  const r = correct / total;
  return r >= 0.99 ? 3 : r >= 0.6 ? 2 : r >= 0.3 ? 1 : 0;
}
