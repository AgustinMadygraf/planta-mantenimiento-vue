/*
Path: src/stores/session.ts
*/

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  isSessionExpired,
  loadSession,
  persistSession,
  type AuthSession,
} from '../features/auth/services/session'

export const useSessionStore = defineStore('session', () => {
  const session = ref<AuthSession | null>(loadSession())
  console.log('session.ts: store inicializado, session:', session.value)

  const isAuthenticated = computed(() => Boolean(session.value))
  const isExpired = computed(() => isSessionExpired(session.value))

  function setSession(newSession: AuthSession | null) {
    console.log('session.ts: setSession called with:', newSession)
    session.value = newSession
    console.log('session.ts: session.value actualizado:', session.value)
    persistSession(newSession)
    console.log('session.ts: persistSession ejecutado')
  }

  function clearSession() {
    console.log('session.ts: clearSession called')
    setSession(null)
  }

  function updateSession(partial: Partial<AuthSession>) {
    if (!session.value) {
      console.log('session.ts: updateSession llamado sin sesión activa')
      return
    }
    console.log('session.ts: updateSession llamado con:', partial)
    setSession({ ...session.value, ...partial })
  }

  return {
    session,
    isAuthenticated,
    isExpired,
    setSession,
    clearSession,
    updateSession,
  }
})
