import en from '../i18n/en.json'
import mr from '../i18n/mr.json'

const dictionaries = { en, mr }

// t('stepOf', {i: 1, n: 4}) replaces {i} and {n}. Missing keys show the key itself.
export function makeT(lang) {
  return (key, vars = {}) => {
    const text = dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key
    return text.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`))
  }
}

// Pick the Marathi or English version of a data field: pick(item, 'name', lang)
export const pick = (item, field, lang) => item[`${field}_${lang}`] || item[`${field}_en`] || ''
