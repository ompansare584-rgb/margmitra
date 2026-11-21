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
