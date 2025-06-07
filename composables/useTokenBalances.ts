import { ref, computed } from 'vue'
import { wallet } from './useWallet'

export interface Token {
  symbol: string
  name: string
  balance: string
  value: number
  icon?: string
}

export const useTokenBalances = () => {
  const tokens = ref<Token[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const totalValue = computed(() => {
    return tokens.value.reduce((acc, token) => acc + token.value, 0)
  })

  const fetchBalances = async () => {
    // Only proceed if wallet is connected
    if (!wallet.isConnected.value) {
      tokens.value = []
      return
    }

    isLoading.value = true
    error.value = ''
    
    try {
      // Simulating API call to fetch token balances
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      tokens.value = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: wallet.balance.value,
          value: parseFloat(wallet.balance.value) * 2500, // Simulated ETH price
        },
        {
          symbol: 'RLT',
          name: 'RLT Token',
          balance: (Math.random() * 1000).toFixed(2),
          value: (Math.random() * 1000).toFixed(2) * 1.5, // Simulated RLT price
        },
      ]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch token balances'
      tokens.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    tokens,
    isLoading,
    error,
    totalValue,
    fetchBalances
  }
} 