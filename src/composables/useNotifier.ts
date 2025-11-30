import { useNotificationsStore, type NotificationVariant } from '../stores/notifications'

export function useNotifier() {
  const store = useNotificationsStore()

  const notify = (type: NotificationVariant, message: string) => store.add(type, message)

  return {
    notify,
    notifySuccess: (message: string) => notify('success', message),
    notifyError: (message: string) => notify('danger', message),
    notifyWarning: (message: string) => notify('warning', message),
    notifyInfo: (message: string) => notify('info', message),
    clearNotifications: () => store.clear(),
  }
}
