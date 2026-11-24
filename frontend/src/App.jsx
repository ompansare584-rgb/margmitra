import { useEffect, useMemo, useState } from 'react'
import { pingBackend } from './api'
import { makeT } from './lib/i18n'
import { usePersisted } from './lib/store'
import { Progress } from './components/ui.jsx'
import Welcome from './components/Welcome.jsx'
import Profile from './components/Profile.jsx'
import Skills from './components/Skills.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Plan from './components/Plan.jsx'
import Officer from './components/Officer.jsx'

const STEPS = ['profile', 'skills', 'quiz', 'results']
const EMPTY_PROFILE = { education: '', district: '', age_band: '', interests: [] }

export default function App() {
  const [lang, setLang] = usePersisted('lang', 'mr')
  const [screen, setScreen] = useState(() => (window.location.hash === '#officer' ? 'officer' : 'welcome'))
  const [profile, setProfile] = usePersisted('profile', EMPTY_PROFILE)
  const [levels, setLevels] = usePersisted('levels', {})
  const [plan, setPlan] = usePersisted('plan', null)
  const [planCareer, setPlanCareer] = useState(null)
  const [seed] = usePersisted('seed', String(Math.random()))
  const [backend, setBackend] = useState('checking')
  const t = useMemo(() => makeT(lang), [lang])

  // Wake the free server early (it can sleep) so sharing works later
  useEffect(() => {
    let active = true
    pingBackend().then((ok) => active && setBackend(ok ? 'online' : 'offline'))
    return () => {
      active = false
    }
  }, [])

  const restart = () => {
    setProfile(EMPTY_PROFILE)
    setLevels({})
    setPlan(null)
    setScreen('welcome')
  }
  const stepIndex = STEPS.indexOf(screen) + 1
  const wide = screen === 'results' || screen === 'officer' // these screens use two columns on desktop

  const statusText = { checking: t('backendChecking'), online: t('backendOnline'), offline: t('backendOffline') }[backend]
  const statusColour = {
    checking: 'bg-gray-200 text-gray-700',
    online: 'bg-brand-100 text-brand-900',
    offline: 'bg-orange-100 text-orange-900',
  }[backend]

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 md:max-w-5xl md:px-8 md:py-10" lang={lang}>
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-brand-900">{t('appName')}</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
          {[['mr', 'मराठी'], ['en', 'English']].map(([code, label]) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={`min-h-11 rounded-full px-4 text-base ${lang === code ? 'bg-brand-700 text-white' : 'text-brand-900'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className={`mt-4 ${wide ? '' : 'mx-auto w-full md:max-w-2xl'}`}>
        {stepIndex > 0 && <Progress step={stepIndex} total={STEPS.length} label={t('stepOf', { i: stepIndex, n: STEPS.length })} />}

        {screen === 'welcome' && <Welcome t={t} onStart={() => setScreen('profile')} />}
        {screen === 'profile' && (
          <Profile t={t} lang={lang} profile={profile} setProfile={setProfile} onBack={() => setScreen('welcome')} onNext={() => setScreen('skills')} />
        )}
        {screen === 'skills' && (
          <Skills t={t} lang={lang} levels={levels} setLevels={setLevels} onBack={() => setScreen('profile')} onNext={() => setScreen('quiz')} />
        )}
        {screen === 'quiz' && (
          <Quiz t={t} lang={lang} levels={levels} setLevels={setLevels} seed={seed} onBack={() => setScreen('skills')} onDone={() => setScreen('results')} />
        )}
        {screen === 'results' && (
          <Results t={t} lang={lang} profile={profile} levels={levels} hasPlan={!!plan} onPlan={(id) => { setPlanCareer(id); setScreen('plan') }} onBack={() => setScreen('skills')} onRestart={restart} />
        )}
        {screen === 'officer' && (
          <Officer t={t} lang={lang} onBack={() => { window.location.hash = ''; setScreen('welcome') }} />
        )}
        {screen === 'plan' && (
          <Plan t={t} lang={lang} profile={profile} levels={levels} setLevels={setLevels} plan={plan} setPlan={setPlan} careerId={planCareer} seed={seed} onBack={() => setScreen('results')} />
        )}
      </div>

      {screen !== 'officer' && (
        <p className="mt-4">
          <a href="#officer" onClick={() => setScreen('officer')} className="inline-block min-h-11 py-2 text-sm text-brand-700 underline">{t('officerLink')}</a>
        </p>
      )}

      <p className={`mt-4 inline-block rounded-full px-4 py-2 text-sm ${statusColour}`}>{statusText}</p>
    </main>
  )
}
