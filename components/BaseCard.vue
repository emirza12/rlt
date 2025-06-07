<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
    <div v-if="title" class="p-4 border-b flex justify-between items-center">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <slot name="header-right"></slot>
    </div>
    <div class="p-6">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="p-4 border-t">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script> 