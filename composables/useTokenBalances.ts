import { ref, computed } from 'vue'
import { wallet } from './useWallet'
import { Client } from 'xrpl'

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

export interface VaultHolder {
  address: string
  balance: number
  percentage: number
  flags: number
}

export interface VaultData {
  MPTokenID: string
  totalSupply: number
  totalHolders: number
  holders: VaultHolder[]
  vaultBalance: number
}

export const useTokenBalances = () => {
  const tokens = ref<Token[]>([])
  const isLoading = ref(false)
  const error = ref('')
  
  // Portfolio-specific data for the vault position
  const initialDeposit = ref('0.00')
  const currentValue = ref('0.00')
  const initialRLT = ref('0.00')
  const currentRLT = ref('0.00')
  const currentAPY = ref('0.00')
  const totalYield = ref('0.00')
  const dailyYield = ref('0.00')
  
  // Vault and MPToken data
  const vaultData = ref<VaultData>({
    MPTokenID: '0000000116C325670C3A796F1CF26364F2C5C41BCC7FC650',
    totalSupply: 0,
    totalHolders: 0,
    holders: [],
    vaultBalance: 0
  })
  
  // Token-specific data (keeping for compatibility)
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
    return parseFloat(totalYield.value)
  })

  // Function to get all MPToken holders
  const getAllMPTokenHolders = async (client: any, MPTokenID: string): Promise<VaultHolder[]> => {
    console.log(`🔍 Recherche des holders pour MPToken: ${MPTokenID}`)
    
    try {
      return await scanCompleteLedger(client, MPTokenID)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des holders:', error)
      return []
    }
  }

  // Function to scan the complete ledger for MPToken holders
  const scanCompleteLedger = async (client: any, MPTokenID: string): Promise<VaultHolder[]> => {
    console.log('🔄 Scan du ledger pour les MPTokens...')
    const holders: VaultHolder[] = []
    let marker = undefined
    let pageCount = 0
    
    try {
      do {
        pageCount++
        console.log(`📄 Page ${pageCount}...`)
        
        const response: any = await client.request({
          command: 'ledger_data',
          ledger_index: 'validated',
          marker: marker,
          limit: 1000
        })
        
        const relevantTokens = response.result.state.filter((obj: any) => 
          obj.LedgerEntryType === 'MPToken' && 
          obj.MPTokenIssuanceID === MPTokenID &&
          parseFloat(obj.MPTAmount || '0') > 0
        )
        
        console.log(`🎯 Page ${pageCount}: ${relevantTokens.length} holders trouvés`)
        
        relevantTokens.forEach((token: any) => {
          holders.push({
            address: token.Account,
            balance: parseFloat(token.MPTAmount || '0'),
            percentage: 0, // Will be calculated later
            flags: token.Flags || 0
          })
        })
        
        marker = response.result.marker
        
        // Safety limit
        if (pageCount > 100) {
          console.log('⚠️ Limite de 100 pages atteinte, arrêt')
          break
        }
        
      } while (marker)
      
      // Calculate percentages
      const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0)
      holders.forEach(holder => {
        holder.percentage = totalSupply > 0 ? (holder.balance / totalSupply) * 100 : 0
      })
      
      console.log(`✅ Scan terminé: ${holders.length} holders trouvés sur ${pageCount} pages`)
      return holders
      
    } catch (error) {
      console.error('❌ Erreur scan:', error)
      return []
    }
  }

  // Function to get user's MPToken balance
  const getUserMPTokenBalance = async (client: any, MPTokenID: string, userAddress: string): Promise<number> => {
    try {
      const holders = await getAllMPTokenHolders(client, MPTokenID)
      const userHolder = holders.find(h => h.address === userAddress)
      return userHolder ? userHolder.balance : 0
    } catch (error) {
      console.error('❌ Erreur récupération balance MPToken:', error)
      return 0
    }
  }

  const fetchBalances = async () => {
    // Only proceed if wallet is connected
    if (!wallet.isConnected.value || !wallet.address.value) {
      tokens.value = []
      return
    }

    isLoading.value = true
    error.value = ''
    
    try {
      // Connect to local XRPL node
      const client = new Client('ws://localhost:6008')
      await client.connect()

      // Get account info
      const accountInfoRequest = {
        command: 'account_info' as const,
        account: wallet.address.value,
        ledger_index: 'validated' as const
      }
      
      const accountInfo = await client.request(accountInfoRequest)
      
      // Get XRP balance from account info
      const xrpBalance = parseFloat(accountInfo.result.account_data.Balance) / 1000000 // Convert drops to XRP
      
      // Get account lines (trust lines) for other currencies
      const accountLinesRequest = {
        command: 'account_lines' as const,
        account: wallet.address.value,
        ledger_index: 'validated' as const
      }
      
      const accountLines = await client.request(accountLinesRequest)
      
      // Process trust lines to find RLUSD and RLT balances
      let rlusdBalance = 0
      let rltBalance = 0
      
      if (accountLines.result.lines) {
        for (const line of accountLines.result.lines) {
          // Check for RLUSD (currency code: 524C555344000000000000000000000000000000)
          if (line.currency === '524C555344000000000000000000000000000000' || 
              line.currency === 'RLUSD') {
            rlusdBalance = parseFloat(line.balance)
          }
          // Check for RLT tokens
          if (line.currency === 'RLT') {
            rltBalance = parseFloat(line.balance)
          }
        }
      }

      // Get MPToken balance (RLUSD+ vault shares)
      const mpTokenBalance = await getUserMPTokenBalance(client, vaultData.value.MPTokenID, wallet.address.value)
      
      // Get all vault holders information
      const allHolders = await getAllMPTokenHolders(client, vaultData.value.MPTokenID)
      const totalSupply = allHolders.reduce((sum, holder) => sum + holder.balance, 0)
      
      // Update vault data
      vaultData.value = {
        MPTokenID: vaultData.value.MPTokenID,
        totalSupply,
        totalHolders: allHolders.length,
        holders: allHolders.sort((a, b) => b.balance - a.balance), // Sort by balance descending
        vaultBalance: mpTokenBalance
      }
      
      // Get account transactions to calculate yields and deposits
      const accountTxRequest = {
        command: 'account_tx' as const,
        account: wallet.address.value,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 100
      }
      
      let accountTx
      try {
        accountTx = await client.request(accountTxRequest)
      } catch (txError) {
        console.warn('Could not fetch account transactions:', txError)
        accountTx = { result: { transactions: [] } }
      }
      
      // Calculate initial deposit and yields from transaction history
      let calculatedInitialDeposit = 0
      let totalDeposits = 0
      
      if (accountTx.result.transactions) {
        for (const tx of accountTx.result.transactions) {
          // Look for payments and deposits related to RLUSD
          const transaction = (tx as any).tx || (tx as any).tx_json
          if (transaction && transaction.TransactionType === 'Payment') {
            // This is a simplified calculation - in reality you'd need more complex logic
            // to determine which transactions are deposits vs withdrawals
            if (transaction.Amount && typeof transaction.Amount === 'object' && 
                transaction.Amount.currency === 'RLUSD') {
              totalDeposits += parseFloat(transaction.Amount.value || '0')
            }
          }
          // Look for VaultDeposit transactions
          if (transaction && transaction.TransactionType === 'VaultDeposit') {
            if (transaction.Amount && typeof transaction.Amount === 'object') {
              totalDeposits += parseFloat(transaction.Amount.value || '0')
            }
          }
        }
      }
      
      // Use MPToken balance as basis for calculations if no deposits found
      calculatedInitialDeposit = totalDeposits || mpTokenBalance
      
      // Calculate yields (simplified calculation)
      const currentVaultValue = mpTokenBalance + rlusdBalance // MPToken + any RLUSD
      // Calculate a more realistic total yield based on current balance and 4% APY
      const calculatedYield = mpTokenBalance > 0 ? mpTokenBalance * 0.04 / 12 : 0 // Monthly yield approximation
      // Set fixed APY of 4% instead of calculated value
      const apy = 4.0
      const dailyYieldAmount = mpTokenBalance * (apy / 100) / 365
      
      // Calculate user's vault share percentage
      const userVaultSharePercentage = totalSupply > 0 ? (mpTokenBalance / totalSupply) * 100 : 0
      
      // Update reactive values
      tokens.value = [
        {
          symbol: 'XRP',
          name: 'XRP',
          balance: xrpBalance.toFixed(6),
          value: xrpBalance * 0.5, // Simplified price calculation
        },
        {
          symbol: 'RLUSD',
          name: 'RLUSD',
          balance: rlusdBalance.toFixed(2),
          value: rlusdBalance,
        },
        {
          symbol: 'RLUSD+',
          name: 'RLUSD+ (Vault Shares)',
          balance: mpTokenBalance.toFixed(2),
          value: mpTokenBalance * 1.05, // Vault shares typically worth slightly more
        }
      ]
      
      // Update vault position data
      initialDeposit.value = calculatedInitialDeposit.toFixed(2)
      currentValue.value = currentVaultValue.toFixed(2)
      initialRLT.value = mpTokenBalance > 0 ? calculatedInitialDeposit.toFixed(2) : '0.00'
      currentRLT.value = mpTokenBalance.toFixed(2)
      currentAPY.value = apy.toFixed(2)
      totalYield.value = Math.max(0, calculatedYield).toFixed(2)
      dailyYield.value = dailyYieldAmount.toFixed(4)
      
      // Update legacy data structures for compatibility
      rlusd.value = {
        balance: rlusdBalance,
        value: rlusdBalance
      }
      
      rlusdPlus.value = {
        balance: mpTokenBalance,
        value: mpTokenBalance * 1.05,
        apy: apy,
        rewardsPerDay: dailyYieldAmount
      }
      
      vaultShare.value = {
        balance: mpTokenBalance,
        value: mpTokenBalance * 1.05,
        sharePercentage: userVaultSharePercentage / 100 // Convert to decimal
      }
      
      // Mock rewards data (would need separate API integration)
      rewards.value = {
        xrpl: parseFloat((calculatedYield * 0.1).toFixed(4)),
        xrplThisMonth: parseFloat((dailyYieldAmount * 30).toFixed(4)),
        boostPoints: Math.floor(mpTokenBalance * 10),
        boostMultiplier: mpTokenBalance > 0 ? 1.5 : 1.0,
        airdropScore: Math.floor(calculatedInitialDeposit / 100),
        nextAirdrop: '15 July 2024'
      }
      
      await client.disconnect()
      
    } catch (e) {
      console.error('Error fetching XRPL data:', e)
      error.value = e instanceof Error ? e.message : 'Failed to fetch token balances from XRPL'
      tokens.value = []
      
      // Reset values on error
      initialDeposit.value = '0.00'
      currentValue.value = '0.00'
      initialRLT.value = '0.00'
      currentRLT.value = '0.00'
      currentAPY.value = '0.00'
      totalYield.value = '0.00'
      dailyYield.value = '0.00'
      
      // Reset vault data
      vaultData.value = {
        MPTokenID: vaultData.value.MPTokenID,
        totalSupply: 0,
        totalHolders: 0,
        holders: [],
        vaultBalance: 0
      }
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
    fetchBalances,
    // New portfolio-specific exports
    initialDeposit,
    currentValue,
    initialRLT,
    currentRLT,
    currentAPY,
    totalYield,
    dailyYield,
    // Vault data export
    vaultData
  }
} 