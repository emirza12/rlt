import { ref, computed } from 'vue'
import { wallet } from './useWallet'

export interface Token {
  symbol: string
  name: string
  balance: string
  value: number
  icon?: string
}

export interface RewardsData {
  xrpl: number
  xrplThisMonth: number
  boostPoints: number
  boostMultiplier: number
  airdropScore: number
  nextAirdrop: string
}

export const useTokenBalances = () => {
  const tokens = ref<Token[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  // Token-specific data
  const rlusd = ref({
    balance: 0,
    value: 0
  })
  
  const rlusdPlus = ref({
    balance: 0,
    value: 0,
    apy: 0,
    rewardsPerDay: 0
  })
  
  const vaultShare = ref({
    balance: 0,
    value: 0,
    sharePercentage: 0
  })
  
  const rewards = ref<RewardsData>({
    xrpl: 0,
    xrplThisMonth: 0,
    boostPoints: 0,
    boostMultiplier: 0,
    airdropScore: 0,
    nextAirdrop: ''
  })

  const totalValue = computed(() => {
    return tokens.value.reduce((acc, token) => acc + token.value, 0)
  })
  
  const totalEarnings = computed(() => {
    // Sample calculation based on rewards and token earnings
    return rlusdPlus.value.balance * 0.05 + rewards.value.xrpl
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
      
      // Mock data for tokens
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
      
      // Mock data for specific tokens
      rlusd.value = {
        balance: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
        value: parseFloat((Math.random() * 5000 + 1000).toFixed(2))
      }
      
      rlusdPlus.value = {
        balance: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
        value: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
        apy: parseFloat((Math.random() * 5 + 3).toFixed(2)),
        rewardsPerDay: parseFloat((Math.random() * 10 + 1).toFixed(4))
      }
      
      vaultShare.value = {
        balance: parseFloat((Math.random() * 10 + 1).toFixed(4)),
        value: parseFloat((Math.random() * 3000 + 1000).toFixed(2)),
        sharePercentage: parseFloat((Math.random() * 0.5 + 0.01).toFixed(4))
      }
      
      // Mock rewards data
      rewards.value = {
        xrpl: parseFloat((Math.random() * 100 + 10).toFixed(4)),
        xrplThisMonth: parseFloat((Math.random() * 20 + 5).toFixed(4)),
        boostPoints: Math.floor(Math.random() * 1000 + 100),
        boostMultiplier: parseFloat((Math.random() * 2 + 1).toFixed(2)),
        airdropScore: Math.floor(Math.random() * 100),
        nextAirdrop: '15 July 2023'
      }
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
    totalEarnings,
    rlusd,
    rlusdPlus,
    vaultShare,
    rewards,
    fetchBalances
  }
} 