<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-3 text-center">Iniciar sesión</h1>
            <p class="text-muted text-center mb-4">Usa superadmin/superadmin o invitado/invitado.</p>

            <form class="vstack gap-3" @submit.prevent="onSubmit">
              <div>
                <label class="form-label" for="username">Usuario</label>
                <input
                  id="username"
                  v-model.trim="username"
                  type="text"
                  class="form-control"
                  autocomplete="username"
                  required
                  :disabled="loading"
                />
              </div>

              <div>
                <label class="form-label" for="password">Contraseña</label>
                <input
                  id="password"
                  v-model.trim="password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                  :disabled="loading"
                />
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

              <button class="btn btn-primary w-100" type="submit" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Acceder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit', payload: { username: string; password: string; setError: (message: string | null) => void }): void
}>()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

function setError(message: string | null) {
  error.value = message
}

async function onSubmit() {
  loading.value = true
  error.value = null
  try {
    await emit('submit', { username: username.value, password: password.value, setError })
  } finally {
    loading.value = false
  }
}
</script>
