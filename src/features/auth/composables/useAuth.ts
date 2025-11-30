import { ref } from 'vue'
import type { AuthUser, UserRole } from '../types'

const STORAGE_KEY = 'planta-mantenimiento.auth'

interface Credentials {
  username: string
  password: string
  areas?: number[]
  equipos?: number[]
}

const DEMO_USERS: Record<UserRole, Credentials> = {
  superadministrador: { username: 'superadmin', password: 'superadmin' },
  administrador: { username: 'admin-area', password: 'admin-area', areas: [1] },
  maquinista: { username: 'maquinista', password: 'maquinista', equipos: [1, 2] },
  invitado: { username: 'invitado', password: 'invitado' },
}

function isValidAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AuthUser>
  return typeof candidate.username === 'string' && typeof candidate.role === 'string'
}

function loadStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const storedUser = window.localStorage.getItem(STORAGE_KEY)
  if (!storedUser) return null

  try {
    const parsed = JSON.parse(storedUser)
    if (isValidAuthUser(parsed)) return parsed
  } catch (error) {
    // Ignore and clear storage below
  }

  window.localStorage.removeItem(STORAGE_KEY)
  return null
}

const user = ref<AuthUser | null>(loadStoredUser())

function persistUser(value: AuthUser | null) {
  if (typeof window === 'undefined') return

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

function matchCredentials(username: string, password: string): AuthUser | null {
  const entry = Object.entries(DEMO_USERS).find(([, creds]) => creds.username === username)
  if (!entry) return null

  const [role, creds] = entry as [UserRole, Credentials]
  if (creds.password !== password) return null

  return { username, role, areas: creds.areas, equipos: creds.equipos }
}

export function useAuth() {
  async function login(username: string, password: string) {
    const match = matchCredentials(username.trim(), password.trim())

    if (!match) {
      throw new Error(
        'Credenciales inválidas. Usa superadmin/superadmin, admin-area/admin-area, maquinista/maquinista o invitado/invitado.',
      )
    }

    user.value = match
    persistUser(match)
  }

  function logout() {
    user.value = null
    persistUser(null)
  }

  return { user, login, logout }
}
