import type { AuthUser } from '../types'
import { deriveExpiration } from './session'
import { request } from '../../../services/apiClient'
import { devError, devLog } from '../../../utils/devLogger'

interface RawLoginResponse {
  token?: string
  access_token?: string
  refresh_token?: string | null
  expires_in?: number | null
  user?: AuthUser
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

  const token = response.token || response.access_token

  if (!token) {
    devError('Login error: No token in response', response)
    throw new Error('La respuesta de autenticación no incluye un token.')
  }

  if (!response.user) {
    devError('Login error: No user in response', response)
    throw new Error('La respuesta de autenticación no incluye la información de usuario.')
  }

  devLog('Login success', { user: response.user })
  return {
    token,
    refreshToken: response.refresh_token ?? null,
    expiresAt: deriveExpiration({ token, expiresInSeconds: response.expires_in }),
    user: response.user,
  }
}
