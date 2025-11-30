import type { AuthUser } from '../features/auth/types'
import { request } from './httpClient'

interface LoginResponse {
  token: string
  expires_in: number
  user: AuthUser
}

export function login(username: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  })
}
