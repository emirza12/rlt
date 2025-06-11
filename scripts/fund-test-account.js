// Script to fund a test account on local XRPL
// Run with: node scripts/fund-test-account.js

import { Client, Wallet, dropsToXrp, xrpToDrops } from 'xrpl'

const LOCAL_NETWORK = 'ws://localhost:6008'

async function fundAccount(destinationAddress, amountXRP = 100) {
  const client = new Client(LOCAL_NETWORK)
  
  try {
    await client.connect()
    console.log('✅ Connected to local XRPL network')
    
    // Create a test wallet (in real environment, use existing funded wallet)
    const testWallet = Wallet.generate()
    console.log(`🔑 Test wallet: ${testWallet.address}`)
    
    // Check if destination account exists
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: destinationAddress,
        ledger_index: 'validated'
      })
      
      const balance = dropsToXrp(accountInfo.result.account_data.Balance)
      console.log(`💰 Account ${destinationAddress} already exists with ${balance} XRP`)
      return
      
    } catch (error) {
      if (error?.data?.error === 'actNotFound') {
        console.log(`📝 Account ${destinationAddress} not found, will try to fund it`)
      } else {
        throw error
      }
    }
    
    // Try to fund using a genesis account or existing funded account
    // First, let's try to find a funded account to use as sender
    const genesisAccounts = [
      'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', // Common genesis account
    ]
    
    let senderWallet = null
    let senderBalance = '0'
    
    for (const address of genesisAccounts) {
      try {
        const accountInfo = await client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        })
        
        senderBalance = dropsToXrp(accountInfo.result.account_data.Balance)
        console.log(`💰 Found funded account ${address} with ${senderBalance} XRP`)
        
        if (parseFloat(senderBalance) >= amountXRP + 10) { // Need extra for fees and reserve
          // We found a funded account, but we need its seed to create a wallet
          // In a real scenario, you would use the actual seed or private key
          console.log(`⚠️  Found account ${address} but need seed/private key to send transactions`)
          console.log(`📋 To fund ${destinationAddress}, manually send ${amountXRP} XRP from this account`)
          break
        }
        
      } catch (error) {
        if (error?.data?.error === 'actNotFound') {
          console.log(`❌ Account ${address} not found`)
        } else {
          console.log(`❌ Error checking ${address}:`, error.message)
        }
      }
    }
    
    console.log('\n💡 Manual funding instructions:')
    console.log('1. Use your wallet seed phrase to create a funded wallet')
    console.log('2. Or use the rippled fund command:')
    console.log(`   docker exec -it <rippled-container> rippled account_info ${destinationAddress}`)
    console.log('3. Or create test accounts with initial funding in your rippled config')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.disconnect()
  }
}

async function createAndFundTestAccounts() {
  const client = new Client(LOCAL_NETWORK)
  
  try {
    await client.connect()
    console.log('✅ Connected to local XRPL network')
    
    // Create multiple test accounts
    const testAccounts = []
    for (let i = 0; i < 3; i++) {
      const wallet = Wallet.generate()
      testAccounts.push(wallet)
      console.log(`🔑 Test Account ${i + 1}:`)
      console.log(`   Address: ${wallet.address}`)
      console.log(`   Seed: ${wallet.seed}`)
      console.log(`   Private Key: ${wallet.privateKey}`)
      console.log()
    }
    
    console.log('📋 To fund these accounts manually in your local rippled:')
    console.log('1. Connect to your rippled container')
    console.log('2. Use the account_set command or send XRP from a genesis account')
    console.log('3. Or add initial funding in your rippled.cfg file')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.disconnect()
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'fund') {
    const address = args[1] || 'rQEVHzXAKPnvmiXYamzLsTSW7SwggnmSLu'
    const amount = parseFloat(args[2]) || 100
    await fundAccount(address, amount)
  } else if (command === 'create') {
    await createAndFundTestAccounts()
  } else {
    console.log('🧪 Local XRPL Account Funding Tool\n')
    console.log('Usage:')
    console.log('  node scripts/fund-test-account.js fund [address] [amount]')
    console.log('  node scripts/fund-test-account.js create')
    console.log('\nExamples:')
    console.log('  node scripts/fund-test-account.js fund rQEVHzXAKPnvmiXYamzLsTSW7SwggnmSLu 100')
    console.log('  node scripts/fund-test-account.js create')
    
    // Default action: check the destination account
    await fundAccount('rQEVHzXAKPnvmiXYamzLsTSW7SwggnmSLu')
  }
}

main().catch(console.error) 