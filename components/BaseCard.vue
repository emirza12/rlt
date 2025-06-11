<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
    <div v-if="$slots.header || title" class="p-4 border-b border-gray-200 bg-gray-50">
      <slot name="header">
        <h2 v-if="title" class="text-xl font-semibold text-gray-900">{{ title }}</h2>
      </slot>
    </div>
    <div class="p-6">
      <slot name="content">
        <slot></slot>
      </slot>
    </div>
    <div v-if="$slots.footer" class="p-4 border-t border-gray-200 bg-gray-50">
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