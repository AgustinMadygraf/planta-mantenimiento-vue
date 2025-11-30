<script setup lang="ts">
import { computed } from 'vue'
import LoginCard from './features/auth/components/LoginCard.vue'
import { useAuth } from './features/auth/composables/useAuth'
import AssetsPage from './features/assets/components/AssetsPage.vue'

const { user, login, logout } = useAuth()
const roleNotice = computed(() => {
  if (!user.value) return ''

  if (user.value.role === 'superadministrador') {
    return 'Acceso total para crear, editar y eliminar en toda la planta.'
  }

  if (user.value.role === 'administrador') {
    return `Gestión limitada a su área asignada (IDs: ${(user.value.areas || []).join(', ') || 'sin asignar'}).`
  }

  if (user.value.role === 'maquinista') {
    return `Gestión limitada a sus equipos asignados (IDs: ${(user.value.equipos || []).join(', ') || 'sin asignar'}).`
  }

  return 'Navegación solo de lectura. La edición, creación y eliminación están deshabilitadas.'
})

async function handleLogin({
  username,
  password,
  setError,
}: {
  username: string
  password: string
  setError: (message: string | null) => void
}) {
  try {
    await login(username, password)
    setError(null)
  } catch (error) {
    setError((error as Error).message)
  }
}
</script>

<template>
  <div class="bg-light min-vh-100">
    <header v-if="user" class="bg-white border-bottom shadow-sm">
      <div class="container py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <p class="mb-0 fw-semibold">Sesión iniciada como {{ user.username }}</p>
          <small class="text-muted text-capitalize">Rol: {{ user.role }}</small>
        </div>
        <button type="button" class="btn btn-outline-danger" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <LoginCard v-if="!user" @submit="handleLogin" />

    <section v-else class="py-4">
      <div class="container mb-4">
        <div class="alert" :class="user.role === 'invitado' ? 'alert-warning' : 'alert-info'" role="status">
          {{ roleNotice }}
        </div>
      </div>
      <AssetsPage :user="user" />
    </section>
  </div>
</template>
