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

  // Forzar uso de la API real siempre
  const module = await import('@/services/apiClient')
  console.log('[authApi.ts] resolveRequest: usando apiClient real', module)
  loginRequest = module.request
  return loginRequest
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
  const payload = { username, password }
  console.log('Login attempt', payload)
  const request = await resolveRequest()
  const response = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  })

  console.log('[authApi.ts] Respuesta cruda de login:', response)
  const responsePayload = response?.data ?? response
  const token = responsePayload.token || responsePayload.access_token

  console.log('[authApi.ts] expiresAt en payload:', responsePayload.expiresAt);

  // Validación: rechazar solo demo-token
  if (!token || token === 'demo-token') {
    console.error('Login error: Token inválido o de desarrollo', token)
    throw new Error('El backend respondió con un token inválido. Por favor, inicia sesión con credenciales reales.')
  }

  const user = normalizeUser(responsePayload.user ?? responsePayload.usuario, username)
  const expiresAt = typeof responsePayload.expiresAt === 'number' ? responsePayload.expiresAt : deriveExpiration({ token, expiresInSeconds: responsePayload.expires_in });
  const refreshToken = typeof responsePayload.refresh_token === 'string'
    ? responsePayload.refresh_token
    : (responsePayload.refresh_token ?? null);
  console.log('[authApi.ts] refresh_token recibido:', responsePayload.refresh_token);
  console.log('[authApi.ts] objeto final de sesión:', {
    token,
    refreshToken,
    expiresAt,
    user,
  });

  console.log('Login success', { user })
  return {
    token,
    refreshToken,
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
