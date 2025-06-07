<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Portfolio</h1>
    
    <BaseCard class="mb-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Total Portfolio Value</h2>
        <div class="text-2xl font-bold">${{ tokenBalances.totalValue.toFixed(2) }}</div>
      </div>
    </BaseCard>
    
    <BaseCard title="Assets">
      <div v-if="!wallet.isConnected" class="text-center py-6">
        <p class="text-gray-500 mb-4">Connect your wallet to view your assets</p>
        <BaseButton @click="wallet.connect" :loading="wallet.isConnecting">Connect Wallet</BaseButton>
      </div>
      
      <div v-else-if="tokenBalances.isLoading" class="py-6 text-center">
        <div class="flex justify-center">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="tokenBalances.tokens.length === 0">
                <td class="px-6 py-4 text-center text-gray-500" colspan="4">
                  No assets to display.
                </td>
              </tr>
              <tr v-for="token in tokenBalances.tokens" :key="token.symbol" class="hover:bg-background/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-background rounded-full flex items-center justify-center mr-3">
                      {{ token.symbol.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-medium">{{ token.name }}</div>
                      <div class="text-sm text-gray-500">{{ token.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ token.balance }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ token.value.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <BaseButton variant="outline" size="sm">Send</BaseButton>
                    <BaseButton variant="outline" size="sm">Receive</BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { wallet } from '~/composables/useWallet'
import { useTokenBalances } from '~/composables/useTokenBalances'

definePageMeta({
  layout: 'default'
})

const tokenBalances = useTokenBalances()

// Fetch token balances when component is mounted or wallet connection changes
onMounted(() => {
  if (wallet.isConnected.value) {
    tokenBalances.fetchBalances()
  }
})

watch(() => wallet.isConnected.value, (isConnected) => {
  if (isConnected) {
    tokenBalances.fetchBalances()
  }
})
</script> 