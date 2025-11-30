import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import { storeToRefs } from 'pinia'
import { isSessionExpired } from '../features/auth/services/session'
import { useSessionStore } from '../stores/session'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../features/auth/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'assets',
      component: () => import('../features/assets/views/AssetsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const sessionStore = useSessionStore()
  const { session, isAuthenticated } = storeToRefs(sessionStore)

  if (session.value && isSessionExpired(session.value)) {
    sessionStore.clearSession()
  }

  const requiresAuth = Boolean(to.meta && (to.meta as any).requiresAuth)

  if (requiresAuth && !isAuthenticated.value) {
    next({ name: 'login', query: { redirect: to.fullPath || to.path || '/' } })
    return
  }

  if (to.name === 'login' && isAuthenticated.value) {
    next({ name: 'assets' })
    return
  }

  next()
})

export default router
