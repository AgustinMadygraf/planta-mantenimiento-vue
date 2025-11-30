import { computed, getCurrentInstance, inject, reactive, toRefs, type App } from 'vue'

const PINIA_SYMBOL = Symbol('pinia')

interface PiniaInstance {
  _s: Map<string, any>
  install(app: App): void
}

let activePinia: PiniaInstance | null = null

function resolvePinia(): PiniaInstance | null {
  if (activePinia) return activePinia
  const vm = getCurrentInstance()
  if (vm) {
    const injected = inject<PiniaInstance | null>(PINIA_SYMBOL, null)
    if (injected) {
      activePinia = injected
      return injected
    }
  }
  return null
}

export function createPinia(): PiniaInstance {
  const pinia: PiniaInstance = {
    _s: new Map<string, any>(),
    install(app: App) {
      activePinia = pinia
      app.provide(PINIA_SYMBOL, pinia)
    },
  }
  return pinia
}

export function getActivePinia(): PiniaInstance | null {
  return activePinia
}

export function defineStore(id: string, setup: any): any {
  return function useStore() {
    const pinia = resolvePinia()
    const existing = pinia?._s.get(id)
    if (existing) return existing

    let store: any

    if (typeof setup === 'function') {
      store = setup()
    } else {
      const state = reactive(setup.state ? setup.state() : {})
      store = { ...toRefs(state) }

      if (setup.getters) {
        Object.entries(setup.getters).forEach(([key, getter]) => {
          store[key] = computed(() => (getter as any).call(store, state))
        })
      }

      if (setup.actions) {
        Object.entries(setup.actions).forEach(([key, action]) => {
          store[key] = (action as any).bind(store)
        })
      }
    }

    if (pinia) {
      pinia._s.set(id, store)
    } else {
      activePinia = { _s: new Map([[id, store]]), install() {} }
    }

    return store
  }
}

export function storeToRefs<T extends Record<string, any>>(store: T): T {
  return toRefs(store) as unknown as T
}
