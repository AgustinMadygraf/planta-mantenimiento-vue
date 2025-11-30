/*
Path: src/services/apiClient.ts
*/

import { getActivePinia } from 'pinia'
import { devError, devLog, devWarn } from '../utils/devLogger'
import { logger } from './logger'
import {
  deriveExpiration,
  isSessionExpired,
  loadSession,
  persistSession,
  type AuthSession,
} from '../features/auth/services/session'
import { useSessionStore } from '../stores/session'

const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL no está definido. Verifica el archivo .env.')
}

type RequestOptions = RequestInit & { auth?: boolean; parseResponse?: boolean }

function resolveSessionStore() {
  try {
    if (!getActivePinia()) return null
    return useSessionStore()
  } catch (error) {
    logger.warn('No se pudo acceder a la store de sesión; se usará el respaldo local.', error)
    return null
  }
}

async function getAuthorizationToken(): Promise<string | null> {
  const sessionStore = resolveSessionStore()
  const session = sessionStore ? sessionStore.session.value : loadSession()
  if (!session) return null

  if (!isSessionExpired(session)) return session.token

  if (!session.refreshToken) {
    if (sessionStore) {
      sessionStore.clearSession()
    } else {
      persistSession(null)
    }
    return null
  }

  try {
    const refreshedSession = await refreshAccessToken(session)
    if (sessionStore) {
      sessionStore.setSession(refreshedSession)
    } else {
      persistSession(refreshedSession)
    }
    return refreshedSession.token
  } catch (error) {
    if (sessionStore) {
      sessionStore.clearSession()
    } else {
      persistSession(null)
    }
    logger.error('No se pudo refrescar la sesión', error)
    throw error instanceof Error
      ? error
      : new Error('No se pudo refrescar la sesión. Inicia sesión nuevamente.')
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, parseResponse = true, ...requestOptions } = options
  const token = auth ? await getAuthorizationToken() : null
  devLog('API request', { path, options, hasToken: Boolean(token) })

  if (auth && !token) {
    throw new Error('La sesión ha expirado. Inicia sesión nuevamente.')
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  }).catch((error) => {
    logger.error('Error de red', error)
    devError('Error de red', error)
    throw new Error(
      'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté disponible.',
    )
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let message = response.statusText
    try {
      if (isJson) {
        const errorBody = await response.json()
        message = errorBody.message || message
      } else {
        const errorText = await response.text()
        if (errorText.trim()) {
          message = errorText
        }
      }
    } catch (error) {
      logger.warn('No se pudo parsear el cuerpo de error', error)
      devWarn('No se pudo parsear el cuerpo de error', error)
    }

    devError('API error response', { path, status: response.status, message })
    throw new Error(message)
  }

  if (!parseResponse || response.status === 204) {
    return undefined as T
  }

  if (!isJson) {
    throw new Error('La respuesta del servidor no tiene un formato JSON válido.')
  }

  return (await response.json()) as T
}

interface RawRefreshResponse {
  token?: string
  access_token?: string
  refresh_token?: string | null
  expires_in?: number | null
  user?: AuthSession['user']
}

async function refreshAccessToken(currentSession: AuthSession): Promise<AuthSession> {
  devLog('Refreshing access token')
  const response = await request<RawRefreshResponse>('/auth/refresh', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh_token: currentSession.refreshToken }),
  })

  const token = response.token || response.access_token

  if (!token) {
    devError('Refresh error: No token in response', response)
    throw new Error('La respuesta de refresco no incluye un token.')
  }

  const refreshToken = response.refresh_token ?? currentSession.refreshToken ?? null
  const expiresAt = deriveExpiration({ token, expiresInSeconds: response.expires_in })
  const user = response.user || currentSession.user

  devLog('Refresh success', { expiresAt })
  return { token, refreshToken, expiresAt, user }
}

export type { RequestOptions }
