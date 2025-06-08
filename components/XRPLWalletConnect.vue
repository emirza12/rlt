<!--
XRPL Wallet Connection Component
================================

This component replaces all the "Connect Wallet" buttons throughout the application.
It provides:
- Seed phrase input for connecting existing XRPL wallets
- New wallet generation capability
- Real XRPL client connection to localhost:6009
- Proper error handling and loading states
- Security warnings for seed phrase handling

Usage: Simply replace <BaseButton @click="wallet.connect"> with <XRPLWalletConnect />
-->
<template>
  <div class="space-y-6">
    <!-- Connection Status -->
    <div v-if="wallet.isConnected.value" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800">Wallet Connected</h3>
          <div class="mt-1 text-sm text-green-600">
            <p>Address: {{ shortAddress }}</p>
            <p>Balance: {{ wallet.balance.value }} XRP</p>
          </div>
        </div>
        <button
          @click="wallet.disconnect"
          class="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>

    <!-- Connection Form -->
    <div v-else class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect XRPL Wallet</h3>
      
      <form @submit.prevent="handleConnect" class="space-y-4">
        <!-- Seed Phrase Input -->
        <div>
          <label for="seedPhrase" class="block text-sm font-medium text-gray-700 mb-2">
            Seed Phrase (12 or 24 words)
          </label>
          <textarea
            id="seedPhrase"
            v-model="seedPhrase"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE]"
            placeholder="Enter your seed phrase separated by spaces..."
            :disabled="wallet.isConnecting.value"
            required
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Your seed phrase is used locally and never sent to any server
          </p>
        </div>

        <!-- Alternative: Generate New Wallet -->
        <div class="border-t pt-4">
          <p class="text-sm text-gray-600 mb-3">Don't have a wallet?</p>
          <button
            type="button"
            @click="generateNewWallet"
            :disabled="wallet.isConnecting.value"
            class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Generate New Wallet
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="wallet.error.value" class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-sm text-red-600">{{ wallet.error.value }}</p>
        </div>

        <!-- Connect Button -->
        <button
          type="submit"
          :disabled="wallet.isConnecting.value || !seedPhrase.trim()"
          class="w-full bg-[#00DBCE] text-white py-2 px-4 rounded-md hover:bg-[#00DBCE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="wallet.isConnecting.value" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
          <span v-else>Connect Wallet</span>
        </button>
      </form>

      <!-- Generated Wallet Display -->
      <div v-if="generatedWallet" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 class="text-sm font-semibold text-yellow-800 mb-2">⚠️ New Wallet Generated</h4>
        <div class="space-y-2 text-sm text-yellow-700">
          <p><strong>Address:</strong> {{ generatedWallet.address }}</p>
          <p><strong>Seed:</strong> {{ generatedWallet.seed }}</p>
        </div>
        <p class="text-xs text-yellow-600 mt-2">
          <strong>IMPORTANT:</strong> Save this seed phrase securely. You'll need it to access your wallet.
        </p>
        <button
          @click="useGeneratedWallet"
          class="mt-3 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
        >
          Use This Wallet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { wallet } from '~/composables/useWallet'

const emit = defineEmits<{
  connected: []
}>()

const seedPhrase = ref('')
const generatedWallet = ref<{ address: string, seed: string } | null>(null)

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 8) + '...' + wallet.address.value.slice(-6)
})

const handleConnect = async () => {
  if (!seedPhrase.value.trim()) return
  await wallet.connectFromSeed(seedPhrase.value.trim())
  if (wallet.isConnected.value) {
    seedPhrase.value = ''
    generatedWallet.value = null
    emit('connected')
  }
}

const generateNewWallet = async () => {
  try {
    const newWallet = await wallet.generateWallet()
    generatedWallet.value = newWallet
  } catch (error) {
    console.error('Failed to generate wallet:', error)
  }
}

const useGeneratedWallet = () => {
  if (generatedWallet.value) {
    seedPhrase.value = generatedWallet.value.seed
    generatedWallet.value = null
  }
}
</script> 