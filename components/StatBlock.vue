<template>
  <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
    <div class="flex items-center space-x-3">
      <div v-if="icon" class="p-2 bg-primary/10 rounded-full">
        <component :is="icon" class="h-5 w-5 text-primary" />
      </div>
      <div v-else-if="$slots.icon" class="p-2 bg-primary/10 rounded-full">
        <slot name="icon"></slot>
      </div>
      
      <div class="flex-1">
        <div class="text-2xl font-semibold">{{ value }}</div>
        <div class="text-sm text-gray-600">{{ label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  icon?: any
}

defineProps<Props>()
</script> 