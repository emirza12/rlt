<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          WSS Connection Test
        </h1>
        <p class="text-lg text-gray-600">
          Testing GemWallet connectivity to {{ gemWallet.LOCAL_NETWORK_URL }}
        </p>
      </div>

      <!-- Connection Status -->
      <BaseCard class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900">Connection Status</h2>
        </template>
        <template #content>
          <div class="space-y-4">
            <!-- Extension Status -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">GemWallet Extension</span>
              <span :class="extensionStatusClass">
                {{ gemWallet.extensionInstalled.value ? '✅ Installed' : '❌ Not Installed' }}
              </span>
            </div>

            <!-- Connection Status -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Wallet Connection</span>
              <span :class="connectionStatusClass">
                {{ gemWallet.isConnected.value ? '✅ Connected' : '❌ Not Connected' }}
              </span>
            </div>

            <!-- Network Status -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Current Network</span>
              <span class="text-gray-700">
                {{ gemWallet.currentNetwork.value || 'Unknown' }}
              </span>
            </div>

            <!-- Address -->
            <div v-if="gemWallet.isConnected.value" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Address</span>
              <span class="text-gray-700 font-mono text-sm">
                {{ gemWallet.shortAddress.value }}
              </span>
            </div>

            <!-- Balance -->
            <div v-if="gemWallet.isConnected.value" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span class="font-medium">Balance</span>
              <span class="text-gray-700 font-semibold">
                {{ gemWallet.balance.value || '0' }} XRP
              </span>
            </div>

            <!-- Error Display -->
            <div v-if="gemWallet.error.value" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">
                <strong>Error:</strong> {{ gemWallet.error.value }}
              </p>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Connection Actions -->
      <BaseCard class="mb-6">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900">Actions</h2>
        </template>
        <template #content>
          <div class="space-y-4">
            <!-- Connect Button -->
            <BaseButton
              v-if="!gemWallet.isConnected.value && gemWallet.extensionInstalled.value"
              @click="connectWallet"
              :disabled="gemWallet.isConnecting.value"
              class="w-full"
            >
              <span v-if="gemWallet.isConnecting.value" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
              <span v-else>Connect GemWallet</span>
            </BaseButton>

            <!-- Refresh Balance Button -->
            <BaseButton
              v-if="gemWallet.isConnected.value"
              @click="refreshBalance"
              :disabled="refreshing"
              variant="secondary"
              class="w-full"
            >
              <span v-if="refreshing" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
              <span v-else>Refresh Balance</span>
            </BaseButton>

            <!-- Disconnect Button -->
            <BaseButton
              v-if="gemWallet.isConnected.value"
              @click="gemWallet.disconnect"
              variant="secondary"
              class="w-full"
            >
              Disconnect
            </BaseButton>
          </div>
        </template>
      </BaseCard>

      <!-- XRP Transaction Test -->
      <div v-if="gemWallet.isConnected.value">
        <XRPTransaction
          title="Test WSS Transaction"
          :show-quick-amounts="true"
          :quick-amounts="[1, 5, 10]"
          @success="onTransactionSuccess"
          @error="onTransactionError"
        />
      </div>

      <!-- Connection Instructions -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900">WSS Setup Instructions</h2>
        </template>
        <template #content>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              To connect GemWallet to your local XRPL WSS endpoint:
            </p>
            <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li v-for="(instruction, index) in setupInstructions" :key="index">
                {{ instruction }}
              </li>
            </ol>

            <!-- Direct certificate link -->
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-blue-700 mb-2">
                <strong>Quick Certificate Fix:</strong>
              </p>
              <a 
                href="https://localhost:6009" 
                target="_blank" 
                class="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Click here to accept the SSL certificate for localhost:6009 →
              </a>
              <p class="text-xs text-blue-600 mt-1">
                (You'll see a security warning - click "Advanced" → "Proceed to localhost")
              </p>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Back Link -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/gemwallet-demo"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          ← Back to GemWallet Demo
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gemWallet } from '~/composables/useGemWallet'
import { useToast } from '~/composables/useToast'

// Page metadata
definePageMeta({
  title: 'WSS Connection Test'
})

const toast = useToast()
const refreshing = ref(false)

// Setup instructions
const setupInstructions = gemWallet.getSetupInstructions()

// Computed properties
const extensionStatusClass = computed(() => {
  return gemWallet.extensionInstalled.value
    ? 'text-green-600 font-semibold'
    : 'text-red-600 font-semibold'
})

const connectionStatusClass = computed(() => {
  return gemWallet.isConnected.value
    ? 'text-green-600 font-semibold'
    : 'text-gray-500'
})

// Methods
const connectWallet = async () => {
  const success = await gemWallet.connect()
  if (success) {
    toast.success('Successfully connected to WSS endpoint!')
  } else {
    toast.error('Failed to connect to WSS endpoint')
  }
}

const refreshBalance = async () => {
  refreshing.value = true
  try {
    await gemWallet.refreshBalance()
    toast.success('Balance refreshed!')
  } catch (error) {
    toast.error('Failed to refresh balance')
  } finally {
    refreshing.value = false
  }
}

const onTransactionSuccess = (hash: string) => {
  toast.success('WSS Transaction successful!')
  console.log('Transaction hash:', hash)
}

const onTransactionError = (error: string) => {
  toast.error('WSS Transaction failed')
  console.error('Transaction error:', error)
}

// Initialize on mount
onMounted(async () => {
  await gemWallet.checkExtension()
  await gemWallet.refreshConnection()
})
</script> 