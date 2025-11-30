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

  const isAuthenticated = computed(() => Boolean(session.value))
  const isExpired = computed(() => isSessionExpired(session.value))

  function setSession(newSession: AuthSession | null) {
    console.log('session.ts: setSession called with:', newSession)
    session.value = newSession
    persistSession(newSession)
  }

  function clearSession() {
    setSession(null)
  }

  function updateSession(partial: Partial<AuthSession>) {
    if (!session.value) return

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
