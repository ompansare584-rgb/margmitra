import { useState } from 'react'
import data from '../data/data.json'
import { pick } from '../lib/i18n.js'
import { getOfficerStats } from '../api.js'
import { SAMPLE_STATS, toCsv } from '../lib/officer.js'
import { Bar, Button, Card } from './ui.jsx'

const skillById = Object.fromEntries(data.skills.map((s) => [s.id, s]))
const careerById = Object.fromEntries(data.careers.map((c) => [c.id, c]))
const districtById = Object.fromEntries(data.districts.map((d) => [d.id, d]))

function List({ title, items, label }) {
  if (!items || items.length === 0) return null
  const max = Math.max(...items.map((i) => i.count))
  return (
    <Card>
      <h3 className="font-semibold text-brand-900">{title}</h3>
      <ul className="mt-2 space-y-3">
        {items.map((i) => (
          <li key={i.key} data-testid="orow">
            <div className="flex justify-between gap-2 text-sm">
              <span>{label(i.key)}</span>
              <span className="font-semibold">{i.count}</span>
            </div>
            <Bar value={Math.round((100 * i.count) / max)} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Officer({ t, lang, onBack }) {
  const [key, setKey] = useState('')
  const [district, setDistrict] = useState('')
  const [stats, setStats] = useState(SAMPLE_STATS) // starts as clearly labelled sample data
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!key.trim()) return setMessage(t('officerKeyHint'))
    setBusy(true)
    setMessage('')
    const res = await getOfficerStats(key.trim(), district)
    setBusy(false)
    if (res.ok && res.data.suppressed) {
      setStats(null)
      return setMessage(t('officerSuppressed', { k: 5 }))
    }
    if (res.ok) return setStats(res.data)
    if (res.status === 401) return setMessage(t('officerBadKey'))
    if (res.status === 503) return setMessage(t('officerNotConfigured'))
    setMessage(t('officerOffline'))
  }

  const download = () => {
    const name = (list, field, k) => pick(list[k] || { name_en: k }, field, lang)
    const sections = [
      { title: t('officerTotal'), rows: [[t('officerTotal'), stats.total_students], [t('officerAvgFit'), stats.average_fit]] },
      { title: t('officerGaps'), rows: stats.top_skill_gaps.map((i) => [name(skillById, 'name', i.key), i.count]) },
      { title: t('officerCareers'), rows: stats.top_careers.map((i) => [name(careerById, 'name', i.key), i.count]) },
      { title: t('officerEducation'), rows: stats.by_education.map((i) => [t(`edu_${i.key}`), i.count]) },
      { title: t('officerDistricts'), rows: stats.by_district.map((i) => [name(districtById, 'name', i.key), i.count]) },
    ]
    const csv = toCsv(sections, { sample: !!stats.sample, minGroup: stats.min_group })
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = stats.sample ? 'margmitra-SAMPLE-stats.csv' : 'margmitra-stats.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div
          role="status"
          data-testid="ribbon"
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${stats.sample ? 'bg-saffron text-white' : 'bg-brand-100 text-brand-900'}`}
        >
          {stats.sample ? t('officerSampleRibbon') : t('officerLiveRibbon', { k: stats.min_group })}
        </div>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-brand-900">{t('officerTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('officerIntro')}</p>

        <label htmlFor="okey" className="mt-4 block font-semibold">{t('officerKey')}</label>
        <input
          id="okey"
          type="password"
          autoComplete="off"
          className="mt-1 min-h-12 w-full rounded-xl border border-brand-700/40 px-3 text-base"
          placeholder={t('officerKeyHint')}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <label htmlFor="odistrict" className="mt-3 block font-semibold">{t('officerDistrict')}</label>
        <select
          id="odistrict"
          className="mt-1 min-h-12 w-full rounded-xl border border-brand-700/40 bg-white px-3 text-base"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">{t('officerAllDistricts')}</option>
          {data.districts.map((d) => (
            <option key={d.id} value={d.id}>{pick(d, 'name', lang)}</option>
          ))}
        </select>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button disabled={busy} onClick={load}>{busy ? t('working') : t('officerLoad')}</Button>
          <Button variant="secondary" onClick={() => { setStats(SAMPLE_STATS); setMessage('') }}>{t('officerSample')}</Button>
        </div>
        {message && <p className="mt-3 text-sm text-orange-800" role="alert">{message}</p>}
      </Card>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-sm text-gray-600">{t('officerTotal')}</p>
              <p className="text-3xl font-semibold text-brand-900" data-testid="total">{stats.total_students}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">{t('officerAvgFit')}</p>
              <p className="text-3xl font-semibold text-saffron">{stats.average_fit}%</p>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
          <List title={t('officerGaps')} items={stats.top_skill_gaps} label={(k) => pick(skillById[k] || { name_en: k }, 'name', lang)} />
          <List title={t('officerCareers')} items={stats.top_careers} label={(k) => pick(careerById[k] || { name_en: k }, 'name', lang)} />
          <List title={t('officerEducation')} items={stats.by_education} label={(k) => t(`edu_${k}`)} />
          <List title={t('officerDistricts')} items={stats.by_district} label={(k) => pick(districtById[k] || { name_en: k }, 'name', lang)} />
          </div>
          
          <Button variant="secondary" onClick={download}>{t('officerCsv')}</Button>
        </>
      )}

      <Button variant="link" onClick={onBack}>{t('backToApp')}</Button>
    </div>
  )
}
