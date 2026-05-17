const USER_KEY = 'magari-current-user'
const SECRET_KEY = 'magari-vendor-secret'

export function saveVendorSession(user, secret) {
  const payload = { ...user, loggedInAt: Date.now() }
  localStorage.setItem(USER_KEY, JSON.stringify(payload))
  if (secret) {
    sessionStorage.setItem(SECRET_KEY, String(secret).trim())
  }
}

export function loadVendorSession() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return { user: null, secret: '' }
    const user = JSON.parse(raw)
    const secret = sessionStorage.getItem(SECRET_KEY) || ''
    return { user, secret }
  } catch {
    return { user: null, secret: '' }
  }
}

export function clearVendorSession() {
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(SECRET_KEY)
}

export function getVendorSecret() {
  return sessionStorage.getItem(SECRET_KEY) || ''
}
