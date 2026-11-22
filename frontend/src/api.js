const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Returns true if the backend answers /health within the time limit.
// The first call to a sleeping free server can take up to a minute, so the
// default wait is generous.
export async function pingBackend(timeoutMs = 60000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function call(path, options = {}, timeoutMs = 60000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal })
    if (response.status === 204) return { ok: true }
    const body = await response.json().catch(() => ({}))
    return response.ok ? { ok: true, data: body } : { ok: false, status: response.status, error: body.detail || 'Request failed' }
  } catch {
    return { ok: false, error: 'network' }
  } finally {
    clearTimeout(timer)
  }
}

// Only call this AFTER the student ticked the consent box. Never send name, phone or free text.
// snapshot: { district, education, age_band, consent, parental_consent, language, top_career_id, fit, skill_gaps, interests }
export const saveSession = (snapshot) =>
  call('/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot) })

export const deleteSession = (id, deleteToken) =>
  call(`/sessions/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Delete-Token': deleteToken } })

export const getOfficerStats = (officerKey, district) =>
  call(`/officer/stats${district ? `?district=${encodeURIComponent(district)}` : ''}`, { headers: { 'X-Officer-Key': officerKey } })
