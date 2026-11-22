export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-40',
    secondary: 'bg-white text-brand-900 border border-brand-700 hover:bg-brand-100 disabled:opacity-40',
    accent: 'bg-saffron text-white hover:opacity-90 disabled:opacity-40',
    link: 'bg-transparent text-brand-700 underline',
  }[variant]
  return (
    <button
      type="button"
      className={`min-h-12 rounded-xl px-4 py-3 text-base font-semibold ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Chip({ selected, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      className={`min-h-11 rounded-full border px-4 py-2 text-base ${
        selected ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-700/40 bg-white text-brand-900'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }) {
  return <section className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>{children}</section>
}

export function Progress({ step, total, label }) {
  return (
    <div className="mb-4" aria-label={label}>
      <p className="mb-1 text-sm text-gray-600">{label}</p>
      <div className="h-2 rounded-full bg-brand-100">
        <div className="h-2 rounded-full bg-brand-700" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  )
}

export function Bar({ value }) {
  return (
    <div className="h-3 w-full rounded-full bg-brand-100" role="img" aria-label={`${value}%`}>
      <div className="h-3 rounded-full bg-saffron" style={{ width: `${value}%` }} />
    </div>
  )
}
