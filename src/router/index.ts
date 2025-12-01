/*
Path: src/router/index.ts
*/

import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import { storeToRefs } from 'pinia'
import { isSessionExpired } from '../features/auth/services/session'
import { useSessionStore } from '../stores/session'
import { useCustomAuth } from '../features/auth/composables/useCustomAuth'

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
  // Usar el nuevo composable para autenticación y expiración
  const { user, isExpired } = useCustomAuth()
  let requiresAuth = Boolean(to.meta && (to.meta as any).requiresAuth)
  if (to.name === undefined && to.path === '/') {
    requiresAuth = true;
  }

  // Si la sesión está expirada, redirigir a login
  if (isExpired.value) {
    next({ name: 'login', query: { redirect: to.fullPath || to.path || '/' } })
    return
  }

  if (requiresAuth && !user.value) {
    next({ name: 'login', query: { redirect: to.fullPath || to.path || '/' } })
    return
  }

  if ((to.name === 'login' || (to.path === '/login')) && user.value) {
    next({ name: 'assets' })
    return
  }

  next()
})

export default router
