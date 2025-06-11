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
          <h2 class="text-xl font-semibold mb-6 text-black">Withdraw RLUSD+ + Rendement</h2>
          
          <form @submit.prevent="handleWithdraw" class="space-y-6">
            <!-- Yield Information -->
            <div class="bg-[#f8f9fa] rounded-lg p-4 mb-4">
              <h3 class="font-medium mb-2">Yield to Receive</h3>
              <div class="text-lg font-bold text-[#00DBCE]">+{{ FIXED_YIELD }} RLUSD+</div>
              <div class="text-sm text-black/60 mt-1">Fixed yield per withdrawal</div>
            </div>

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
                  :max="tokenBalances.currentRLT.value"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 text-black/60">RLUSD+</div>
              </div>
              <div class="text-sm text-black/60 mt-1">
                Available: {{ tokenBalances.currentRLT.value }} RLUSD+
              </div>
            </div>

            <!-- Total withdrawal summary -->
            <div v-if="withdrawAmount" class="bg-[#e8f8f7] rounded-lg p-4">
              <h3 class="font-medium mb-2">Withdrawal Summary</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span>Requested Amount:</span>
                  <span>{{ withdrawAmount }} RLUSD+</span>
                </div>
                <div class="flex justify-between">
                  <span>Fixed Yield:</span>
                  <span class="text-[#00DBCE]">+{{ FIXED_YIELD }} RLUSD+</span>
                </div>
                <div class="flex justify-between font-bold border-t pt-1">
                  <span>Total to Receive:</span>
                  <span>{{ (parseFloat(withdrawAmount) + FIXED_YIELD).toFixed(2) }} RLUSD+</span>
                </div>
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
              :disabled="!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(tokenBalances.currentRLT.value)"
              class="w-full bg-[#00DBCE] text-white py-3 rounded-lg hover:bg-[#00DBCE]/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Withdraw with Yield
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

// Configuration fixe
const FIXED_YIELD = 10 // Rendement fixe de 10 RLUSD par retrait
const VAULT_ID = '7FAA845867B900A4585A4B51D3D732F733674AF77619D0EFC36D08906A5BED45'
const RLUSD_ISSUER = 'rMWoqF5yBRQSLchYHTPiHfHLUfuP222r9y'
const GENESIS_SECRET = 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb'
const GENESIS_ADDRESS = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
const USER_SECRET = 'sEd7yWVnEMasR5ATJDR8R34cVoEumi3'
const MPT_ID = '0000000116C325670C3A796F1CF26364F2C5C41BCC7FC650'

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 6) + '...' + wallet.address.value.slice(-4)
})

const withdrawAmount = ref('')

// Fonction pour envoyer une transaction via curl
const sendTransaction = async (txData: any) => {
  const requestBody = {
    method: 'submit',
    params: [txData]
  }

  console.log('Sending transaction:', JSON.stringify(requestBody, null, 2))

  const response = await fetch('http://localhost:5007', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  console.log('Transaction sent with status:', response.status)
  return response
}

// Nouvelle fonction de retrait avec rendement
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
  const maxAmount = parseFloat(tokenBalances.currentRLT.value)
  
  if (amount <= 0) {
    toast.warning('Please enter a valid amount')
    return
  }
  
  if (amount > maxAmount) {
    toast.warning(`Amount exceeds available balance of ${maxAmount} RLUSD+`)
    return
  }

  console.log('🔄 Starting withdraw with yield process...')
  console.log(`💰 User wants to withdraw: ${amount} RLUSD+`)
  console.log(`🎁 Fixed yield to distribute: ${FIXED_YIELD} RLUSD+`)

  try {
    // Étape 1: Genesis dépose le rendement fixe dans le vault
    console.log('🏦 Step 1: Genesis deposits yield into vault...')
    const yieldDepositTx = {
      tx_json: {
        TransactionType: 'VaultDeposit',
        Account: GENESIS_ADDRESS,
        VaultID: VAULT_ID,
        Amount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: RLUSD_ISSUER,
          value: FIXED_YIELD.toString()
        }
      },
      secret: GENESIS_SECRET
    }

    await sendTransaction(yieldDepositTx)
    toast.info(`Genesis deposited ${FIXED_YIELD} RLUSD+ as yield`)
    
    // Attendre 2 secondes entre les transactions
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Étape 2: Genesis envoie les RLUSD+ de rendement à l'utilisateur
    console.log('💰 Step 2: Genesis sends yield RLUSD+ to user...')
    const yieldSendTx = {
      tx_json: {
        TransactionType: 'Payment',
        Account: GENESIS_ADDRESS,
        Destination: wallet.address.value,
        Amount: {
          mpt_issuance_id: MPT_ID,
          value: FIXED_YIELD.toString()
        }
      },
      secret: GENESIS_SECRET
    }

    await sendTransaction(yieldSendTx)
    toast.info(`Yield of ${FIXED_YIELD} RLUSD+ sent to user`)
    
    // Attendre 2 secondes entre les transactions
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Étape 3: L'utilisateur retire le montant total (demandé + rendement)
    const totalWithdrawAmount = amount + FIXED_YIELD
    console.log(`🔄 Step 3: User withdraws total ${totalWithdrawAmount} RLUSD+...`)
    
    const userWithdrawTx = {
      tx_json: {
        TransactionType: 'VaultWithdraw',
        Account: wallet.address.value,
        VaultID: VAULT_ID,
        Amount: {
          mpt_issuance_id: MPT_ID,
          value: totalWithdrawAmount.toString()
        }
      },
      secret: USER_SECRET
    }

    await sendTransaction(userWithdrawTx)

    // Success message
    toast.success(`🎉 Withdrawal successful! You received ${totalWithdrawAmount} RLUSD+ (${amount} + ${FIXED_YIELD} yield)`)
    withdrawAmount.value = ''
    
    // Refresh balances after successful withdrawal
    setTimeout(() => {
      tokenBalances.fetchBalances()
    }, 3000) // Wait 3 seconds for all transactions to process

  } catch (error) {
    console.error('Withdraw error details:', error)
    
    if (error instanceof TypeError && (error as any).message.includes('fetch')) {
      toast.error('Connection failed: Unable to reach the server at localhost:5007. Please check if the server is running.')
    } else if ((error as any).name === 'NetworkError') {
      toast.error('Network error: Please check your internet connection and server availability.')
    } else {
      toast.error('Error occurred: ' + (error as any).message)
    }
  }
}

const setMaxWithdrawAmount = () => {
  withdrawAmount.value = tokenBalances.currentRLT.value
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