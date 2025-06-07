<template>
  <BaseCard class="transition-all duration-300 transform hover:-translate-y-1">
    <div class="space-y-3">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      
      <div class="flex flex-col space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-600">Balance:</span>
          <span class="font-medium text-black">{{ formatAmount(balance) }}</span>
        </div>
        
        <div class="flex justify-between" v-if="lockedAmount !== undefined">
          <span class="text-gray-600">Locked:</span>
          <span class="font-medium text-black">{{ formatAmount(lockedAmount) }}</span>
        </div>
      </div>
      
      <slot></slot>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
interface Props {
  title: string
  balance: number
  lockedAmount?: number
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  decimals: 2
})

const formatAmount = (amount: number): string => {
  return amount.toFixed(props.decimals)
}
</script> 