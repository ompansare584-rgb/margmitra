import { useMemo, useState } from 'react'
import data from '../data/data.json'
import { buildPlan, weekTasks, progress } from '../lib/plan.js'
import { fitScore, levelFromQuiz } from '../lib/scoring.js'
import { shuffleQuestion } from '../lib/shuffle.js'
import { pick } from '../lib/i18n.js'
import { Bar, Button, Card, Chip } from './ui.jsx'

const skillById = Object.fromEntries(data.skills.map((s) => [s.id, s]))
const hasQuestions = (id) => data.questions.some((q) => q.skill_id === id)

// 3 questions for one skill, one at a time. Calls onFinish(correctCount, total).
function MiniCheck({ t, lang, skillId, seed, onFinish }) {
  const questions = useMemo(
    () => data.questions.filter((q) => q.skill_id === skillId).map((q) => shuffleQuestion(q, seed + ':plan')),
    [skillId, seed],
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const q = questions[i]
  const options = lang === 'mr' ? q.options_mr : q.options_en
  const answered = picked !== null
  const last = i === questions.length - 1

  const choose = (idx) => {
    if (answered) return
    setPicked(idx)
    if (idx === q.correct_index) setCorrect((c) => c + 1)
  }
  const next = () => {
    if (last) onFinish(correct, questions.length)
    else {
      setPicked(null)
      setI(i + 1)
    }
  }
  return (
    <div className="mt-2 rounded-xl bg-brand-100 p-3" data-testid="minicheck">
      <p className="text-sm text-gray-700">{t('questionOf', { i: i + 1, n: questions.length })}</p>
      <p className="mt-1 font-semibold">{lang === 'mr' ? q.question_mr : q.question_en}</p>
      <div className="mt-2 space-y-2">
        {options.map((o, idx) => {
          let style = 'border-brand-700/40 bg-white'
          if (answered && idx === q.correct_index) style = 'border-green-700 bg-green-100'
          else if (answered && idx === picked) style = 'border-orange-700 bg-orange-100'
          return (
            <button key={idx} type="button" disabled={answered} onClick={() => choose(idx)}
              className={`min-h-11 w-full rounded-xl border px-3 py-2 text-left ${style}`}>
              {o}
            </button>
          )
        })}
      </div>
      <Button className="mt-2" disabled={!answered} onClick={next}>{last ? t('finishQuiz') : t('nextQ')}</Button>
    </div>
  )
}

export default function Plan({ t, lang, profile, levels, setLevels, plan, setPlan, careerId, seed, onBack }) {
  const [hours, setHours] = useState(5)
  const [checking, setChecking] = useState(null) // skill id being checked
  const career = data.careers.find((c) => c.id === (careerId || plan?.career_id))
  const cName = pick(career, 'name', lang)

  const create = () => {
    const built = buildPlan(career, levels)
    setPlan({
      career_id: career.id,
      hours,
      baseline_fit: fitScore(career, levels, profile.interests),
      ...built,
      done: {},
    })
  }

  // No plan for this career yet: ask for weekly hours
  if (!plan || (careerId && plan.career_id !== careerId)) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('planTitle', { career: cName })}</h2>
        <p className="mt-2 text-gray-600">{t('planIntro')}</p>
        <h3 className="mt-4 font-semibold">{t('planPickHours')}</h3>
        <div className="mt-2 flex gap-2">
          {[3, 5, 8].map((h) => (
            <Chip key={h} selected={hours === h} onClick={() => setHours(h)}>{t('hoursOpt', { h })}</Chip>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
          <Button className="flex-1" onClick={create}>{t('planStart')}</Button>
        </div>
      </Card>
    )
  }

  const toggle = (key) => setPlan({ ...plan, done: { ...plan.done, [key]: !plan.done[key] } })
  const p = progress(plan, hasQuestions)
  const fitNow = fitScore(career, levels, profile.interests)
  const firstOpen = plan.weeks.find((w) => weekTasks(w, hasQuestions).some((k) => !plan.done[k]))?.n

  const finishCheck = (skillId, weekN, correct, total) => {
    const level = levelFromQuiz(correct, total)
    setLevels({ ...levels, [skillId]: level })
    setPlan({ ...plan, done: { ...plan.done, [`${weekN}:${skillId}:check`]: true }, results: { ...(plan.results || {}), [skillId]: level } })
    setChecking(null)
  }

  const task = (k, children) => (
    <label key={k} className="flex min-h-11 items-start gap-3 py-1">
      <input type="checkbox" className="mt-1 h-5 w-5" checked={!!plan.done[k]} onChange={() => toggle(k)} />
      <span className={plan.done[k] ? 'text-gray-500 line-through' : ''}>{children}</span>
    </label>
  )

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('planTitle', { career: cName })}</h2>
        <p className="mt-2 font-semibold" data-testid="planprogress">{t('planProgress', { p: p.percent })}</p>
        <Bar value={p.percent} />
        <p className="mt-2 text-sm text-gray-700">{t('fitNow', { now: fitNow, start: plan.baseline_fit })}</p>
        {plan.weeks.slice(0, 6).every((w) => w.skills.length === 0) && <p className="mt-2 text-gray-700">{t('planNoGaps')}</p>}
      </Card>

      {plan.weeks.map((w, wi) => {
        const prev = plan.weeks[wi - 1]
        const title = { learn: t('weekLearn'), practice: t('weekPractice'), review: t('weekReview') }[w.kind]
        const keys = weekTasks(w, hasQuestions)
        const doneCount = keys.filter((k) => plan.done[k]).length
        return (
          <details key={w.n} open={w.n === firstOpen} className="rounded-2xl bg-white p-4 shadow-sm" data-testid="week">
            <summary className="min-h-11 cursor-pointer font-semibold text-brand-900">
              {t('week', { n: w.n })}: {title} · {doneCount}/{keys.length}
            </summary>
            <div className="mt-2">
              {w.kind === 'learn' && w.skills.map((id) => {
                const resources = data.resources.filter((r) => r.skill_id === id).slice(0, 2)
                const cont = prev && prev.skills.includes(id)
                const name = pick(skillById[id], 'name', lang)
                return (
                  <div key={id} className="mb-3 rounded-xl border border-brand-100 p-3">
                    <p className="font-semibold">{name} {cont && <span className="text-sm font-normal text-gray-500">{t('continueSkill')}</span>}</p>
                    {task(`${w.n}:${id}:study`, <>{t('taskStudy', { skill: name, h: Math.max(1, Math.round((plan.hours / w.skills.length) * 10) / 10) })}</>)}
                    {resources.map((r) => (
                      <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block min-h-11 py-2 pl-8 text-brand-700 underline">
                        {pick(r, 'title', lang)}
                      </a>
                    ))}
                    {task(`${w.n}:${id}:practise`, <>{t('taskPractise', { skill: name })}</>)}
                    {hasQuestions(id) && (
                      <div>
                        {task(`${w.n}:${id}:check`, <>{t('taskCheck', { skill: name })}</>)}
                        {plan.results?.[id] !== undefined && plan.done[`${w.n}:${id}:check`] && (
                          <p className="pl-8 text-sm text-brand-900">{t('checkResult', { skill: name, level: plan.results[id] })}</p>
                        )}
                        {checking === `${w.n}:${id}` ? (
                          <MiniCheck t={t} lang={lang} skillId={id} seed={seed} onFinish={(c, n) => finishCheck(id, w.n, c, n)} />
                        ) : (
                          <Button variant="secondary" className="ml-8 mt-1" onClick={() => setChecking(`${w.n}:${id}`)}>{t('takeCheck')}</Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {w.kind === 'practice' && (
                <>
                  {task("7:project", <>{t('taskProject')}</>)}
                  {task("7:notes", <>{t('taskNotes')}</>)}
                </>
              )}
              {w.kind === 'review' && (
                <>
                  {task("8:recheck", <>{t('taskRecheck')}</>)}
                  {task("8:programmes", <>{t('taskProgrammes')}</>)}
                </>
              )}
            </div>
          </details>
        )
      })}

      {plan.later?.length > 0 && (
        <Card>
          <p className="font-semibold">{t('planLater')}</p>
          <p className="text-gray-700">{plan.later.map((id) => pick(skillById[id], 'name', lang)).join(', ')}</p>
        </Card>
      )}
      <p className="text-sm text-gray-500">{t('planNote')}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>{t('planBackResults')}</Button>
        <Button variant="secondary" onClick={() => setPlan(null)}>{t('newPlan')}</Button>
      </div>
    </div>
  )
}
