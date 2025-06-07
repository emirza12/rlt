<template>
  <div :class="[
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
    verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  ]">
    <svg v-if="verified" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
    {{ verified ? 'Verified' : 'Unverified' }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  verified: {
    type: Boolean,
    default: false
  }
})
</script> 