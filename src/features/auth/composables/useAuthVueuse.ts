import { useAuth } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useSessionStore } from '../../../stores/session'
import { storeToRefs } from 'pinia'

const sessionStore = useSessionStore()
const { session } = storeToRefs(sessionStore)

const auth = useAuth({
  fetchUser: async () => session.value?.user ?? null,
  fetchToken: async () => session.value?.token ?? null,
  login: async ({ username, password }) => {
    // Usa tu login real aquí
    const { login } = await import('./useAuth')
    await login({ username, password })
  },
  logout: async () => {
    const { logout } = await import('./useAuth')
    logout()
  },
  // Opcional: refresh token si tu backend lo soporta
})

const isExpired = computed(() => {
  const expiresAt = session.value?.expiresAt
  return expiresAt ? Date.now() >= expiresAt : false
})

export function useAuthVueuse() {
  return {
    ...auth,
    isExpired,
    user: computed(() => session.value?.user ?? null),
    token: computed(() => session.value?.token ?? null),
  }
}
