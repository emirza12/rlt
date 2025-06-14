<template>
  <div class="bg-[#f4f4f4] min-h-screen py-12">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Title and Description -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4 text-black">Deposit RLUSD</h1>
        <p class="text-lg text-black/60">
          Deposit your RLUSD into the vault to start earning competitive yields backed by US Treasury Bills.
        </p>
      </div>

      <!-- Deposit Form -->
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <form @submit.prevent="handleDeposit" class="space-y-6">
          <!-- Amount Input -->
          <div>
            <label for="amount" class="block text-sm font-medium text-black/80 mb-2">Amount to Deposit</label>
            <div class="relative">
              <input
                type="number"
                id="amount"
                v-model="amount"
                class="w-full px-4 py-3 rounded-lg border border-black/10 focus:border-[#00DBCE] focus:ring-1 focus:ring-[#00DBCE] outline-none transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-black/60">RLUSD</div>
            </div>
          </div>

          <!-- Max Button -->
          <div class="flex justify-end">
            <button
              type="button"
              @click="setMaxAmount"
              class="text-sm text-[#00DBCE] hover:text-[#00DBCE]/80 transition-colors"
            >
              Use Max Balance
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-[#00DBCE] text-white py-3 rounded-lg hover:bg-[#00DBCE]/90 transition-colors font-medium"
          >
            Deposit RLUSD
          </button>
        </form>
      </div>

      <!-- Process Description -->
      <div class="mt-12 space-y-6">
        <h2 class="text-xl font-semibold text-black">What happens next?</h2>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 rounded-full bg-[#00DBCE]/10 flex items-center justify-center flex-shrink-0 mt-1">
              <span class="text-[#00DBCE] text-sm">1</span>
            </div>
            <p class="text-black/60">Your RLUSD is securely deposited into the vault and immediately starts earning yield.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 rounded-full bg-[#00DBCE]/10 flex items-center justify-center flex-shrink-0 mt-1">
              <span class="text-[#00DBCE] text-sm">2</span>
            </div>
            <p class="text-black/60">You receive RLT tokens representing your share of the vault's assets.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 rounded-full bg-[#00DBCE]/10 flex items-center justify-center flex-shrink-0 mt-1">
              <span class="text-[#00DBCE] text-sm">3</span>
            </div>
            <p class="text-black/60">The vault automatically invests in US Treasury Bills to generate returns.</p>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 rounded-full bg-[#00DBCE]/10 flex items-center justify-center flex-shrink-0 mt-1">
              <span class="text-[#00DBCE] text-sm">4</span>
            </div>
            <p class="text-black/60">You can withdraw your funds at any time by burning your vRLUSD tokens, with no lock-up period.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { wallet } from '~/composables/useWallet'
import { toast } from '~/composables/useToast'

definePageMeta({
  layout: 'default'
})

const amount = ref('')

const setMaxAmount = () => {
  // TODO: Implement max balance check
  amount.value = '1000' // Placeholder
}

const handleDeposit = async () => {
  if (!wallet.isConnected.value) {
    toast.warning('Please connect your wallet first')
    return
  }

  if (!amount.value) {
    toast.warning('Please enter an amount to deposit')
    return
  }

  console.log('Starting deposit request...')
  console.log('Wallet address:', wallet.address.value)
  console.log('Amount:', amount.value)

  try {
    const requestBody = {
      method: 'submit',
      params: [{
        tx_json: {
          TransactionType: 'VaultDeposit',
          Account: wallet.address.value,
          VaultID: 'B89B9DC7E1474CC0DA17F336877148CEB24C55BA73FA5155C78EF3DE20D4902D',
          Amount: {
            currency: '524C555344000000000000000000000000000000',
            issuer: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
            value: amount.value
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
      toast.success('Deposit request sent successfully!')
      amount.value = ''
    } else {
      const result = await response.json()
      console.log('Deposit result:', result)
      
      if (response.ok) {
        toast.success('Deposit successful!')
        amount.value = ''
      } else {
        toast.error('Deposit failed: ' + (result.error || result.message || 'Unknown error'))
      }
    }
  } catch (error) {
    console.error('Deposit error details:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error('Connection failed: Unable to reach the server at localhost:5007. Please check if the server is running.')
    } else if (error.name === 'NetworkError') {
      toast.error('Network error: Please check your internet connection and server availability.')
    } else {
      toast.error('Error occurred: ' + error.message)
    }
  }
}

</script> 