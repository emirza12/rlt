<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          GemWallet Local XRPL Demo
        </h1>
        <p class="text-lg text-gray-600">
          Connect to your local XRPL network (wss://localhost:6009) using GemWallet
        </p>
      </div>

      <!-- Connection Status & Button -->
      <div class="mb-8">
        <div v-if="!gemWallet.extensionInstalled.value" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
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

        <!-- Connection Button or Status -->
        <div v-if="gemWallet.extensionInstalled.value && !gemWallet.isConnected.value" class="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect to Local XRPL with GemWallet</h3>
          
          <div v-if="gemWallet.error.value" class="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p class="text-sm text-red-600">{{ gemWallet.error.value }}</p>
          </div>

          <button
            @click="connectWallet"
            :disabled="gemWallet.isConnecting.value"
            class="w-full bg-[#00DBCE] text-white py-3 px-4 rounded-md hover:bg-[#00DBCE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="gemWallet.isConnecting.value" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
            <span v-else>Connect GemWallet</span>
          </button>
        </div>

        <!-- Connected Status -->
        <div v-if="gemWallet.isConnected.value" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-medium text-green-800">GemWallet Connected</h3>
                <div class="mt-1 text-sm text-green-600">
                  <p>Address: {{ gemWallet.shortAddress.value }}</p>
                  <p>Network: {{ gemWallet.currentNetwork.value }}</p>
                  <p>Balance: {{ gemWallet.balance.value || '0' }} XRP</p>
                </div>
              </div>
            </div>
            <button
              @click="gemWallet.disconnect"
              class="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Demo Actions (shown when wallet is connected) -->
      <div v-if="gemWallet.isConnected.value" class="space-y-6">
        <!-- Send XRP Test -->
        <BaseCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">Envoyer XRP (Test Réseau Local)</h2>
          </template>
          <template #content>
            <form @submit.prevent="sendXRP" class="space-y-4">
              <!-- Adresse de destination -->
              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700">
                  Adresse de destination
                </label>
                <input
                  id="destination"
                  v-model="xrpForm.destination"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE] sm:text-sm"
                  placeholder="rAddress..."
                  required
                />
                <p v-if="xrpForm.destinationError" class="mt-1 text-sm text-red-600">
                  {{ xrpForm.destinationError }}
                </p>
              </div>

              <!-- Montant XRP -->
              <div>
                <label for="amount" class="block text-sm font-medium text-gray-700">
                  Montant (XRP)
                </label>
                <input
                  id="amount"
                  v-model="xrpForm.amount"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE] sm:text-sm"
                  placeholder="1.0"
                  required
                />
                <p v-if="xrpForm.amountError" class="mt-1 text-sm text-red-600">
                  {{ xrpForm.amountError }}
                </p>
              </div>

              <!-- Montants rapides -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Montants rapides
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="quickAmount in [1, 5, 10, 25, 50, 100]"
                    :key="quickAmount"
                    type="button"
                    @click="setQuickAmount(quickAmount)"
                    class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00DBCE] focus:ring-offset-2"
                  >
                    {{ quickAmount }} XRP
                  </button>
                </div>
              </div>

              <!-- Solde actuel -->
              <div class="bg-gray-50 p-3 rounded-md">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">Solde actuel:</span>
                  <span class="font-medium text-gray-900">
                    {{ gemWallet.balance.value || '0' }} XRP
                  </span>
                </div>
              </div>

              <!-- Messages d'erreur -->
              <div v-if="xrpForm.error" class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-600">{{ xrpForm.error }}</p>
              </div>

              <!-- Message de succès -->
              <div v-if="xrpForm.transactionHash" class="bg-green-50 border border-green-200 rounded-md p-3">
                <p class="text-sm text-green-600">
                  <strong>Transaction réussie!</strong><br>
                  Hash: <span class="font-mono break-all">{{ xrpForm.transactionHash }}</span>
                </p>
              </div>

              <!-- Bouton d'envoi -->
              <BaseButton
                type="submit"
                :disabled="xrpForm.loading || !isXRPFormValid"
                class="w-full"
              >
                <span v-if="xrpForm.loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
                <span v-else>Envoyer XRP</span>
              </BaseButton>

              <!-- Bouton Reset -->
              <button
                v-if="xrpForm.transactionHash || xrpForm.error"
                type="button"
                @click="resetXRPForm"
                class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00DBCE] focus:ring-offset-2"
              >
                Nouvelle transaction
              </button>
            </form>
          </template>
        </BaseCard>

        <!-- Message Signing Test -->
        <BaseCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">Message Signing Test</h2>
          </template>
          <template #content>
            <form @submit.prevent="signTestMessage" class="space-y-4">
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700">
                  Message to Sign
                </label>
                <textarea
                  id="message"
                  v-model="messageForm.message"
                  rows="3"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE]"
                  placeholder="Enter a message to sign..."
                  required
                ></textarea>
              </div>

              <div v-if="messageError" class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-600">{{ messageError }}</p>
              </div>

              <div v-if="signedMessage" class="bg-green-50 border border-green-200 rounded-md p-3">
                <p class="text-sm text-green-600">
                  <strong>Message Signed!</strong><br>
                  <span class="font-mono break-all">{{ signedMessage }}</span>
                </p>
              </div>

              <BaseButton
                type="submit"
                :disabled="messageLoading"
                class="w-full"
              >
                <span v-if="messageLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing...
                </span>
                <span v-else>Sign Message</span>
              </BaseButton>
            </form>
          </template>
        </BaseCard>

        <!-- Setup Instructions -->
        <BaseCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">Local Development Setup</h2>
          </template>
          <template #content>
            <div class="space-y-4">
              <p class="text-sm text-gray-600">
                To use GemWallet with your local XRPL network, follow these steps:
              </p>
              <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li v-for="(instruction, index) in setupInstructions" :key="index">
                  {{ instruction }}
                </li>
              </ol>
            </div>
          </template>
        </BaseCard>
      </div>

      <!-- Back to Home -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { gemWallet } from '~/composables/useGemWallet'
import { useToast } from '~/composables/useToast'

// Page metadata
definePageMeta({
  title: 'GemWallet Local XRPL Demo'
})

const toast = useToast()

// Transaction handlers
const onTransactionSuccess = (hash: string) => {
  console.log('Transaction successful:', hash)
  toast.success('Transaction XRP réussie!')
}

const onTransactionError = (error: string) => {
  console.error('Transaction error:', error)
  toast.error('Transaction échouée: ' + error)
}

// XRP Transfer form
const xrpForm = reactive({
  destination: '',
  amount: '',
  destinationError: '',
  amountError: '',
  loading: false,
  error: '',
  transactionHash: ''
})

// Message signing form
const messageForm = reactive({
  message: 'Hello from Local XRPL with GemWallet!'
})

const messageLoading = ref(false)
const messageError = ref('')
const signedMessage = ref('')

// Setup instructions
const setupInstructions = gemWallet.getSetupInstructions()

// Computed properties for XRP form validation
const isXRPFormValid = computed(() => {
  validateXRPForm()
  return xrpForm.destination && 
         xrpForm.amount && 
         !xrpForm.destinationError && 
         !xrpForm.amountError &&
         gemWallet.isConnected.value
})

// Methods
const validateXRPForm = () => {
  // Validate destination
  if (!xrpForm.destination) {
    xrpForm.destinationError = ''
  } else if (!xrpForm.destination.startsWith('r')) {
    xrpForm.destinationError = 'L\'adresse doit commencer par "r"'
  } else if (xrpForm.destination.length < 25 || xrpForm.destination.length > 35) {
    xrpForm.destinationError = 'Longueur d\'adresse invalide'
  } else {
    xrpForm.destinationError = ''
  }
  
  // Validate amount
  if (!xrpForm.amount) {
    xrpForm.amountError = ''
  } else {
    const amount = parseFloat(xrpForm.amount)
    if (isNaN(amount) || amount <= 0) {
      xrpForm.amountError = 'Le montant doit être supérieur à 0'
    } else if (amount < 0.000001) {
      xrpForm.amountError = 'Le montant minimum est 0.000001 XRP'
    } else {
      const currentBalance = parseFloat(gemWallet.balance.value || '0')
      if (amount > currentBalance) {
        xrpForm.amountError = 'Solde insuffisant'
      } else {
        xrpForm.amountError = ''
      }
    }
  }
}

const setQuickAmount = (amount: number) => {
  xrpForm.amount = amount.toString()
}

const resetXRPForm = () => {
  xrpForm.destination = ''
  xrpForm.amount = ''
  xrpForm.destinationError = ''
  xrpForm.amountError = ''
  xrpForm.error = ''
  xrpForm.transactionHash = ''
}

const sendXRP = async () => {
  validateXRPForm()
  
  if (!isXRPFormValid.value) {
    return
  }

  xrpForm.loading = true
  xrpForm.error = ''
  xrpForm.transactionHash = ''

  try {
    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    const amountInDrops = (parseFloat(xrpForm.amount) * 1000000).toString()
    
    const hash = await gemWallet.sendXRP(
      xrpForm.destination,
      amountInDrops
    )

    if (hash) {
      xrpForm.transactionHash = hash
      toast.success('Transaction XRP réussie!')
      
      // Reset form after success
      setTimeout(() => {
        resetXRPForm()
      }, 5000)
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Échec de la transaction'
    xrpForm.error = errorMessage
    toast.error('Transaction échouée: ' + errorMessage)
  } finally {
    xrpForm.loading = false
  }
}

const connectWallet = async () => {
  const success = await gemWallet.connect()
  if (success) {
    toast.success('GemWallet connected successfully!')
  }
}

const signTestMessage = async () => {
  messageLoading.value = true
  messageError.value = ''
  signedMessage.value = ''

  try {
    const signature = await gemWallet.signMessageData(messageForm.message)
    
    if (signature) {
      signedMessage.value = signature
      toast.success('Message signed successfully!')
    }
  } catch (error: any) {
    messageError.value = error.message || 'Failed to sign message'
    toast.error('Message signing failed: ' + messageError.value)
  } finally {
    messageLoading.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  await gemWallet.checkExtension()
  await gemWallet.refreshConnection()
})
</script> 