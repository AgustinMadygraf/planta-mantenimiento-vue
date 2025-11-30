<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import LoginCard from '../components/LoginCard.vue'
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()
const router = useRouter()
const route = useRoute()

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

    const redirect = typeof route.query?.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect || '/')
  } catch (error) {
    setError((error as Error).message)
  }
}
</script>

<template>
  <div class="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
    <LoginCard @submit="handleLogin" />
  </div>
</template>
