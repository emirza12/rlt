<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Your Vault</h1>
    
    <BaseCard title="Vault Access">
      <div class="text-center py-8">
        <p class="text-gray-600 mb-4">Connect your XRPL wallet to view and manage your vault deposits</p>
        <XRPLWalletConnect v-if="!wallet.isConnected.value" />
        <div v-else class="text-lg">
          Welcome to your vault!
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { wallet } from '~/composables/useWallet'
import XRPLWalletConnect from '~/components/XRPLWalletConnect.vue'

definePageMeta({
  layout: 'default'
})
</script> 