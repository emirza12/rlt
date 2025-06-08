import { ref } from 'vue'
import { Client, Wallet } from 'xrpl'

export const useWallet = () => {
  const isConnected = ref(false)
  const address = ref('')
  const balance = ref('0')
  const isConnecting = ref(false)
  const error = ref('')
  const client = ref<Client | null>(null)
  const currentWallet = ref<Wallet | null>(null)

  const connect = async () => {
    isConnecting.value = true
    error.value = ''
    
    try {
      // This is the legacy connect method - redirect to seed-based connection
      error.value = 'Please use the seed phrase connection method below'
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to connect wallet'
      isConnected.value = false
    } finally {
      isConnecting.value = false
    }
  }

  const connectFromSeed = async (seedPhrase: string) => {
    isConnecting.value = true
    error.value = ''
    
    try {
      // Initialize XRPL client
      if (!client.value) {
        client.value = new Client('ws://localhost:6008') // Using local rippled server
        await client.value.connect()
      }

      // Create wallet from seed phrase
      const wallet = Wallet.fromSeed(seedPhrase)
      currentWallet.value = wallet
      
      // Get account info and balance
      try {
        const accountInfo = await client.value.request({
          command: 'account_info',
          account: wallet.address,
          ledger_index: 'validated'
        })
        
        // Convert drops to XRP (1 XRP = 1,000,000 drops)
        const balanceInDrops = accountInfo.result.account_data.Balance
        const balanceInXRP = (parseInt(balanceInDrops) / 1000000).toString()
        
        isConnected.value = true
        address.value = wallet.address
        balance.value = balanceInXRP
      } catch (accountError: any) {
        if (accountError?.data?.error === 'actNotFound') {
          // Account not found - this is a new/unfunded account
          isConnected.value = true
          address.value = wallet.address
          balance.value = '0'
          error.value = 'Account not funded. You need to receive at least 10 XRP to activate this account.'
        } else {
          throw accountError
        }
      }
    } catch (e: any) {
      error.value = e instanceof Error ? e.message : 'Failed to connect wallet'
      isConnected.value = false
      currentWallet.value = null
      
      // Clean up client on error
      if (client.value) {
        try {
          await client.value.disconnect()
        } catch (disconnectError) {
          console.warn('Error disconnecting client:', disconnectError)
        }
        client.value = null
      }
    } finally {
      isConnecting.value = false
    }
  }

  const generateWallet = async (): Promise<{ address: string, seed: string }> => {
    try {
      const wallet = Wallet.generate()
      return {
        address: wallet.address,
        seed: wallet.seed || ''
      }
    } catch (e) {
      throw new Error('Failed to generate wallet')
    }
  }

  const disconnect = async () => {
    isConnected.value = false
    address.value = ''
    balance.value = '0'
    currentWallet.value = null
    error.value = ''
    
    // Disconnect XRPL client
    if (client.value) {
      try {
        await client.value.disconnect()
      } catch (e) {
        console.warn('Error disconnecting XRPL client:', e)
      }
      client.value = null
    }
  }

  const refreshBalance = async () => {
    if (!client.value || !currentWallet.value || !isConnected.value) return
    
    try {
      const accountInfo = await client.value.request({
        command: 'account_info',
        account: currentWallet.value.address,
        ledger_index: 'validated'
      })
      
      const balanceInDrops = accountInfo.result.account_data.Balance
      const balanceInXRP = (parseInt(balanceInDrops) / 1000000).toString()
      balance.value = balanceInXRP
    } catch (e) {
      console.error('Failed to refresh balance:', e)
    }
  }

  return {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    client,
    currentWallet,
    connect,
    connectFromSeed,
    generateWallet,
    disconnect,
    refreshBalance
  }
}

// Create a global state for the wallet
export const wallet = useWallet() 