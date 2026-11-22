import data from '../data/data.json'
import { pick } from '../lib/i18n.js'
import { Button, Card, Chip } from './ui.jsx'

const EDUCATION = ['class10', 'iti', 'class12', 'diploma', 'degree']
const AGE = ['under18', '18plus']
const TAGS = [...new Set(data.careers.flatMap((c) => c.interest_tags))].sort()

export default function Profile({ t, lang, profile, setProfile, onNext, onBack }) {
  const set = (patch) => setProfile({ ...profile, ...patch })
  const toggleTag = (tag) =>
    set({ interests: profile.interests.includes(tag) ? profile.interests.filter((x) => x !== tag) : [...profile.interests, tag] })
  const ready = profile.education && profile.district && profile.age_band

  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-900">{t('profileTitle')}</h2>

      <h3 className="mt-5 font-semibold">{t('eduLabel')}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {EDUCATION.map((e) => (
          <Chip key={e} selected={profile.education === e} onClick={() => set({ education: e })}>{t(`edu_${e}`)}</Chip>
        ))}
      </div>

      <h3 className="mt-5 font-semibold"><label htmlFor="district">{t('districtLabel')}</label></h3>
      <select
        id="district"
        className="mt-2 min-h-12 w-full rounded-xl border border-brand-700/40 bg-white px-3 text-base"
        value={profile.district}
        onChange={(e) => set({ district: e.target.value })}
      >
        <option value="">{t('districtPick')}</option>
        {data.districts.map((d) => (
          <option key={d.id} value={d.id}>{pick(d, 'name', lang)}</option>
        ))}
      </select>

      <h3 className="mt-5 font-semibold">{t('ageLabel')}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {AGE.map((a) => (
          <Chip key={a} selected={profile.age_band === a} onClick={() => set({ age_band: a })}>{t(`age_${a}`)}</Chip>
        ))}
      </div>

      <h3 className="mt-5 font-semibold">{t('interestsLabel')}</h3>
      <p className="text-sm text-gray-500">{t('interestsHint')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <Chip key={tag} selected={profile.interests.includes(tag)} onClick={() => toggleTag(tag)}>{t(`tag_${tag}`)}</Chip>
        ))}
      </div>

      {!ready && <p className="mt-4 text-sm text-orange-800">{t('profileNeed')}</p>}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
        <Button className="flex-1" disabled={!ready} onClick={onNext}>{t('next')}</Button>
      </div>
    </Card>
  )
}
