import { ref } from 'vue'

export const useWallet = () => {
  const isConnected = ref(false)
  const address = ref('')
  const balance = ref('0')
  const isConnecting = ref(false)
  const error = ref('')

  const connect = async () => {
    isConnecting.value = true
    error.value = ''
    
    try {
      // Simulating wallet connection
      // In a real app, you would use a library like ethers.js or web3.js
      // to connect to MetaMask or another wallet provider
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      isConnected.value = true
      address.value = '0x' + Math.random().toString(16).slice(2, 42)
      balance.value = (Math.random() * 10).toFixed(4)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to connect wallet'
      isConnected.value = false
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = () => {
    isConnected.value = false
    address.value = ''
    balance.value = '0'
  }

  return {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    connect,
    disconnect
  }
}

// Create a global state for the wallet
export const wallet = useWallet() 