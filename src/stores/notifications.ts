import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationVariant = 'success' | 'danger' | 'warning' | 'info'

export interface NotificationItem {
  id: number
  type: NotificationVariant
  message: string
}

interface AddOptions {
  durationMs?: number
  persist?: boolean
}

const DEFAULT_DURATION = 5000

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const timers = new Map<number, number>()

  function add(type: NotificationVariant, message: string, options: AddOptions = {}) {
    const id = Date.now() + Math.random()
    notifications.value.push({ id, type, message })

    if (!options.persist) {
      const timerId = window.setTimeout(() => remove(id), options.durationMs ?? DEFAULT_DURATION)
      timers.set(id, timerId)
    }

    return id
  }

  function remove(id: number) {
    notifications.value = notifications.value.filter((item) => item.id !== id)
    const timerId = timers.get(id)
    if (timerId) {
      window.clearTimeout(timerId)
      timers.delete(id)
    }
  }

  function clear() {
    notifications.value = []
    timers.forEach((timerId) => window.clearTimeout(timerId))
    timers.clear()
  }

  return { notifications, add, remove, clear }
})
