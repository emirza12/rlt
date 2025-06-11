<!--
GemWallet XRPL Connection Component for Local Development
========================================================

This component provides GemWallet integration for XRPL local development with:
- Custom local XRPL network configuration (wss://localhost:6009)
- Self-signed certificate support for local rippled Docker
- GemWallet browser extension integration
- Network detection and automatic configuration
- Proper error handling for local development scenarios

Note: This requires the GemWallet browser extension to be installed
and configured for local development with custom network settings.
-->
<template>
  <div class="space-y-6">
    <!-- GemWallet Extension Status -->
    <div v-if="!extensionInstalled" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-yellow-800">GemWallet Extension Required</h3>
          <p class="mt-1 text-sm text-yellow-600">
            Please install the GemWallet browser extension to connect to your local XRPL network.
          </p>
          <a 
            href="https://gemwallet.app/" 
            target="_blank" 
            class="mt-2 inline-block text-sm text-yellow-700 underline hover:text-yellow-800"
          >
            Download GemWallet Extension →
          </a>
        </div>
      </div>
    </div>

    <!-- Network Configuration Warning -->
    <div v-if="extensionInstalled && !networkConfigured" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-orange-800">Local Network Configuration Required</h3>
          <p class="mt-1 text-sm text-orange-600">
            Please configure GemWallet to use your local XRPL network (wss://localhost:6009).
          </p>
          <div class="mt-2 text-xs text-orange-600">
            <p><strong>Network Name:</strong> Local Development</p>
            <p><strong>WebSocket URL:</strong> wss://localhost:6009</p>
            <p><strong>Note:</strong> Self-signed certificates from rippled Docker are supported</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div v-if="isConnected" class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-green-800">GemWallet Connected</h3>
          <div class="mt-1 text-sm text-green-600">
            <p>Address: {{ shortAddress }}</p>
            <p>Network: {{ currentNetwork }}</p>
            <p v-if="balance !== null">Balance: {{ balance }} XRP</p>
            <p v-else class="text-gray-500">Balance: Loading...</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            @click="refreshBalance"
            :disabled="refreshingBalance"
            class="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
            title="Refresh Balance"
          >
            <svg v-if="refreshingBalance" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          <button
            @click="disconnect"
            class="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>

    <!-- Connection Form -->
    <div v-if="extensionInstalled && !isConnected" class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect to Local XRPL with GemWallet</h3>
      
      <div class="space-y-4">
        <!-- Network Status -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <p class="text-sm font-medium text-gray-700">Target Network</p>
            <p class="text-xs text-gray-500">wss://localhost:6009 (Local Development)</p>
          </div>
          <div class="flex items-center">
            <div :class="[
              'w-2 h-2 rounded-full mr-2',
              networkConfigured ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
            <span class="text-xs text-gray-600">
              {{ networkConfigured ? 'Ready' : 'Not Configured' }}
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Connect Button -->
        <button
          @click="connectWallet"
          :disabled="connecting || !extensionInstalled"
          class="w-full bg-[#00DBCE] text-white py-3 px-4 rounded-md hover:bg-[#00DBCE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span v-if="connecting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
          <span v-else>Connect GemWallet</span>
        </button>

        <!-- Help Text -->
        <div class="text-xs text-gray-500 space-y-1">
          <p><strong>Setup Instructions:</strong></p>
          <ol class="list-decimal list-inside space-y-1 ml-2">
            <li>Install GemWallet browser extension</li>
            <li>Open GemWallet settings</li>
            <li>Add custom network: wss://localhost:6009</li>
            <li>Accept self-signed certificate warnings</li>
            <li>Switch to the local network</li>
            <li>Click "Connect GemWallet" above</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Certificate Instructions -->
    <div v-if="extensionInstalled" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 class="text-sm font-medium text-blue-800">Self-Signed Certificate Setup</h4>
          <div class="mt-1 text-sm text-blue-600">
            <p>Your local rippled Docker uses self-signed certificates. To accept them:</p>
            <ol class="mt-2 list-decimal list-inside space-y-1">
              <li>Navigate to <code class="bg-blue-100 px-1 rounded">https://localhost:6009</code> in your browser</li>
              <li>Click "Advanced" when you see the security warning</li>
              <li>Click "Proceed to localhost (unsafe)" to accept the certificate</li>
              <li>This allows GemWallet to connect to your local network</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { isInstalled, getAddress, getNetwork } from '@gemwallet/api'
import { gemWallet } from '~/composables/useGemWallet'

const emit = defineEmits<{
  connected: [address: string]
}>()

// State
const extensionInstalled = ref(false)
const isConnected = ref(false)
const connecting = ref(false)
const address = ref('')
const currentNetwork = ref('')
const balance = ref<string | null>(null)
const error = ref('')
const networkConfigured = ref(false)
const refreshingBalance = ref(false)

// Computed
const shortAddress = computed(() => {
  if (!address.value) return ''
  return address.value.slice(0, 8) + '...' + address.value.slice(-6)
})

// Methods
const checkExtension = async () => {
  try {
    const response = await isInstalled()
    extensionInstalled.value = response.result.isInstalled
    
    if (extensionInstalled.value) {
      await checkNetwork()
      await checkConnection()
    }
  } catch (err) {
    console.warn('Failed to check GemWallet installation:', err)
    extensionInstalled.value = false
  }
}

const checkNetwork = async () => {
  try {
    const response = await getNetwork()
    if (response.type === 'response' && response.result) {
      currentNetwork.value = response.result.network
      // Check if connected to local network
      // GemWallet might show the local network with a different name
      networkConfigured.value = currentNetwork.value.toLowerCase().includes('local') || 
                                currentNetwork.value.toLowerCase().includes('dev') ||
                                currentNetwork.value.toLowerCase().includes('custom')
    }
  } catch (err) {
    console.warn('Failed to check network:', err)
    networkConfigured.value = false
  }
}

const checkConnection = async () => {
  try {
    const response = await getAddress()
    if (response.type === 'response' && response.result) {
      address.value = response.result.address
      isConnected.value = true
      emit('connected', address.value)
      // Get balance using gemWallet composable
      await refreshBalance()
    }
  } catch (err) {
    // Not connected or user rejected
    isConnected.value = false
    address.value = ''
    balance.value = null
  }
}

const connectWallet = async () => {
  if (!extensionInstalled.value) {
    error.value = 'GemWallet extension is not installed'
    return
  }

  connecting.value = true
  error.value = ''

  try {
    // Try to get the wallet address (this will prompt the user to connect)
    const response = await getAddress()
    
    if (response.type === 'response' && response.result) {
      address.value = response.result.address
      isConnected.value = true
      
      // Check network after connection
      await checkNetwork()
      
      emit('connected', address.value)
      
      // Get balance using gemWallet composable
      await refreshBalance()
      
      // Show warning if not on expected local network
      if (!networkConfigured.value) {
        error.value = 'Warning: GemWallet is not configured for your local XRPL network (wss://localhost:6009). Please check your network settings.'
      }
    } else {
      error.value = 'Connection was rejected by the user'
    }
  } catch (err: any) {
    console.error('Failed to connect GemWallet:', err)
    error.value = err.message || 'Failed to connect to GemWallet'
  } finally {
    connecting.value = false
  }
}

const disconnect = () => {
  isConnected.value = false
  address.value = ''
  currentNetwork.value = ''
  balance.value = null
  error.value = ''
  // Note: GemWallet doesn't have a programmatic disconnect method
  // Users need to disconnect from the extension itself
}

const refreshBalance = async () => {
  if (!address.value) {
    return
  }

  refreshingBalance.value = true
  
  try {
    // Use the gemWallet composable to fetch balance
    const fetchedBalance = await gemWallet.fetchBalance(address.value)
    balance.value = fetchedBalance
  } catch (err: any) {
    console.error('Failed to refresh balance:', err)
    error.value = err.message || 'Failed to refresh balance'
  } finally {
    refreshingBalance.value = false
  }
}

// Lifecycle
onMounted(() => {
  checkExtension()
  
  // Listen for GemWallet events if available
  if (typeof window !== 'undefined' && window.addEventListener) {
    // GemWallet events (if supported in future versions)
    window.addEventListener('gemwallet:accountChanged', () => {
      checkConnection()
    })
    
    window.addEventListener('gemwallet:networkChanged', () => {
      checkNetwork()
    })
  }
})
</script> 