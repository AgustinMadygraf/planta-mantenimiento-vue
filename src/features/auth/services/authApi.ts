import type { AuthUser, UserRole } from '../types'
import { deriveExpiration } from './session'
import { request } from '../../../services/apiClient'
import { devError, devLog } from '../../../utils/devLogger'

interface RawLoginResponse {
  token?: string
  access_token?: string
  refresh_token?: string | null
  expires_in?: number | null
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

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<LoginSuccess> {
  devLog('Login attempt', { username })
  const response = await request<RawLoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  })

  const payload = response?.data ?? response

  const token = payload.token || payload.access_token

  if (!token) {
    devError('Login error: No token in response', response)
    throw new Error('La respuesta de autenticación no incluye un token.')
  }

  const user = normalizeUser(payload.user ?? payload.usuario, username)

  devLog('Login success', { user })
  return {
    token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt: deriveExpiration({ token, expiresInSeconds: payload.expires_in }),
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
