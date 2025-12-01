/*
Path: src/shims/vue-router.ts
*/

import { getCurrentInstance, inject, reactive, readonly, type App, type Component, h, defineAsyncComponent } from 'vue'

export type NavigationGuardNext = (value?: any) => void
export type RouteRecord = { name?: string; path?: string; component?: Component; children?: RouteRecord[]; meta?: Record<string, any> }
export type RouteLocationNormalized = {
  path?: string
  fullPath?: string
  name?: string
  params?: Record<string, any>
  query?: Record<string, any>
  meta?: Record<string, any>
}
type RouteLocation = RouteLocationNormalized

export type Router = {
  currentRoute: any
  options: any
  push: (to: RouteLocation | string) => void
  replace: (to: RouteLocation | string) => void
  beforeEach: (guard: any) => void
  addRoute: (route: RouteRecord) => void
  install: (app: App) => void
}

const ROUTER_SYMBOL = Symbol('router')

const routeState = reactive({
  path: '/',
  fullPath: '/',
  name: undefined as string | undefined,
  params: {} as Record<string, any>,
  query: {} as Record<string, any>,
  meta: {} as Record<string, any>,
})

export function createWebHistory(base = '/') {
  return { base }
}

export function createRouter({ history, routes }: { history: any; routes: RouteRecord[] }): Router {
  const router: Router = {
    currentRoute: readonly(routeState),
    options: { history, routes },
    push(to: RouteLocation | string) {
      updateRoute(to)
    },
    replace(to: RouteLocation | string) {
      updateRoute(to)
    },
    beforeEach(guard: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => void) {
      guard?.(
        routeState as RouteLocationNormalized,
        routeState as RouteLocationNormalized,
        (nextArg?: any) => {
          if (nextArg && typeof nextArg === 'object') {
            // Si es una redirección, actualiza la ruta
            updateRoute(nextArg)
          }
        }
      )
    },
    addRoute(route: RouteRecord) {
      routes.push(route)
    },
    install(app: App) {
      app.provide(ROUTER_SYMBOL, router)
      ;(app as any).config.globalProperties.$router = router
      ;(app as any).config.globalProperties.$route = routeState
    },
  }

  return router
}

function updateRoute(to: RouteLocation | string) {
  if (typeof to === 'string') {
    routeState.path = to
    routeState.fullPath = to
    routeState.name = undefined
    routeState.params = {}
    routeState.query = {}
    return
  }

  routeState.path = to.path ?? routeState.path
  routeState.fullPath = to.fullPath ?? to.path ?? routeState.fullPath
  routeState.name = to.name ?? routeState.name
  routeState.params = to.params ?? {}
  routeState.query = to.query ?? {}
  routeState.meta = to.meta ?? {}
}

export function useRouter(): Router {
  const vm = getCurrentInstance()
  const injected = vm ? inject<Router | null>(ROUTER_SYMBOL, null) : null
  return (
    injected || {
      currentRoute: routeState,
      options: {},
      push: (_to?: any) => {},
      replace: (_to?: any) => {},
      beforeEach: () => {},
      addRoute: (_route: RouteRecord) => {},
      install: () => {},
    }
  )
}

export function useRoute(): RouteLocationNormalized {
  const vm = getCurrentInstance()
  const injected = vm ? inject<Router | null>(ROUTER_SYMBOL, null) : null
  return (injected?.currentRoute ?? routeState) as RouteLocationNormalized
}

export const RouterView = {
  name: 'RouterView',
  setup() {
    const router = useRouter()
    return () => {
      try {
        const route = router.options.routes.find(
          (r: any) => r.path === routeState.path || r.name === routeState.name
        )
        // console.log('RouterView:', {
        //   currentPath: routeState.path,
        //   currentName: routeState.name,
        //   foundRoute: route,
        // })
        if (!route) {
          console.warn('RouterView: No se encontró la ruta actual.')
          return null
        }

        let component = route.component
        if (typeof component === 'function') {
          // console.log('RouterView: componente asíncrono, pasando función a defineAsyncComponent...')
          component = defineAsyncComponent(async () => {
            const mod = await route.component()
            // console.log('RouterView: módulo importado:', mod)
            // console.log('RouterView: mod.default es:', mod.default)
            // console.log('RouterView: typeof mod.default:', typeof mod.default)
            if (!mod.default) {
              console.warn('RouterView: El módulo importado no tiene propiedad default.')
            }
            return mod.default || mod
          })
          // console.log('RouterView: defineAsyncComponent creado:', component)
        } else {
          // console.log('RouterView: componente sincrónico', component)
        }
        // console.log('RouterView: h() va a renderizar:', component)
        return component ? h(component) : null
      } catch (error) {
        console.error('RouterView: error al renderizar el componente de la ruta.', error)
        return h('div', { style: 'color: red; padding: 1rem;' }, 'Error al renderizar la ruta.')
      }
    }
  },
}
