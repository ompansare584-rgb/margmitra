import { useMemo, useState } from 'react'
import data from '../data/data.json'
import { buildIndex, matchSkills, normalize } from '../lib/matcher.js'
import { pick } from '../lib/i18n.js'
import { Button, Card, Chip } from './ui.jsx'

const skillById = Object.fromEntries(data.skills.map((s) => [s.id, s]))

export default function Skills({ t, lang, levels, setLevels, onNext, onBack }) {
  const index = useMemo(() => buildIndex(data.skills), [])
  const [text, setText] = useState('')
  const [found, setFound] = useState(null) // null = not searched yet
  const [query, setQuery] = useState('')

  const chosen = Object.keys(levels)
  const add = (id) => setLevels({ ...levels, [id]: levels[id] || 2 })
  const remove = (id) => {
    const next = { ...levels }
    delete next[id]
    setLevels(next)
  }
  const setLevel = (id, level) => setLevels({ ...levels, [id]: level })

  const search = () => setFound(matchSkills(text, index))

  const q = normalize(query)
  const listed = q
    ? data.skills
        .filter((s) => [s.name_en, s.name_mr, ...s.aliases_en, ...s.aliases_mr].some((x) => normalize(x).includes(q)))
        .slice(0, 12)
    : []

  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-900">{t('skillsTitle')}</h2>
      <p className="mt-1 text-gray-600">{t('skillsIntro')}</p>

      <label htmlFor="skilltext" className="mt-4 block font-semibold">{t('typeLabel')}</label>
      <textarea
        id="skilltext"
        rows={3}
        maxLength={400}
        className="mt-2 w-full rounded-xl border border-brand-700/40 p-3 text-base"
        placeholder={t('typePlaceholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button className="mt-2" disabled={!text.trim()} onClick={search}>{t('findSkills')}</Button>

      {found && (
        <div className="mt-4" data-testid="suggestions">
          {found.length === 0 ? (
            <p className="text-gray-600">{t('noMatch')}</p>
          ) : (
            <>
              <p className="font-semibold">{t('suggestions')}</p>
              <p className="text-sm text-gray-500">{t('matchNote')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {found.map((m) => (
                  <Chip key={m.skill_id} selected={chosen.includes(m.skill_id)} onClick={() => add(m.skill_id)}>
                    {pick(skillById[m.skill_id], 'name', lang)}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <label htmlFor="skillsearch" className="mt-6 block font-semibold">{t('searchLabel')}</label>
      <input
        id="skillsearch"
        className="mt-2 min-h-12 w-full rounded-xl border border-brand-700/40 px-3 text-base"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {listed.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {listed.map((s) => (
            <Chip key={s.id} selected={chosen.includes(s.id)} onClick={() => add(s.id)}>{pick(s, 'name', lang)}</Chip>
          ))}
        </div>
      )}

      <h3 className="mt-6 font-semibold">{t('yourSkills', { n: chosen.length })}</h3>
      {chosen.length === 0 && <p className="text-gray-500">{t('emptySkills')}</p>}
      <ul className="mt-2 space-y-3">
        {chosen.map((id) => (
          <li key={id} className="rounded-xl border border-brand-100 p-3" data-testid="chosen">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{pick(skillById[id], 'name', lang)}</span>
              <button type="button" className="min-h-11 px-2 text-sm text-orange-800 underline" onClick={() => remove(id)}>
                {t('remove')}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">{t('levelLabel')}</p>
            <div className="mt-1 flex gap-2">
              {[1, 2, 3].map((lv) => (
                <Chip key={lv} selected={levels[id] === lv} onClick={() => setLevel(id, lv)}>{t(`lvl${lv}`)}</Chip>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {chosen.length === 0 && <p className="mt-4 text-sm text-orange-800">{t('needOne')}</p>}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
        <Button className="flex-1" disabled={chosen.length === 0} onClick={onNext}>{t('next')}</Button>
      </div>
    </Card>
  )
}
