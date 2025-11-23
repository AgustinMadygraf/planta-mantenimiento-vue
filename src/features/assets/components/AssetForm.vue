<template>
  <form @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label" :for="inputId">Nombre</label>
      <input
        :id="inputId"
        :value="nombre"
        type="text"
        class="form-control"
        :placeholder="placeholder"
        :disabled="disabled || saving"
        required
        @input="$emit('update:nombre', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-primary" :disabled="disabled || saving">
        {{ mode === 'create' ? createLabel : editLabel }}
      </button>
      <button v-if="mode === 'edit'" type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
        Cancelar
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { CrudMode } from '../composables/useCrudForm'

withDefaults(
  defineProps<{
    mode: CrudMode
    nombre: string
    inputId: string
    placeholder: string
    createLabel: string
    editLabel: string
    saving: boolean
    disabled?: boolean
  }>(),
  { disabled: false },
)

defineEmits<{
  (e: 'update:nombre', value: string): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()
</script>
