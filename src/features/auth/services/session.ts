/*
Path: src/features/auth/services/session.ts
*/

import type { AuthUser } from '../types'

const STORAGE_KEY = 'planta-mantenimiento.auth'

type NullableAuthSession = AuthSession | null

export interface AuthSession {
  token: string
  refreshToken: string | null
  /** Timestamp en milisegundos de expiración del access token */
  expiresAt: number | null
  user: AuthUser
}

export function loadSession(): NullableAuthSession {
  if (typeof window === 'undefined') return null

  const stored = window.localStorage.getItem(STORAGE_KEY)
  // console.log('loadSession: valor en localStorage', stored)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    // console.log('[session.ts] loadSession: sesión recuperada:', parsed)
    // console.log('loadSession: sesión parseada', parsed)
    if (isValidSession(parsed)) {
      // console.log('loadSession: sesión válida', parsed)
      return parsed
    } else {
      console.warn('loadSession: sesión inválida', parsed)
    }
  } catch (error) {
    console.warn('No se pudo leer la sesión almacenada', error)
  }

  window.localStorage.removeItem(STORAGE_KEY)
  return null
}

export function persistSession(session: NullableAuthSession) {
  if (typeof window === 'undefined') return

  // console.log('[session.ts] persistSession:', session);
  // if (session) {
  //   console.log('[session.ts] persistSession: refreshToken =', session.refreshToken);
  // }

  if (!session) {
    console.log('persistSession: limpiando sesión en localStorage')
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  // console.log('persistSession: guardando sesión en localStorage', session)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getAuthToken(): string | null {
  return loadSession()?.token ?? null
}

export function isSessionExpired(session: AuthSession | null, clockSkewMs = 30_000): boolean {
  if (!session || !session.expiresAt) {
    console.log('[isSessionExpired] Sesión nula o sin expiresAt:', session)
    return false
  }

  const now = Date.now()
  const expires = session.expiresAt
  const expired = now + clockSkewMs >= expires
  // console.log('[isSessionExpired] now:', now, 'expiresAt:', expires, 'clockSkewMs:', clockSkewMs, 'expired:', expired)
  return expired
}

export function deriveExpiration({
  token,
  expiresInSeconds,
}: {
  token: string
  expiresInSeconds?: number | null
}): number | null {
  const jwtExpiration = getJwtExpiration(token)
  if (jwtExpiration) return jwtExpiration

  if (expiresInSeconds) {
    return Date.now() + expiresInSeconds * 1000
  }

  return null
}

function getJwtExpiration(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const payloadSegment = parts[1]!
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as { exp?: number }
    if (!payload.exp) return null

    return payload.exp * 1000
  } catch (error) {
    console.warn('No se pudo decodificar el token JWT para extraer expiración', error)
    return null
  }
}

function base64UrlDecode(value: string): string {
  if (typeof atob !== 'function') {
    throw new Error('No hay soporte para decodificar tokens JWT en este entorno.')
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')

  return atob(padded)
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AuthSession>
  const isTokenValid = typeof candidate.token === 'string'
  const isRefreshValid =
    candidate.refreshToken === null || typeof candidate.refreshToken === 'string'
  const isExpiresAtValid =
    candidate.expiresAt === null || typeof candidate.expiresAt === 'number'

  return isTokenValid && isRefreshValid && isExpiresAtValid && isValidUser(candidate.user)
}

function isValidUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== 'object') return false

  const candidate = user as Partial<AuthUser>
  return typeof candidate.username === 'string' && typeof candidate.role === 'string'
}
