<script setup lang="ts">
import { watch, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import NotificationToasts from './components/notifications/NotificationToasts.vue'
import { useCustomAuth } from './features/auth/composables/useCustomAuth'

const router = useRouter()
const { logout, user, isExpired } = useCustomAuth()

function handleLogout() {
  logout()
  router.push({ name: 'login' })
}

watch(isExpired, (expired) => {
  if (expired) {
    logout()
    router.push({ name: 'login' })
  }
})
</script>

<template>
  <div class="bg-light min-vh-100">
    <NotificationToasts />
    <header v-if="user" class="bg-white border-bottom shadow-sm">
      <div class="container py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <p class="mb-0 fw-semibold">Sesión iniciada como {{ user.username }}</p>
          <small class="text-muted text-capitalize">Rol: {{ user.role }}</small>
        </div>
        <button type="button" class="btn btn-outline-danger" @click="handleLogout">Cerrar sesión</button>
      </div>
    </header>

    <RouterView />
  </div>
</template>
