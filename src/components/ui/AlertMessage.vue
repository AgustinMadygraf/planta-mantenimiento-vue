<template>
  <div v-if="feedback" class="alert" :class="`alert-${feedback.type}`" role="alert">
    <div class="d-flex justify-content-between align-items-start gap-3">
      <span>{{ feedback.message }}</span>
      <button type="button" class="btn-close" aria-label="Cerrar" @click="$emit('close')"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Feedback } from '../../features/assets/composables/useFeedback'

defineProps<{ feedback: Feedback }>()
</script>
