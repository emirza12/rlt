<template>
  <div class="bg-[#f4f4f4] min-h-screen py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-8 shadow-sm mb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-black">Vault Position</h1>
            <p class="text-black/60 mt-1">Your RLUSD deposits and RLT tokens</p>
          </div>
          
          <div v-if="wallet.isConnected.value" class="flex flex-col items-end">
            <div class="flex items-center space-x-2">
              <span class="text-black/60">Wallet:</span>
              <span class="font-medium text-[#00DBCE]">{{ shortAddress }}</span>
            </div>
          </div>
          
          <BaseButton v-else @click="wallet.connect" :loading="wallet.isConnecting.value">
            Connect Wallet
          </BaseButton>
        </div>
      </div>

      <!-- Connect wallet prompt if not connected -->
      <div v-if="!wallet.isConnected.value" class="bg-white rounded-2xl p-8 text-center">
        <h2 class="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
        <p class="text-black/60 mb-6">Connect your wallet to view your vault position</p>
        <BaseButton @click="wallet.connect" :loading="wallet.isConnecting.value" size="lg">
          Connect Wallet
        </BaseButton>
      </div>

      <!-- Vault Position -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- RLUSD Deposit -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-semibold mb-4">RLUSD Deposit</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-black/60">Initial Deposit</span>
              <span class="text-xl font-medium">{{ tokenBalances.initialDeposit }} RLUSD</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-black/60">Current Value</span>
              <span class="text-xl font-medium">{{ tokenBalances.currentValue }} RLUSD</span>
            </div>
          </div>
        </div>

        <!-- RLT Tokens -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-semibold mb-4">RLT Tokens</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-black/60">Initial RLT</span>
              <span class="text-xl font-medium">{{ tokenBalances.initialRLT }} RLT</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-black/60">Current RLT</span>
              <span class="text-xl font-medium">{{ tokenBalances.currentRLT }} RLT</span>
            </div>
          </div>
        </div>

        <!-- Yield Information -->
        <div class="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
          <h2 class="text-xl font-semibold mb-4">Rendement</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <span class="text-black/60">APY Actuel</span>
              <div class="text-2xl font-bold text-[#00DBCE]">{{ tokenBalances.currentAPY }}%</div>
            </div>
            <div class="space-y-2">
              <span class="text-black/60">Rendement Total</span>
              <div class="text-2xl font-bold text-[#00DBCE]">+{{ tokenBalances.totalYield }} RLUSD</div>
            </div>
            <div class="space-y-2">
              <span class="text-black/60">Rendement Journalier</span>
              <div class="text-2xl font-bold text-[#00DBCE]">+{{ tokenBalances.dailyYield }} RLUSD</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Withdraw Button -->
      <div v-if="wallet.isConnected.value" class="mt-8 flex justify-center">
        <button 
          @click="handleWithdraw"
          class="bg-[#00DBCE] text-white px-8 py-3 rounded-lg hover:bg-[#00DBCE]/90 transition-colors font-medium"
        >
          Withdraw RLUSD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { wallet } from '~/composables/useWallet'
import { useTokenBalances } from '~/composables/useTokenBalances'

definePageMeta({
  layout: 'default'
})

const tokenBalances = useTokenBalances()

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 6) + '...' + wallet.address.value.slice(-4)
})

const handleWithdraw = () => {
  // TODO: Implement withdraw logic
  console.log('Withdrawing funds...')
}

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