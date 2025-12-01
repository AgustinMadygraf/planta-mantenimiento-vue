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
  // console.log('router.beforeEach:', {
  //   to: to.path,
  //   name: to.name,
  //   requiresAuth: Boolean(to.meta && (to.meta as any).requiresAuth),
  //   isAuthenticated: isAuthenticated.value,
  //   session: session.value
  // })

  if (session.value && isSessionExpired(session.value)) {
    sessionStore.clearSession()
  }

  let requiresAuth = Boolean(to.meta && (to.meta as any).requiresAuth)
  // Si la ruta es '/' y no tiene nombre, forzar requiresAuth=true
  if (to.name === undefined && to.path === '/') {
    requiresAuth = true;
  }
  // console.log('router.beforeEach: valor final requiresAuth:', requiresAuth)

  if (requiresAuth && !isAuthenticated.value) {
    // console.log('router.beforeEach: redirigiendo a /login')
    next({ name: 'login', query: { redirect: to.fullPath || to.path || '/' } })
    return
  }

  if ((to.name === 'login' || (to.path === '/login')) && isAuthenticated.value) {
    // console.log('router.beforeEach: redirigiendo a /assets')
    next({ name: 'assets' })
    return
  }

  // console.log('router.beforeEach: navegación permitida')
  next()
})

export default router
