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
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="tokenBalances.isLoading.value" class="bg-white rounded-2xl p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00DBCE] mx-auto mb-4"></div>
        <p class="text-black/60">Loading vault position from XRP Ledger...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="tokenBalances.error.value" class="bg-white rounded-2xl p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Error Loading Data</h3>
        <p class="text-black/60 mb-4">{{ tokenBalances.error.value }}</p>
        <button 
          @click="tokenBalances.fetchBalances"
          class="bg-[#00DBCE] text-white px-4 py-2 rounded-lg hover:bg-[#00DBCE]/90 transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Connect wallet prompt if not connected -->
      <div v-else-if="!wallet.isConnected.value" class="bg-white rounded-2xl p-8 text-center">
        <h2 class="text-2xl font-semibold mb-4">Connect Your XRPL Wallet</h2>
        <p class="text-black/60 mb-6">Connect your XRPL wallet to view your vault position</p>
        <XRPLWalletConnect />
      </div>

      <!-- Vault Position -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- RLUSD Deposit -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-semibold mb-4">RLUSD Deposit</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-black/60">Initial Deposit</span>
              <span class="text-xl font-medium">{{ tokenBalances.initialDeposit.value }} RLUSD</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-black/60">Current Value</span>
              <span class="text-xl font-medium">{{ tokenBalances.currentValue.value }} RLUSD</span>
            </div>
          </div>
        </div>

        <!-- RLT Tokens -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="text-xl font-semibold mb-4">RLT Tokens</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-black/60">Initial RLT</span>
              <span class="text-xl font-medium">{{ tokenBalances.initialRLT.value }} RLT</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-black/60">Current RLT</span>
              <span class="text-xl font-medium">{{ tokenBalances.currentRLT.value }} RLT</span>
            </div>
          </div>
        </div>

        <!-- Yield Information -->
        <div class="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
          <h2 class="text-xl font-semibold mb-4">Rendement</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <span class="text-black/60">APY Actuel</span>
              <div class="text-2xl font-bold text-[#00DBCE]">{{ tokenBalances.currentAPY.value }}%</div>
            </div>
            <div class="space-y-2">
              <span class="text-black/60">Rendement Total</span>
              <div class="text-2xl font-bold text-[#00DBCE]">+{{ tokenBalances.totalYield.value }} RLUSD</div>
            </div>
            <div class="space-y-2">
              <span class="text-black/60">Rendement Journalier</span>
              <div class="text-2xl font-bold text-[#00DBCE]">+{{ tokenBalances.dailyYield.value }} RLUSD</div>
            </div>
          </div>
        </div>

        <!-- Account Balances -->
        <div class="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
          <h2 class="text-xl font-semibold mb-4">Account Balances</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="token in tokenBalances.tokens.value" :key="token.symbol" class="space-y-2">
              <span class="text-black/60">{{ token.name }}</span>
              <div class="text-lg font-medium">{{ token.balance }} {{ token.symbol }}</div>
              <div class="text-sm text-black/60">≈ ${{ token.value.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Withdraw Section -->
      <div v-if="wallet.isConnected.value && !tokenBalances.isLoading.value && !tokenBalances.error.value" class="mt-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm">
          <h2 class="text-xl font-semibold mb-6 text-black">Withdraw RLUSD</h2>
          
          <form @submit.prevent="handleWithdraw" class="space-y-6">
            <!-- Amount Input -->
            <div>
              <label for="withdrawAmount" class="block text-sm font-medium text-black/80 mb-2">Amount to Withdraw</label>
              <div class="relative">
                <input
                  type="number"
                  id="withdrawAmount"
                  v-model="withdrawAmount"
                  class="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-[#00DBCE] focus:ring-1 focus:ring-[#00DBCE] outline-none transition-all"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  :max="tokenBalances.currentValue.value"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-black/60">RLUSD</div>
              </div>
              <div class="text-sm text-black/60 mt-1">
                Available: {{ tokenBalances.currentValue.value }} RLUSD
              </div>
            </div>

            <!-- Max Button -->
            <div class="flex justify-end">
              <button
                type="button"
                @click="setMaxWithdrawAmount"
                class="text-sm text-[#00DBCE] hover:text-[#00DBCE]/80 transition-colors"
              >
                Withdraw Max Available
              </button>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(tokenBalances.currentValue.value)"
              class="w-full bg-[#00DBCE] text-white py-3 rounded-lg hover:bg-[#00DBCE]/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Withdraw RLUSD
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { wallet } from '~/composables/useWallet'
import { useTokenBalances } from '~/composables/useTokenBalances'
import { toast } from '~/composables/useToast'
import XRPLWalletConnect from '~/components/XRPLWalletConnect.vue'

definePageMeta({
  layout: 'default'
})

const tokenBalances = useTokenBalances()

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 6) + '...' + wallet.address.value.slice(-4)
})

const withdrawAmount = ref('')

const handleWithdraw = async () => {
  if (!wallet.isConnected.value) {
    toast.warning('Please connect your wallet first')
    return
  }

  if (!wallet.address.value) {
    toast.warning('Wallet address not available')
    return
  }

  if (!withdrawAmount.value) {
    toast.warning('Please enter an amount to withdraw')
    return
  }

  const amount = parseFloat(withdrawAmount.value)
  const maxAmount = parseFloat(tokenBalances.currentValue.value)
  
  if (amount <= 0) {
    toast.warning('Please enter a valid amount')
    return
  }
  
  if (amount > maxAmount) {
    toast.warning(`Amount exceeds available balance of ${maxAmount} RLUSD`)
    return
  }

  console.log('Starting withdraw request...')
  console.log('Wallet address:', wallet.address.value)
  console.log('Amount:', withdrawAmount.value)

  try {
    const requestBody = {
      method: 'submit',
      params: [{
        tx_json: {
          TransactionType: 'VaultWithdraw',
          Account: wallet.address.value,
          VaultID: 'B89B9DC7E1474CC0DA17F336877148CEB24C55BA73FA5155C78EF3DE20D4902D',
          Amount: {
            currency: '524C555344000000000000000000000000000000',
            issuer: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
            value: withdrawAmount.value
          }
        },
        secret: 'sEdVErV3Biz5uXBRAyKhL26zqenTHu6'
      }]
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch('http://localhost:5007', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    // With no-cors mode, we can't read the response
    if (response.type === 'opaque') {
      toast.success('Withdraw request sent successfully!')
      withdrawAmount.value = ''
      // Refresh balances after successful withdrawal
      setTimeout(() => {
        tokenBalances.fetchBalances()
      }, 2000) // Wait 2 seconds for transaction to process
    } else {
      const result = await response.json()
      console.log('Withdraw result:', result)
      
      if (response.ok) {
        toast.success('Withdrawal successful!')
        withdrawAmount.value = ''
        // Refresh balances after successful withdrawal
        setTimeout(() => {
          tokenBalances.fetchBalances()
        }, 2000)
      } else {
        toast.error('Withdrawal failed: ' + (result.error || result.message || 'Unknown error'))
      }
    }
  } catch (error) {
    console.error('Withdraw error details:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error('Connection failed: Unable to reach the server at localhost:5007. Please check if the server is running.')
    } else if (error.name === 'NetworkError') {
      toast.error('Network error: Please check your internet connection and server availability.')
    } else {
      toast.error('Error occurred: ' + error.message)
    }
  }
}

const setMaxWithdrawAmount = () => {
  withdrawAmount.value = tokenBalances.currentValue.value
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

watch(() => wallet.address.value, (newAddress, oldAddress) => {
  if (newAddress && newAddress !== oldAddress && wallet.isConnected.value) {
    tokenBalances.fetchBalances()
  }
})
</script> 