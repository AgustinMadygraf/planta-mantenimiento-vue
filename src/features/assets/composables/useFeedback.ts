import { ref } from 'vue'

export type Feedback = { type: 'success' | 'danger' | 'warning'; message: string } | null

export function useFeedback() {
  const feedback = ref<Feedback>(null)

  function setFeedback(type: 'success' | 'danger' | 'warning', message: string) {
    feedback.value = { type, message }
  }

  function clearFeedback() {
    feedback.value = null
  }

  return { feedback, setFeedback, clearFeedback }
}
