<template>
  <BaseCard>
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ title || 'Envoyer XRP' }}
      </h3>
    </template>
    <template #content>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Destination Address -->
        <div>
          <label for="destination" class="block text-sm font-medium text-gray-700">
            Adresse de destination
          </label>
          <input
            id="destination"
            v-model="form.destination"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE] sm:text-sm"
            placeholder="rAddress..."
            required
          />
          <p v-if="destinationError" class="mt-1 text-sm text-red-600">
            {{ destinationError }}
          </p>
        </div>
        
        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700">
            Montant (XRP)
          </label>
          <input
            id="amount"
            v-model="form.amount"
            type="number"
            step="0.000001"
            min="0.000001"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE] sm:text-sm"
            placeholder="1.0"
            required
          />
          <p v-if="amountError" class="mt-1 text-sm text-red-600">
            {{ amountError }}
          </p>
        </div>
        
        <!-- Destination Tag (Optional) -->
        <div>
          <label for="destinationTag" class="block text-sm font-medium text-gray-700">
            Tag de destination (Optionnel)
          </label>
          <input
            id="destinationTag"
            v-model="form.destinationTag"
            type="number"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00DBCE] focus:border-[#00DBCE] sm:text-sm"
            placeholder="12345"
          />
        </div>

        <!-- Quick Amount Buttons -->
        <div v-if="showQuickAmounts" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Montants rapides
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="quickAmount in quickAmounts"
              :key="quickAmount"
              type="button"
              @click="setQuickAmount(quickAmount)"
              class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00DBCE] focus:ring-offset-2"
            >
              {{ quickAmount }} XRP
            </button>
          </div>
        </div>

        <!-- Balance Info -->
        <div v-if="gemWallet.isConnected.value" class="bg-gray-50 p-3 rounded-md">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600">Solde actuel:</span>
            <span class="font-medium text-gray-900">
              {{ gemWallet.balance.value || '0' }} XRP
            </span>
          </div>
          <div v-if="form.amount && parseFloat(form.amount) > 0" class="flex justify-between items-center text-sm mt-1">
            <span class="text-gray-600">Après transaction:</span>
            <span class="font-medium" :class="remainingBalance >= 0 ? 'text-gray-900' : 'text-red-600'">
              {{ remainingBalance.toFixed(6) }} XRP
            </span>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Success Display -->
        <div v-if="transactionHash" class="bg-green-50 border border-green-200 rounded-md p-3">
          <p class="text-sm text-green-600">
            <strong>Transaction réussie!</strong><br>
            Hash: <span class="font-mono break-all">{{ transactionHash }}</span>
          </p>
          <button
            v-if="explorerUrl"
            type="button"
            @click="openExplorer"
            class="mt-2 text-xs text-green-700 hover:text-green-800 underline"
          >
            Voir sur l'explorateur →
          </button>
        </div>

        <!-- Submit Button -->
        <BaseButton
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full"
          :class="{ 'opacity-50': !isFormValid }"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Envoi en cours...
          </span>
          <span v-else>
            {{ submitButtonText || 'Envoyer XRP' }}
          </span>
        </BaseButton>

        <!-- Reset Button -->
        <button
          v-if="transactionHash || error"
          type="button"
          @click="resetForm"
          class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00DBCE] focus:ring-offset-2"
        >
          Nouvelle transaction
        </button>
      </form>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { gemWallet } from '~/composables/useGemWallet'
import { useToast } from '~/composables/useToast'

// Props
interface Props {
  title?: string
  submitButtonText?: string
  showQuickAmounts?: boolean
  quickAmounts?: number[]
  explorerUrl?: string
  autoReset?: boolean
  onSuccess?: (hash: string) => void
  onError?: (error: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  showQuickAmounts: true,
  quickAmounts: () => [1, 5, 10, 25, 50],
  autoReset: true
})

// Emits
const emit = defineEmits<{
  success: [hash: string]
  error: [error: string]
  start: []
  complete: []
}>()

const toast = useToast()

// Form state
const form = reactive({
  destination: '',
  amount: '',
  destinationTag: ''
})

const isLoading = ref(false)
const error = ref('')
const transactionHash = ref('')

// Validation
const destinationError = computed(() => {
  if (!form.destination) return ''
  if (!form.destination.startsWith('r')) {
    return 'L\'adresse doit commencer par "r"'
  }
  if (form.destination.length < 25 || form.destination.length > 35) {
    return 'Longueur d\'adresse invalide'
  }
  return ''
})

const amountError = computed(() => {
  if (!form.amount) return ''
  const amount = parseFloat(form.amount)
  if (isNaN(amount) || amount <= 0) {
    return 'Le montant doit être supérieur à 0'
  }
  if (amount < 0.000001) {
    return 'Le montant minimum est 0.000001 XRP'
  }
  const currentBalance = parseFloat(gemWallet.balance.value || '0')
  if (amount > currentBalance) {
    return 'Solde insuffisant'
  }
  return ''
})

const isFormValid = computed(() => {
  return form.destination && 
         form.amount && 
         !destinationError.value && 
         !amountError.value &&
         gemWallet.isConnected.value
})

const remainingBalance = computed(() => {
  const currentBalance = parseFloat(gemWallet.balance.value || '0')
  const amount = parseFloat(form.amount || '0')
  return currentBalance - amount
})

// Methods
const setQuickAmount = (amount: number) => {
  form.amount = amount.toString()
}

const resetForm = () => {
  form.destination = ''
  form.amount = ''
  form.destinationTag = ''
  error.value = ''
  transactionHash.value = ''
}

const openExplorer = () => {
  if (props.explorerUrl && transactionHash.value) {
    window.open(`${props.explorerUrl}/tx/${transactionHash.value}`, '_blank')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''
  transactionHash.value = ''

  emit('start')

  try {
    // Convert XRP to drops (1 XRP = 1,000,000 drops)
    const amountInDrops = (parseFloat(form.amount) * 1000000).toString()
    
    const hash = await gemWallet.sendXRP(
      form.destination,
      amountInDrops,
      form.destinationTag ? parseInt(form.destinationTag) : undefined
    )

    if (hash) {
      transactionHash.value = hash
      toast.success('Transaction XRP réussie!')
      
      emit('success', hash)
      if (props.onSuccess) {
        props.onSuccess(hash)
      }
      
      if (props.autoReset) {
        setTimeout(() => {
          resetForm()
        }, 5000)
      }
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Échec de la transaction'
    error.value = errorMessage
    toast.error('Transaction échouée: ' + errorMessage)
    
    emit('error', errorMessage)
    if (props.onError) {
      props.onError(errorMessage)
    }
  } finally {
    isLoading.value = false
    emit('complete')
  }
}

// Watch for wallet connection changes
watch(() => gemWallet.isConnected.value, (connected) => {
  if (!connected) {
    resetForm()
  }
})
</script> 