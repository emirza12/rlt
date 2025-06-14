<template>
  <button
    :class="[
      'font-medium rounded-md transition-colors',
      sizeClasses,
      variantClasses,
      { 'opacity-60 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center">
      <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <slot></slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

defineEmits(['click'])

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary text-black hover:bg-primary/90 transition-all duration-200'
    case 'secondary':
      return 'bg-background text-black hover:bg-background/80 transition-all duration-200'
    case 'outline':
      return 'bg-transparent border border-primary text-black hover:bg-primary/10 transition-all duration-200'
    default:
      return 'bg-primary text-black hover:bg-primary/90 transition-all duration-200'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'md':
      return 'px-4 py-2'
    case 'lg':
      return 'px-6 py-3 text-lg'
    default:
      return 'px-4 py-2'
  }
})
</script> 