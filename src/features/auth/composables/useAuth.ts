import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { AuthUser } from '../types'
import { login as requestLogin } from '../services/authApi'
import { useSessionStore } from '../../../stores/session'

import { devLog } from '../../../utils/devLogger'

export function useAuth() {
  const sessionStore = useSessionStore()
  const { session } = storeToRefs(sessionStore)
  const user = computed<AuthUser | null>(() => session.value?.user ?? null)

  async function login(username: string, password: string) {
    const sanitizedUsername = username.trim()
    const sanitizedPassword = password.trim()

    devLog('useAuth.login called', { sanitizedUsername })
    const authSession = await requestLogin({
      username: sanitizedUsername,
      password: sanitizedPassword,
    })

    console.log('useAuth.ts: authSession recibido:', authSession)
    sessionStore.setSession(authSession)
    devLog('Session persisted', { user: authSession.user })
  }

  function logout() {
    sessionStore.clearSession()
    devLog('User logged out')
  }

  return { user, login, logout }
}
