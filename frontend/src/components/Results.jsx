import { useMemo, useState } from 'react'
import data from '../data/data.json'
import { rankCareers } from '../lib/scoring.js'
import { pick } from '../lib/i18n.js'
import { saveSession, deleteSession } from '../api.js'
import { Bar, Button, Card } from './ui.jsx'

const skillById = Object.fromEntries(data.skills.map((s) => [s.id, s]))

function CareerDetail({ t, lang, result, levels, onBack }) {
  const { career, fit, gaps } = result
  return (
    <div className="space-y-4">
      <Button variant="secondary" onClick={onBack}>{t('backToResults')}</Button>
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{pick(career, 'name', lang)}</h2>
        <p className="mt-1 text-2xl font-semibold text-saffron">{fit}% {t('fit')}</p>
        <Bar value={fit} />
        <h3 className="mt-4 font-semibold">{t('careerAbout')}</h3>
        <p className="text-gray-700">{pick(career, 'description', lang)}</p>
      </Card>

      <Card>
        <h3 className="font-semibold">{t('gapsTitle')}</h3>
        {gaps.length === 0 && <p className="mt-2 text-gray-600">{t('noGaps')}</p>}
        <ul className="mt-2 space-y-2">
          {gaps.map((g) => {
            const resources = data.resources.filter((r) => r.skill_id === g.skill_id).slice(0, 2)
            return (
              <li key={g.skill_id} className="rounded-xl border border-brand-100 p-3" data-testid="gap">
                <p className="font-semibold">{pick(skillById[g.skill_id], 'name', lang)}</p>
                <p className="text-sm text-gray-600">
                  {t('have', { a: levels[g.skill_id] ?? 0 })} · {t('need', { b: g.required })}
                </p>
                {resources.map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 block min-h-11 py-2 text-brand-700 underline">
                    {pick(r, 'title', lang)}
                  </a>
                ))}
              </li>
            )
          })}
        </ul>
        {gaps.length > 0 && <p className="mt-3 text-sm text-gray-500">{t('learnNote')}</p>}
      </Card>

      <Card>
        <h3 className="font-semibold">{t('schemesTitle')}</h3>
        <ul className="mt-2 space-y-2">
          {data.schemes.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="block min-h-11 py-1 font-semibold text-brand-700 underline">
                {pick(s, 'name', lang)}
              </a>
              <p className="text-sm text-gray-600">{pick(s, 'summary', lang)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-gray-500">{t('schemeNote')}</p>
      </Card>
    </div>
  )
}

function Share({ t, ranked, profile, lang }) {
  const [consent, setConsent] = useState(false)
  const [parent, setParent] = useState(false)
  const [state, setState] = useState('idle') // idle | working | shared | failed | deleted
  const [receipt, setReceipt] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('receipt') || 'null')
    } catch {
      return null
    }
  })
  const under18 = profile.age_band === 'under18'
  const ok = consent && (!under18 || parent) && ranked.length > 0

  const share = async () => {
    setState('working')
    const top = ranked[0]
    const res = await saveSession({
      district: profile.district,
      education: profile.education,
      age_band: profile.age_band,
      consent: true,
      parental_consent: under18 ? parent : false,
      language: lang,
      top_career_id: top.career.id,
      fit: top.fit,
      skill_gaps: top.gaps.slice(0, 10).map((g) => g.skill_id),
      interests: profile.interests,
    })
    if (res.ok) {
      const r = { id: res.data.id, token: res.data.delete_token }
      setReceipt(r)
      try {
        localStorage.setItem('receipt', JSON.stringify(r))
      } catch {
        // ignore
      }
      setState('shared')
    } else setState('failed')
  }

  const remove = async () => {
    setState('working')
    const res = await deleteSession(receipt.id, receipt.token)
    if (res.ok || res.status === 404) {
      setReceipt(null)
      try {
        localStorage.removeItem('receipt')
      } catch {
        // ignore
      }
      setState('deleted')
    } else setState('failed')
  }

  return (
    <Card>
      <h3 className="font-semibold">{t('shareTitle')}</h3>
      <p className="mt-1 text-sm text-gray-600">{t('shareText')}</p>
      {receipt ? (
        <div className="mt-3">
          <p className="font-semibold text-brand-900">{t('shared')}</p>
          <Button variant="secondary" className="mt-2" onClick={remove} disabled={state === 'working'}>{t('deleteMine')}</Button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <label className="flex min-h-11 items-start gap-3">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{t('consentLabel')}</span>
          </label>
          {under18 && (
            <label className="flex min-h-11 items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={parent} onChange={(e) => setParent(e.target.checked)} />
              <span>{t('parentLabel')}</span>
            </label>
          )}
          <Button disabled={!ok || state === 'working'} onClick={share}>
            {state === 'working' ? t('working') : t('shareBtn')}
          </Button>
        </div>
      )}
      {state === 'failed' && <p className="mt-2 text-sm text-orange-800">{t('shareFail')}</p>}
      {state === 'deleted' && <p className="mt-2 text-sm text-gray-700">{t('deleted')}</p>}
    </Card>
  )
}

export default function Results({ t, lang, profile, levels, onRestart, onBack }) {
  const ranked = useMemo(
    () => rankCareers(data, { education: profile.education, levels, interests: profile.interests }),
    [profile.education, profile.interests, levels],
  )
  const [all, setAll] = useState(false)
  const [openId, setOpenId] = useState(null)

  const open = ranked.find((r) => r.career.id === openId)
  if (open) return <CareerDetail t={t} lang={lang} result={open} levels={levels} onBack={() => setOpenId(null)} />

  const shown = all ? ranked : ranked.slice(0, 5)
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('resultsTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('fitNote')}</p>
        {ranked.length === 0 && <p className="mt-3">{t('noCareers')}</p>}
      </Card>

      {shown.map((r) => (
        <Card key={r.career.id}>
          <div data-testid="career">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">{pick(r.career, 'name', lang)}</h3>
              <span className="text-xl font-semibold text-saffron">{r.fit}%</span>
            </div>
            <Bar value={r.fit} />
            {r.gaps.length > 0 && (
              <p className="mt-2 text-sm text-gray-700">
                <b>{t('topGaps')}:</b> {r.gaps.slice(0, 3).map((g) => pick(skillById[g.skill_id], 'name', lang)).join(', ')}
              </p>
            )}
            <Button variant="secondary" className="mt-3" onClick={() => setOpenId(r.career.id)}>{t('seeDetails')}</Button>
          </div>
        </Card>
      ))}
      {ranked.length > 5 && (
        <Button variant="link" onClick={() => setAll(!all)}>{all ? t('showTop') : t('showAll')}</Button>
      )}

      <Share t={t} ranked={ranked} profile={profile} lang={lang} />

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
        <Button variant="secondary" onClick={onRestart}>{t('startOver')}</Button>
      </div>
    </div>
  )
}
