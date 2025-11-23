import type { Ref } from 'vue'

export function syncSelection<T extends { id: number }>(
  collection: T[],
  selected: Ref<T | null>,
  onSelect: (entity: T) => void,
  onClear: () => void,
) {
  if (!collection.length) {
    onClear()
    return
  }

  const firstItem = collection[0]
  const found = selected.value ? collection.find((item) => item.id === selected.value?.id) : undefined
  const nextSelection = (found ?? firstItem) as T

  onSelect(nextSelection)
}
