import { useEffect, useState } from 'react'
import en from './i18n/en.json'
import mr from './i18n/mr.json'
import { pingBackend } from './api'

const dictionaries = { en, mr }

function readSavedLanguage() {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'mr'
  } catch {
    return 'mr'
  }
}

export default function App() {
  const [lang, setLang] = useState(readSavedLanguage)
  const [backend, setBackend] = useState('checking')

  const t = (key) => dictionaries[lang][key] ?? key

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang)
    } catch {
      // Saving the language is optional, so ignore storage errors.
    }
  }, [lang])

  useEffect(() => {
    let active = true
    pingBackend().then((ok) => {
      if (active) setBackend(ok ? 'online' : 'offline')
    })
    return () => {
      active = false
    }
  }, [])

  const statusText = {
    checking: t('backendChecking'),
    online: t('backendOnline'),
    offline: t('backendOffline'),
  }[backend]

  const statusColour = {
    checking: 'bg-gray-200 text-gray-700',
    online: 'bg-brand-100 text-brand-900',
    offline: 'bg-orange-100 text-orange-900',
  }[backend]

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-900">{t('appName')}</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
          <button
            onClick={() => setLang('mr')}
            className={`rounded-full px-4 py-2 text-base ${
              lang === 'mr' ? 'bg-brand-700 text-white' : 'text-brand-900'
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => setLang('en')}
            className={`rounded-full px-4 py-2 text-base ${
              lang === 'en' ? 'bg-brand-700 text-white' : 'text-brand-900'
            }`}
          >
            English
          </button>
        </div>
      </header>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-brand-900">{t('tagline')}</h2>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        <button
          disabled
          className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-4 text-lg font-semibold text-white opacity-60"
        >
          {t('cta')}
        </button>
        <p className="mt-2 text-center text-sm text-gray-500">{t('ctaSoon')}</p>
      </section>

      <p className={`mt-6 inline-block rounded-full px-4 py-2 text-sm ${statusColour}`}>
        {statusText}
      </p>
    </main>
  )
}
