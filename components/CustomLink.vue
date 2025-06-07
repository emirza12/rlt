<template>
  <NuxtLink
    :to="to"
    :class="[
      'block py-2 px-4 rounded-md hover:bg-lightBg transition-colors',
      { 'bg-lightBg text-primary font-medium': isActive }
    ]"
  >
    <slot />
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  }
})

const route = useRoute()

// Check if this link is active
const isActive = computed(() => {
  const linkPath = typeof props.to === 'string' ? props.to : props.to.path
  const currentPath = route.path
  
  // Handle root path
  if (linkPath === '/') {
    return currentPath === '/'
  }
  
  // Handle other paths
  return currentPath.startsWith(linkPath)
})
</script> 