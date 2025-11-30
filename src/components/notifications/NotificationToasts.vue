<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
    <div
      v-for="toast in notifications"
      :key="toast.id"
      class="toast show align-items-center text-white border-0 shadow-sm mb-2"
      :class="variantClass(toast.type)"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          aria-label="Cerrar"
          @click="remove(toast.id)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore, type NotificationVariant } from '../../stores/notifications'

const notificationsStore = useNotificationsStore()
const { notifications } = storeToRefs(notificationsStore)
const { remove } = notificationsStore

function variantClass(variant: NotificationVariant) {
  switch (variant) {
    case 'success':
      return 'bg-success'
    case 'warning':
      return 'bg-warning text-dark'
    case 'info':
      return 'bg-info text-dark'
    default:
      return 'bg-danger'
  }
}
</script>
