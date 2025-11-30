<template>
  <div v-if="loading" class="text-center py-4">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Cargando…</span>
    </div>
  </div>
  <div v-else class="list-group">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-group-item"
      :class="{ active: selectedId === item.id }"
    >
      <div class="d-flex align-items-center justify-content-between gap-3">
        <button
          class="btn btn-link text-decoration-none text-reset flex-grow-1 text-start"
          type="button"
          @click="$emit('select', item)"
        >
          {{ item.nombre }}
        </button>
        <div v-if="canManage" class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-light"
            :disabled="!actionAllowed(item)"
            @click.stop="$emit('edit', item)"
          >
            Editar
          </button>
          <button
            type="button"
            class="btn btn-outline-light"
            :disabled="removing || !actionAllowed(item)"
            @click.stop="$emit('delete', item)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
    <p v-if="!items.length" class="text-muted mb-0">{{ emptyLabel }}</p>
  </div>
</template>

<script setup lang="ts">
type AssetListItem = { id: number; nombre: string; [key: string]: unknown }

const props = withDefaults(
  defineProps<{
    items: AssetListItem[]
    selectedId: number | null
    loading: boolean
    removing: boolean
    emptyLabel: string
    canManage?: boolean
    isActionAllowed?: (item: any) => boolean
  }>(),
  { canManage: true },
)

const actionAllowed = (item: AssetListItem) => (props.isActionAllowed ? props.isActionAllowed(item) : props.canManage)

defineEmits<{
  (e: 'select', item: any): void
  (e: 'edit', item: any): void
  (e: 'delete', item: any): void
}>()
</script>
