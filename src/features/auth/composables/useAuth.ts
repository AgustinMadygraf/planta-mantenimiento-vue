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

const storedUser = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
const user = ref<AuthUser | null>(storedUser ? JSON.parse(storedUser) : null)

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
