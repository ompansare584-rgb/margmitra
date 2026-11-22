// 8-week plan builder. Pure, deterministic, no network.
// Weeks 1-6: learn (top skill gaps), week 7: practice on a real task, week 8: review and next steps.
import { skillGaps } from './scoring.js'

export const LEARN_WEEKS = 6
export const MAX_SKILLS = 12 // at most 2 skills per learning week

/** Spread ordered skill ids over `weeks` learning weeks. Returns array of arrays (one per week). */
export function spreadSkills(ids, weeks = LEARN_WEEKS) {
  const n = ids.length
  const out = Array.from({ length: weeks }, () => [])
  if (n === 0) return out
  if (n <= weeks) {
    // every skill gets at least one week; spare weeks go to the biggest gaps first (list order)
    const spare = weeks - n
    let w = 0
    ids.forEach((id, i) => {
      const span = 1 + Math.floor(spare / n) + (i < spare % n ? 1 : 0)
      for (let k = 0; k < span; k++) out[w++].push(id)
    })
    return out
  }
  // more skills than weeks: near-equal groups, earlier weeks take the extra one
  const base = Math.floor(n / weeks), extra = n % weeks
  let at = 0
  for (let w = 0; w < weeks; w++) {
    const size = base + (w < extra ? 1 : 0)
    out[w] = ids.slice(at, at + size)
    at += size
  }
  return out
}

export function buildPlan(career, levels) {
  const gaps = skillGaps(career, levels)
  const ids = gaps.map((g) => g.skill_id)
  const chosen = ids.slice(0, MAX_SKILLS)
  const spread = spreadSkills(chosen)
  const weeks = spread.map((skills, i) => ({ n: i + 1, kind: 'learn', skills }))
  weeks.push({ n: 7, kind: 'practice', skills: [] })
  weeks.push({ n: 8, kind: 'review', skills: [] })
  return { weeks, later: ids.slice(MAX_SKILLS) }
}

/** Task keys for a week, in display order. A skill that continues from the previous week is only "study + practise". */
export function weekTasks(week, hasQuestions) {
  if (week.kind === 'practice') return [`${week.n}:project`, `${week.n}:notes`]
  if (week.kind === 'review') return [`${week.n}:recheck`, `${week.n}:programmes`]
  const keys = []
  for (const id of week.skills) {
    keys.push(`${week.n}:${id}:study`, `${week.n}:${id}:practise`)
    if (hasQuestions(id)) keys.push(`${week.n}:${id}:check`)
  }
  return keys
}

export function progress(plan, hasQuestions) {
  const all = plan.weeks.flatMap((w) => weekTasks(w, hasQuestions))
  const done = all.filter((k) => plan.done[k]).length
  return { done, total: all.length, percent: all.length ? Math.round((100 * done) / all.length) : 0 }
}
