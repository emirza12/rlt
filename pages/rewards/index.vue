<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Rewards</h1>
    
    <BaseCard title="Your Rewards">
      <div class="text-center py-8">
        <p class="text-gray-600 mb-4">Connect your wallet to view your rewards</p>
        <BaseButton v-if="!wallet.isConnected.value" @click="wallet.connect" :loading="wallet.isConnecting.value">
          Connect Wallet
        </BaseButton>
        <div v-else class="text-lg">
          Coming soon...
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { wallet } from '~/composables/useWallet'

definePageMeta({
  layout: 'default'
})
</script> 