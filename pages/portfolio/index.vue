<template>
  <div class="bg-background min-h-screen">
    <!-- Header with wallet info and earnings summary -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-black">Portfolio Dashboard</h1>
          <p class="text-gray-600 mt-1">Track your assets and rewards</p>
        </div>
        
        <div v-if="wallet.isConnected.value" class="flex flex-col items-end">
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">Wallet:</span>
            <span class="font-medium">{{ shortAddress }}</span>
          </div>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-gray-600">Total Earnings:</span>
            <span class="font-medium text-primary">${{ tokenBalances.totalEarnings.toFixed(2) }}</span>
          </div>
        </div>
        
        <BaseButton v-else @click="wallet.connect" :loading="wallet.isConnecting.value">
          Connect Wallet
        </BaseButton>
      </div>
    </div>
    
    <!-- Connect wallet prompt if not connected -->
    <div v-if="!wallet.isConnected.value" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <h2 class="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
      <p class="text-gray-600 mb-6">Connect your wallet to view your portfolio and rewards</p>
      <BaseButton @click="wallet.connect" :loading="wallet.isConnecting.value" size="lg">
        Connect Wallet
      </BaseButton>
    </div>
    
    <div v-else>
      <!-- Loading state -->
      <div v-if="tokenBalances.isLoading" class="py-12 text-center">
        <div class="flex justify-center">
          <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      
      <!-- Tokens Grid -->
      <div v-else>
        <h2 class="text-xl font-semibold mb-4">Token Balances</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- RLUSD Token -->
          <TokenBalanceCard title="RLUSD" :balance="tokenBalances.rlusd.balance">
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex justify-between">
                <span class="text-gray-600">Value:</span>
                <span class="font-medium text-black">${{ tokenBalances.rlusd.value.toFixed(2) }}</span>
              </div>
            </div>
          </TokenBalanceCard>
          
          <!-- RLUSD+ Token with APY -->
          <TokenBalanceCard title="RLUSD+" :balance="tokenBalances.rlusdPlus.balance">
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex justify-between">
                <span class="text-gray-600">Value:</span>
                <span class="font-medium text-black">${{ tokenBalances.rlusdPlus.value.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">APY:</span>
                <span class="font-medium text-primary">{{ tokenBalances.rlusdPlus.apy }}%</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Rewards/day:</span>
                <span class="font-medium text-primary">+{{ tokenBalances.rlusdPlus.rewardsPerDay.toFixed(4) }}</span>
              </div>
            </div>
          </TokenBalanceCard>
          
          <!-- Vault Share Token -->
          <TokenBalanceCard title="Vault Share (MPToken)" :balance="tokenBalances.vaultShare.balance">
            <div class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex justify-between">
                <span class="text-gray-600">Value:</span>
                <span class="font-medium text-black">${{ tokenBalances.vaultShare.value.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Share %:</span>
                <span class="font-medium text-black">{{ tokenBalances.vaultShare.sharePercentage }}%</span>
              </div>
            </div>
          </TokenBalanceCard>
        </div>
        
        <!-- Rewards Section -->
        <h2 class="text-xl font-semibold mb-4">Rewards</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- XRPL Rewards -->
          <BaseCard>
            <div class="space-y-3">
              <h3 class="text-lg font-semibold">XRPL Rewards</h3>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Earned:</span>
                <span class="font-medium text-primary">{{ tokenBalances.rewards.xrpl.toFixed(4) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">This Month:</span>
                <span class="font-medium text-black">{{ tokenBalances.rewards.xrplThisMonth.toFixed(4) }}</span>
              </div>
            </div>
          </BaseCard>
          
          <!-- Boost Points -->
          <BaseCard>
            <div class="space-y-3">
              <h3 class="text-lg font-semibold">Boost Points</h3>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Available:</span>
                <span class="font-medium text-primary">{{ tokenBalances.rewards.boostPoints }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Multiplier:</span>
                <span class="font-medium text-black">{{ tokenBalances.rewards.boostMultiplier }}x</span>
              </div>
            </div>
          </BaseCard>
          
          <!-- Airdrop Score -->
          <BaseCard>
            <div class="space-y-3">
              <h3 class="text-lg font-semibold">Airdrop Score</h3>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Score:</span>
                <span class="font-medium text-primary">{{ tokenBalances.rewards.airdropScore }}/100</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Next Airdrop:</span>
                <span class="font-medium text-black">{{ tokenBalances.rewards.nextAirdrop }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
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