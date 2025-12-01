import { computed, watch } from 'vue'
import { useSessionStore } from '../../../stores/session'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { login as loginApi } from '../services/authApi'

const sessionStore = useSessionStore()
const { session } = storeToRefs(sessionStore)
const router = useRouter()

const user = computed(() => session.value?.user ?? null)
const token = computed(() => session.value?.token ?? null)
const expiresAt = computed(() => session.value?.expiresAt ?? null)
const isAuthenticated = computed(() => !!user.value && !!token.value)
const isExpired = computed(() => {
  return expiresAt.value ? Date.now() >= expiresAt.value : false
})

function logout() {
  sessionStore.clearSession()
  router.push({ name: 'login' })
}

async function login(username: string, password: string) {
  try {
    const authSession = await loginApi({ username, password })
    sessionStore.setSession(authSession)
    router.push({ name: 'assets' })
  } catch (error) {
    throw error
  }
}

// Expiración automática
watch(isExpired, (expired) => {
  if (expired) {
    logout()
  }
})

export function useCustomAuth() {
  return {
    user,
    token,
    isAuthenticated,
    isExpired,
    login,
    logout,
  }
}
