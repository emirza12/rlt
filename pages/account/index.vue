<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Account</h1>
    
    <BaseCard title="Your Account">
      <div class="text-center py-8">
        <p class="text-gray-600 mb-4">Connect your XRPL wallet to view your account details</p>
        <XRPLWalletConnect v-if="!wallet.isConnected.value" />
        <div v-else class="text-lg">
          Account details coming soon...
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