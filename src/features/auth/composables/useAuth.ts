import { computed, ref } from 'vue'
import { login as loginRequest } from '../../../services/auth'
import { getActiveSession, saveSession } from '../session'
import type { AuthSession } from '../types'

const user = ref<AuthSession['user'] | null>(null)
const token = ref<string | null>(null)
const expiresAt = ref<number | null>(null)
let expiryTimer: number | null = null

function isBrowser() {
  return typeof window !== 'undefined'
}

function clearExpiryTimer() {
  if (expiryTimer !== null && isBrowser()) {
    window.clearTimeout(expiryTimer)
    expiryTimer = null
  }
}

function applySession(session: AuthSession | null) {
  clearExpiryTimer()

  if (!session) {
    user.value = null
    token.value = null
    expiresAt.value = null
    saveSession(null)
    return
  }

  user.value = session.user
  token.value = session.token
  expiresAt.value = session.expiresAt
  saveSession(session)

  if (isBrowser()) {
    const msUntilExpiry = session.expiresAt - Date.now()

    if (msUntilExpiry <= 0) {
      applySession(null)
      return
    }

    expiryTimer = window.setTimeout(() => applySession(null), msUntilExpiry)
  }
}

applySession(getActiveSession())

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value && token.value))

  async function login(username: string, password: string) {
    const response = await loginRequest(username.trim(), password.trim())

    const session: AuthSession = {
      user: response.user,
      token: response.token,
      expiresAt: Date.now() + response.expires_in * 1000,
    }

    applySession(session)
  }

  function logout() {
    applySession(null)
  }

  return { user, token, expiresAt, isAuthenticated, login, logout }
}
