/*
Path: src/features/auth/services/authApi.ts
*/

import type { AuthUser, UserRole } from '../types'
import { deriveExpiration } from './session.js'

interface RawLoginResponse {
  token?: string
  access_token?: string
  refresh_token?: string | null
  expires_in?: number | null
  expiresAt?: number | null
  user?: AuthUser
  usuario?: unknown
  data?: RawLoginResponse
}

export interface LoginSuccess {
  token: string
  refreshToken: string | null
  expiresAt: number | null
  user: AuthUser
}

type RequestFunction = (
  path: string,
  options?: {
    auth?: boolean
    parseResponse?: boolean
    method?: string
    body?: BodyInit | null
    headers?: HeadersInit
  },
) => Promise<RawLoginResponse>

let loginRequest: RequestFunction | null = null

async function resolveRequest(): Promise<RequestFunction> {
  if (loginRequest) return loginRequest

  // Use stub in development, real API in production
  console.log('[authApi.ts] resolveRequest: import.meta.env.MODE =', import.meta.env.MODE)
  if (import.meta.env.MODE === 'development') {
    const module = await import('../../../stubs/apiClient')
    console.log('[authApi.ts] resolveRequest: usando stub de apiClient', module)
    loginRequest = module.request
    return loginRequest
  } else {
    const module = await import('../../../services/apiClient')
    console.log('[authApi.ts] resolveRequest: usando apiClient real', module)
    loginRequest = module.request
    return loginRequest
  }
}

export function __setAuthRequest(mockedRequest: RequestFunction) {
  loginRequest = mockedRequest
}

export function __resetAuthRequest() {
  loginRequest = null
}

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<LoginSuccess> {
  console.log('Login attempt', { username })
  const request = await resolveRequest()
  const response = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  })

  console.log('[authApi.ts] Respuesta cruda de login:', response)
  const payload = response?.data ?? response
  const token = payload.token || payload.access_token

  console.log('[authApi.ts] expiresAt en payload:', payload.expiresAt);

  if (!token) {
    console.error('Login error: No token in response', response)
    throw new Error('La respuesta de autenticación no incluye un token.')
  }

  const user = normalizeUser(payload.user ?? payload.usuario, username)
  const expiresAt = typeof payload.expiresAt === 'number' ? payload.expiresAt : deriveExpiration({ token, expiresInSeconds: payload.expires_in });
  console.log('[authApi.ts] expiresAt final:', expiresAt)

  console.log('[authApi.ts] objeto final de sesión:', {
    token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt,
    user,
  });

  console.log('Login success', { user })
  return {
    token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt,
    user,
  }
}

function normalizeUser(rawUser: unknown, username: string): AuthUser {
  const fallback = getDemoUser(username)

  if (isValidAuthUser(rawUser)) return rawUser

  if (!rawUser) {
    if (fallback) return fallback
    throw new Error('La respuesta de autenticación no incluye la información de usuario.')
  }

  if (typeof rawUser === 'object') {
    const candidate = rawUser as Record<string, unknown>
    const role = normalizeRole(candidate.role ?? candidate.rol ?? candidate.perfil ?? candidate.tipo)
    if (role) {
      return {
        username: String(candidate.username ?? candidate.usuario ?? username),
        role,
        areas: toNumberArray(candidate.areas ?? candidate.area_ids ?? candidate.areaIds),
        equipos: toNumberArray(candidate.equipos ?? candidate.equipo_ids ?? candidate.equipoIds),
      }
    }
  }

  if (fallback) return fallback

  throw new Error('La respuesta de autenticación no incluye un rol de usuario válido.')
}

function isValidAuthUser(user: unknown): user is AuthUser {
  if (!user || typeof user !== 'object') return false

  const candidate = user as Partial<AuthUser>
  return typeof candidate.username === 'string' && typeof candidate.role === 'string'
}

function normalizeRole(value: unknown): UserRole | null {
  if (!value) return null

  const normalized = String(value).toLowerCase()
  const roleMap: Record<string, UserRole> = {
    superadmin: 'superadministrador',
    superadministrador: 'superadministrador',
    '1': 'superadministrador',
    admin: 'administrador',
    administrador: 'administrador',
    'admin-area': 'administrador',
    '2': 'administrador',
    maquinista: 'maquinista',
    '3': 'maquinista',
    invitado: 'invitado',
    guest: 'invitado',
    visitante: 'invitado',
    '4': 'invitado',
  }

  return roleMap[normalized] ?? null
}

function getDemoUser(username: string): AuthUser | null {
  const key = username.trim().toLowerCase()

  const demoUsers: Record<string, AuthUser> = {
    superadmin: { username: 'superadmin', role: 'superadministrador' },
    'admin-area': { username: 'admin-area', role: 'administrador', areas: [1] },
    maquinista: { username: 'maquinista', role: 'maquinista', equipos: [1, 2] },
    invitado: { username: 'invitado', role: 'invitado' },
  }

  return demoUsers[key] ?? null
}

function toNumberArray(value: unknown): number[] | undefined {
  if (!value) return undefined

  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
  }

  return undefined
}
