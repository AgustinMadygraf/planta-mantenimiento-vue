import type { AuthUser } from '../features/auth/types'
import { logger } from './logger'

const STORAGE_KEY = 'planta-mantenimiento.auth'

type NullableAuthSession = AuthSession | null

export interface AuthSession {
  token: string
  user: AuthUser
}

export function loadSession(): NullableAuthSession {
  if (typeof window === 'undefined') return null

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    if (isValidSession(parsed)) return parsed
  } catch (error) {
    logger.warn('No se pudo leer la sesión almacenada', error)
  }

  window.localStorage.removeItem(STORAGE_KEY)
  return null
}

export function persistSession(session: NullableAuthSession) {
  if (typeof window === 'undefined') return

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getAuthToken(): string | null {
  return loadSession()?.token ?? null
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AuthSession>
  return typeof candidate.token === 'string' && isValidUser(candidate.user)
}

function isValidUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== 'object') return false

  const candidate = user as Partial<AuthUser>
  return typeof candidate.username === 'string' && typeof candidate.role === 'string'
}
