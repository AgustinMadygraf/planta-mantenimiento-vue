<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuth } from './features/auth/composables/useAuth'
import { useSessionStore } from './stores/session'
import NotificationToasts from './components/notifications/NotificationToasts.vue'

const router = useRouter()
const { logout } = useAuth()
const sessionStore = useSessionStore()
const { session } = storeToRefs(sessionStore)

const user = computed(() => session.value?.user ?? null)

function handleLogout() {
  logout()
  router.push({ name: 'login' })
}
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
