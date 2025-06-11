import { ref, computed } from 'vue'
import { 
  isInstalled, 
  getAddress, 
  getNetwork, 
  getPublicKey,
  sendPayment,
  signMessage,
  submitTransaction,
  type SendPaymentRequest 
} from '@gemwallet/api'
import { Client } from 'xrpl'
import https from 'https'

export const useGemWallet = () => {
  // State
  const extensionInstalled = ref(false)
  const isConnected = ref(false)
  const address = ref('')
  const publicKey = ref('')
  const currentNetwork = ref('')
  const balance = ref<string | null>(null)
  const isConnecting = ref(false)
  const error = ref('')

  // XRPL Client for balance fetching
  const xrplClient = ref<Client | null>(null)

  // Local network configuration - Updated for WSS connectivity
  const LOCAL_NETWORK_URL = 'wss://localhost:6009'  // Using WSS for secure connection
  const LOCAL_NETWORK_NAMES = ['local', 'dev', 'custom', 'localhost']

  // Computed
  const shortAddress = computed(() => {
    if (!address.value) return ''
    return address.value.slice(0, 8) + '...' + address.value.slice(-6)
  })

  const isLocalNetwork = computed(() => {
    return LOCAL_NETWORK_NAMES.some(name => 
      currentNetwork.value.toLowerCase().includes(name)
    )
  })

  // Methods
  const checkExtension = async (): Promise<boolean> => {
    try {
      const response = await isInstalled()
      extensionInstalled.value = response.result.isInstalled
      return extensionInstalled.value
    } catch (err) {
      console.warn('Failed to check GemWallet installation:', err)
      extensionInstalled.value = false
      return false
    }
  }

  const checkNetwork = async (): Promise<void> => {
    try {
      const response = await getNetwork()
      if (response.type === 'response' && response.result) {
        currentNetwork.value = response.result.network
      }
    } catch (err) {
      console.warn('Failed to check network:', err)
      currentNetwork.value = ''
    }
  }

  const initializeXRPLClient = async (): Promise<void> => {
    try {
      if (!xrplClient.value) {
        // Create HTTPS agent that bypasses self-signed certificates for local development
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false
        })
        
        // Use local network URL for balance fetching with WSS certificate bypass
        xrplClient.value = new Client(LOCAL_NETWORK_URL, {
          agent: httpsAgent // Use agent property for SSL configuration
        })
        await xrplClient.value.connect()
      }
    } catch (err) {
      console.warn('Failed to initialize XRPL client:', err)
      // Fallback to WS if WSS fails
      try {
        const fallbackUrl = 'ws://localhost:6008'
        console.log('Trying fallback connection to:', fallbackUrl)
        xrplClient.value = new Client(fallbackUrl)
        await xrplClient.value.connect()
        console.log('✅ Connected using fallback WS connection')
      } catch (fallbackErr) {
        console.warn('Fallback connection also failed:', fallbackErr)
        xrplClient.value = null
      }
    }
  }

  const fetchBalance = async (accountAddress?: string): Promise<string | null> => {
    const targetAddress = accountAddress || address.value
    if (!targetAddress) return null

    try {
      await initializeXRPLClient()
      if (!xrplClient.value) {
        throw new Error('XRPL client not available')
      }

      const accountInfo = await xrplClient.value.request({
        command: 'account_info',
        account: targetAddress,
        ledger_index: 'validated'
      })

      // Convert drops to XRP (1 XRP = 1,000,000 drops)
      const balanceInDrops = accountInfo.result.account_data.Balance
      const balanceInXRP = (parseInt(balanceInDrops) / 1000000).toString()
      
      if (targetAddress === address.value) {
        balance.value = balanceInXRP
      }
      
      return balanceInXRP
    } catch (err: any) {
      if (err?.data?.error === 'actNotFound') {
        // Account not found - new/unfunded account
        if (targetAddress === address.value) {
          balance.value = '0'
        }
        return '0'
      }
      console.error('Failed to fetch balance:', err)
      return null
    }
  }

  const connect = async (): Promise<boolean> => {
    isConnecting.value = true
    error.value = ''

    try {
      // Check if extension is installed
      const isExtensionInstalled = await checkExtension()
      if (!isExtensionInstalled) {
        throw new Error('GemWallet extension is not installed')
      }

      // Get wallet address (this will prompt user to connect)
      const addressResponse = await getAddress()
      if (addressResponse.type !== 'response' || !addressResponse.result) {
        throw new Error('Connection was rejected by the user')
      }

      address.value = addressResponse.result.address
      isConnected.value = true

      // Get public key
      try {
        const keyResponse = await getPublicKey()
        if (keyResponse.type === 'response' && keyResponse.result) {
          publicKey.value = keyResponse.result.publicKey
        }
      } catch (keyErr) {
        console.warn('Failed to get public key:', keyErr)
      }

      // Check network
      await checkNetwork()

      // Fetch balance
      await fetchBalance()

      // Warn if not on local network
      if (!isLocalNetwork.value) {
        console.warn(`Warning: Connected to ${currentNetwork.value} instead of local network`)
        error.value = `Warning: Connected to ${currentNetwork.value}. Expected local network (${LOCAL_NETWORK_URL})`
      }

      return true
    } catch (err: any) {
      console.error('Failed to connect GemWallet:', err)
      error.value = err.message || 'Failed to connect to GemWallet'
      isConnected.value = false
      address.value = ''
      publicKey.value = ''
      balance.value = null
      return false
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = async (): Promise<void> => {
    isConnected.value = false
    address.value = ''
    publicKey.value = ''
    currentNetwork.value = ''
    balance.value = null
    error.value = ''
    
    // Disconnect XRPL client
    if (xrplClient.value) {
      try {
        await xrplClient.value.disconnect()
      } catch (err) {
        console.warn('Error disconnecting XRPL client:', err)
      }
      xrplClient.value = null
    }
  }

  const refreshBalance = async (): Promise<void> => {
    if (isConnected.value && address.value) {
      await fetchBalance()
    }
  }

  const sendXRP = async (
    destination: string, 
    amount: string, 
    destinationTag?: number
  ): Promise<string | null> => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    console.log('🔄 Starting XRP transaction...')
    console.log('📍 Destination:', destination)
    console.log('💰 Amount (drops):', amount)
    console.log('🏷️ Destination Tag:', destinationTag)
    console.log('🌐 Current Network:', currentNetwork.value)

    try {
      const payment: SendPaymentRequest = {
        amount: amount, // Amount in drops (1 XRP = 1,000,000 drops)
        destination: destination,
        ...(destinationTag && { destinationTag })
      }

      console.log('📤 Sending payment request:', payment)
      
      // Add timeout to prevent infinite loop
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout (30s)')), 30000)
      })

      const response = await Promise.race([
        sendPayment(payment),
        timeoutPromise
      ]) as any

      console.log('📥 Payment response:', response)
      
      if (response.type === 'response' && response.result) {
        console.log('✅ Transaction successful:', response.result.hash)
        // Refresh balance after successful payment
        setTimeout(() => refreshBalance(), 2000)
        return response.result.hash
      } else if (response.type === 'reject') {
        console.log('❌ Transaction rejected:', response)
        throw new Error(`Transaction was rejected: ${response.error || 'Unknown error'}`)
      } else {
        console.log('❓ Unexpected response:', response)
        throw new Error('Transaction was rejected or failed')
      }
    } catch (err: any) {
      console.error('💥 Failed to send XRP:', err)
      throw err
    }
  }

  const signMessageData = async (message: string): Promise<string | null> => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const response = await signMessage(message)
      if (response.type === 'response' && response.result) {
        return response.result.signedMessage
      } else {
        throw new Error('Message signing was rejected')
      }
    } catch (err: any) {
      console.error('Failed to sign message:', err)
      throw err
    }
  }

  const submitXRPLTransaction = async (transaction: any): Promise<string | null> => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const response = await submitTransaction({ transaction })
      if (response.type === 'response' && response.result) {
        // Refresh balance after successful transaction
        setTimeout(() => refreshBalance(), 2000)
        return response.result.hash
      } else {
        throw new Error('Transaction was rejected')
      }
    } catch (err: any) {
      console.error('Failed to submit transaction:', err)
      throw err
    }
  }

  const refreshConnection = async (): Promise<void> => {
    if (extensionInstalled.value) {
      try {
        const response = await getAddress()
        if (response.type === 'response' && response.result) {
          isConnected.value = true
          address.value = response.result.address
          await fetchBalance()
        } else {
          isConnected.value = false
          address.value = ''
          balance.value = null
        }
      } catch (err) {
        isConnected.value = false
        address.value = ''
        balance.value = null
      }
      
      await checkNetwork()
    }
  }

  // Setup instructions for local development
  const getSetupInstructions = () => {
    return [
      'Install GemWallet browser extension from https://gemwallet.app/',
      'Open GemWallet extension settings',
      'Add a custom network with the following details:',
      `  - Name: Local Development`,
      `  - WebSocket URL: ${LOCAL_NETWORK_URL}`,
      'Accept any self-signed certificate warnings',
      'Switch to the local network in GemWallet',
      'Click the connect button in this application',
      '',
      'Note: You may need to first visit https://localhost:6009 in your browser',
      'and accept the security certificate before GemWallet can connect.'
    ]
  }

  return {
    // State
    extensionInstalled,
    isConnected,
    address,
    publicKey,
    currentNetwork,
    balance,
    isConnecting,
    error,
    
    // Computed
    shortAddress,
    isLocalNetwork,
    
    // Methods
    checkExtension,
    checkNetwork,
    connect,
    disconnect,
    fetchBalance,
    refreshBalance,
    sendXRP,
    signMessageData,
    submitXRPLTransaction,
    refreshConnection,
    getSetupInstructions,
    
    // Constants
    LOCAL_NETWORK_URL
  }
}

// Create a global instance for the application
export const gemWallet = useGemWallet() 