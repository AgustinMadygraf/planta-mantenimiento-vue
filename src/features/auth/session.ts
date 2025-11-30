import type { AuthSession } from './types'

const STORAGE_KEY = 'planta-mantenimiento.session'

function isBrowser() {
  return typeof window !== 'undefined'
}

function isValidSession(candidate: unknown): candidate is AuthSession {
  if (!candidate || typeof candidate !== 'object') return false

  const value = candidate as Partial<AuthSession>
  return (
    typeof value.token === 'string' &&
    typeof value.expiresAt === 'number' &&
    value.user !== undefined &&
    typeof value.user.username === 'string' &&
    typeof value.user.role === 'string'
  )
}

function persistSession(value: AuthSession | null) {
  if (!isBrowser()) return

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

function restoreSession(): AuthSession | null {
  if (!isBrowser()) return null

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    if (isValidSession(parsed)) return parsed
  } catch (error) {
    // Fall through to cleanup
  }

  window.localStorage.removeItem(STORAGE_KEY)
  return null
}

function isExpired(session: AuthSession) {
  return session.expiresAt <= Date.now()
}

export function getActiveSession(): AuthSession | null {
  const session = restoreSession()
  if (!session) return null

  if (isExpired(session)) {
    persistSession(null)
    return null
  }

  return session
}

export function saveSession(session: AuthSession | null) {
  persistSession(session)
}
