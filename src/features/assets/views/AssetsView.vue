<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AssetsPage from '../components/AssetsPage.vue'
import { useSessionStore } from '../../../stores/session'

const sessionStore = useSessionStore()
const { session } = storeToRefs(sessionStore)

const user = computed(() => session.value?.user ?? null)

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
</script>

<template>
  <section v-if="user" class="py-4">
    <div class="container mb-4">
      <div class="alert" :class="user.role === 'invitado' ? 'alert-warning' : 'alert-info'" role="status">
        {{ roleNotice }}
      </div>
    </div>

    <AssetsPage :user="user" />
  </section>
</template>
