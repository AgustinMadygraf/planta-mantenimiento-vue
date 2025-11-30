import { computed, ref } from 'vue'
import type { AuthUser } from '../types'
import { login as requestLogin } from '../../../services/api'
import type { AuthSession } from '../../../services/session'
import { loadSession, persistSession } from '../../../services/session'

import { devLog } from '../../../utils/devLogger'

const session = ref<AuthSession | null>(loadSession())
const user = computed<AuthUser | null>(() => session.value?.user ?? null)

export function useAuth() {
  async function login(username: string, password: string) {
    const sanitizedUsername = username.trim()
    const sanitizedPassword = password.trim()

    devLog('useAuth.login called', { sanitizedUsername })
    const authSession = await requestLogin({
      username: sanitizedUsername,
      password: sanitizedPassword,
    })

    session.value = authSession
    persistSession(authSession)
    devLog('Session persisted', { user: authSession.user })
  }

  function logout() {
    session.value = null
    persistSession(null)
    devLog('User logged out')
  }

  return { user, login, logout }
}
