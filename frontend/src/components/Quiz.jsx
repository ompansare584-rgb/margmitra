import { useMemo, useState } from 'react'
import data from '../data/data.json'
import { levelFromQuiz } from '../lib/scoring.js'
import { shuffleQuestion } from '../lib/shuffle.js'
import { pick } from '../lib/i18n.js'
import { Button, Card } from './ui.jsx'

const MAX_SKILLS = 5
const skillById = Object.fromEntries(data.skills.map((s) => [s.id, s]))

export default function Quiz({ t, lang, levels, setLevels, seed, onDone, onBack }) {
  // Skills the student chose that have questions, at most MAX_SKILLS
  const plan = useMemo(
    () =>
      Object.keys(levels)
        .filter((id) => data.questions.some((q) => q.skill_id === id))
        .slice(0, MAX_SKILLS)
        .map((id) => ({ id, questions: data.questions.filter((q) => q.skill_id === id).map((q) => shuffleQuestion(q, seed)) })),
    // The plan is fixed when the quiz screen opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const flat = plan.flatMap((p) => p.questions)
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({}) // skill_id -> correct count

  if (plan.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('quizTitle')}</h2>
        <p className="mt-2 text-gray-600">{t('noQuiz')}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
          <Button className="flex-1" onClick={onDone}>{t('finishQuiz')}</Button>
        </div>
      </Card>
    )
  }

  if (!started) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('quizTitle')}</h2>
        <p className="mt-2 text-gray-600">{t('quizIntro', { n: plan.length })}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {plan.map((p) => (
            <li key={p.id} className="rounded-full bg-brand-100 px-3 py-1 text-sm">{pick(skillById[p.id], 'name', lang)}</li>
          ))}
        </ul>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
          <Button variant="secondary" onClick={onDone}>{t('skipQuiz')}</Button>
          <Button className="flex-1" onClick={() => setStarted(true)}>{t('startQuiz')}</Button>
        </div>
      </Card>
    )
  }

  const q = flat[i]
  const answered = picked !== null
  const last = i === flat.length - 1

  const choose = (idx) => {
    if (answered) return
    setPicked(idx)
    if (idx === q.correct_index) setScore((s) => ({ ...s, [q.skill_id]: (s[q.skill_id] || 0) + 1 }))
  }

  const next = () => {
    if (!last) {
      setPicked(null)
      setI(i + 1)
      return
    }
    // Finished: set each tested skill's level from its answers
    const updated = { ...levels }
    for (const p of plan) updated[p.id] = levelFromQuiz(score[p.id] || 0, p.questions.length)
    setLevels(updated)
    onDone()
  }

  const options = lang === 'mr' ? q.options_mr : q.options_en

  return (
    <Card>
      <p className="text-sm text-gray-600">
        {t('questionOf', { i: i + 1, n: flat.length })} · {pick(skillById[q.skill_id], 'name', lang)}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{lang === 'mr' ? q.question_mr : q.question_en}</h2>
      <div className="mt-4 space-y-2">
        {options.map((o, idx) => {
          let style = 'border-brand-700/40 bg-white'
          if (answered && idx === q.correct_index) style = 'border-green-700 bg-green-100'
          else if (answered && idx === picked) style = 'border-orange-700 bg-orange-100'
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => choose(idx)}
              className={`min-h-12 w-full rounded-xl border px-4 py-3 text-left text-base ${style}`}
            >
              {o}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className="mt-3 font-semibold" data-testid="feedback">
          {picked === q.correct_index ? t('correct') : `${t('wrong')} ${options[q.correct_index]}`}
        </p>
      )}
      <Button className="mt-4 w-full" disabled={!answered} onClick={next}>
        {last ? t('finishQuiz') : t('nextQ')}
      </Button>
    </Card>
  )
}
