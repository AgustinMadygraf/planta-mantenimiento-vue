/*
Path: src/features/auth/composables/useAuth.ts
*/

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
    let authSession
    try {
      authSession = await requestLogin({
        username: sanitizedUsername,
        password: sanitizedPassword,
      })
      devLog('useAuth.login: authSession recibido', authSession)
    } catch (error) {
      devLog('useAuth.login: error en requestLogin', error)
      throw error
    }

    if (!authSession || !authSession.user) {
      devLog('useAuth.login: sesión inválida o sin usuario', authSession)
      throw new Error('No se recibió usuario válido en la sesión')
    }

    sessionStore.setSession(authSession)
    devLog('useAuth.login: sessionStore.setSession ejecutado', authSession)
    devLog('Session persisted', { user: authSession.user })
  }

  function logout() {
    sessionStore.clearSession()
    devLog('User logged out')
  }

  return { user, login, logout }
}
