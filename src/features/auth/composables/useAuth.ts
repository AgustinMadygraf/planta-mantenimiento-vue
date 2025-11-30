/*
Path: src/features/auth/composables/useAuth.ts
*/

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { AuthUser } from '../types'
import { login as requestLogin } from '../services/authApi'
import { useSessionStore } from '../../../stores/session'

export function useAuth() {
  const sessionStore = useSessionStore()
  const { session } = storeToRefs(sessionStore)
  const user = computed<AuthUser | null>(() => session.value?.user ?? null)

  async function login(username: string, password: string) {
    const sanitizedUsername = username.trim()
    const sanitizedPassword = password.trim()

    console.log('useAuth.login called', { sanitizedUsername })
    let authSession
    try {
      authSession = await requestLogin({
        username: sanitizedUsername,
        password: sanitizedPassword,
      })
      console.log('useAuth.login: authSession recibido', authSession)
    } catch (error) {
      console.log('useAuth.login: error en requestLogin', error)
      throw error
    }

    if (!authSession || !authSession.user) {
      console.log('useAuth.login: sesión inválida o sin usuario', authSession)
      throw new Error('No se recibió usuario válido en la sesión')
    }

    sessionStore.setSession(authSession)
    console.log('useAuth.login: sessionStore.setSession ejecutado', authSession)
    console.log('Session persisted', { user: authSession.user })
  }

  function logout() {
    sessionStore.clearSession()
    console.log('User logged out')
  }

  return { user, login, logout }
}
