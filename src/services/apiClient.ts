/*
Path: src/services/apiClient.ts
*/

import { getActivePinia } from 'pinia'
import {
  deriveExpiration,
  isSessionExpired,
  loadSession,
  persistSession,
  type AuthSession,
} from '../features/auth/services/session'
import { useSessionStore } from '../stores/session'

// Resolve base URL from Vite env, Node env (tests), or a global fallback
const importMetaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined
const baseUrl =
  importMetaEnv?.VITE_API_BASE_URL ??
  (typeof process !== 'undefined' ? (process as any)?.env?.VITE_API_BASE_URL : undefined) ??
  (typeof window !== 'undefined' ? (window as any)?.VITE_API_BASE_URL : undefined) ??
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : undefined)

if (!baseUrl) {
  console.error('[apiClient.ts] VITE_API_BASE_URL no esta disponible. Revisa .env y reinicia el dev server.', {
    importMetaEnv,
  })
  throw new Error('VITE_API_BASE_URL no esta definido. Verifica el archivo .env.')
}

type RequestOptions = RequestInit & { auth?: boolean; parseResponse?: boolean }

function resolveSessionStore() {
  try {
    if (!getActivePinia()) {
      const session = loadSession()
      console.log('[apiClient.ts] resolveSessionStore: sesiÃ³n cargada desde localStorage', session)
      return null
    }
    return useSessionStore()
  } catch (error) {
    console.warn('No se pudo acceder a la store de sesiÃ³n; se usarÃ¡ el respaldo local.', error)
    return null
  }
}

async function getAuthorizationToken(): Promise<string | null> {
  const sessionStore = resolveSessionStore()
  let session: AuthSession | null = null
  if (sessionStore && (sessionStore as any).session !== undefined) {
    const current = (sessionStore as any).session
    session = current?.value ?? current
  } else {
    session = loadSession()
  }
  console.log('[apiClient.ts] getAuthorizationToken: sesiÃ³n actual', session)
  if (!session) return null

  if (!isSessionExpired(session)) {
    console.log('[apiClient.ts] getAuthorizationToken: retornando token', session.token, 'session:', session)
    return session.token
  }

  if (!session.refreshToken) {
    console.log('[apiClient.ts] getAuthorizationToken: refreshToken es null, limpiando sesiÃ³n')
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
    console.error('No se pudo refrescar la sesiÃ³n', error)
    throw error instanceof Error
      ? error
      : new Error('No se pudo refrescar la sesiÃ³n. Inicia sesiÃ³n nuevamente.')
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, parseResponse = true, ...requestOptions } = options
  const token = auth ? await getAuthorizationToken() : null
  if (auth && !token) {
    console.error('[apiClient.ts] SesiÃ³n expirada o sin token.', {
      session: (typeof window !== 'undefined' ? window.localStorage.getItem('planta-mantenimiento.auth') : null),
      token,
      path,
      options
    })
    throw new Error('La sesiÃ³n ha expirado. Inicia sesiÃ³n nuevamente.')
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  }).catch((error) => {
    console.error('Error de red', error)
    throw new Error(
      'No se pudo conectar con el servidor. Verifica tu conexiÃ³n o que el backend estÃ© disponible.',
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
      console.warn('No se pudo parsear el cuerpo de error', error)
      console.warn('No se pudo parsear el cuerpo de error', error)
    }

    console.error('API error response', { path, status: response.status, message })
    throw new Error(message)
  }

  if (!parseResponse || response.status === 204) {
    return undefined as T
  }

  if (!isJson) {
    throw new Error('La respuesta del servidor no tiene un formato JSON vÃ¡lido.')
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
  // console.log('Refreshing access token')
  const response = await request<RawRefreshResponse>('/auth/refresh', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh_token: currentSession.refreshToken }),
  })

  const token = response.token || response.access_token

  if (!token) {
    console.error('Refresh error: No token in response', response)
    throw new Error('La respuesta de refresco no incluye un token.')
  }

  const refreshToken = response.refresh_token ?? currentSession.refreshToken ?? null
  const expiresAt = deriveExpiration({ token, expiresInSeconds: response.expires_in })
  const user = response.user || currentSession.user

  // console.log('Refresh success', { expiresAt })
  return { token, refreshToken, expiresAt, user }
}

export type { RequestOptions }



