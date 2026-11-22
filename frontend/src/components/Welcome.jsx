import { Button, Card } from './ui.jsx'

export default function Welcome({ t, onStart }) {
  return (
    <Card className="mt-6">
      <h2 className="text-2xl font-semibold text-brand-900">{t('tagline')}</h2>
      <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      <Button className="mt-6 w-full text-lg" onClick={onStart}>{t('cta')}</Button>
      <p className="mt-4 text-sm text-gray-500">{t('privacyShort')}</p>
    </Card>
  )
}
