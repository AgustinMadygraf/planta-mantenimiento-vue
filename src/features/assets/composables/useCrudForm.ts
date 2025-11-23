import { reactive } from 'vue'

export type CrudMode = 'create' | 'edit'

export interface CrudFormState {
  id: number | null
  nombre: string
  mode: CrudMode
}

export interface CrudItem {
  id: number
  nombre: string
}

export function useCrudForm(initialNombre = '') {
  const form = reactive<CrudFormState>({
    id: null,
    nombre: initialNombre,
    mode: 'create',
  })

  function reset() {
    form.id = null
    form.nombre = initialNombre
    form.mode = 'create'
  }

  function startEdit(item: CrudItem) {
    form.id = item.id
    form.nombre = item.nombre
    form.mode = 'edit'
  }

  return { form, reset, startEdit }
}
