// Test script for GemWallet network connectivity
// Run with: node scripts/test-gemwallet-network.js

import { Client } from 'xrpl'
import https from 'https'
import { WebSocket } from 'ws'

const LOCAL_NETWORKS = [
  'wss://localhost:6009',
  'wss://127.0.0.1:6009',
  'ws://localhost:6008',
  'ws://127.0.0.1:6008'
]

const WSS_NETWORKS = [
  'wss://localhost:6009',
  'wss://127.0.0.1:6009'
]

// Create agent that ignores self-signed certificates for local testing
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

async function testWSSConnectivityWithCertBypass() {
  console.log('🔒 Testing WSS Connectivity with Certificate Bypass...\n')

  for (const url of WSS_NETWORKS) {
    console.log(`Testing ${url} with certificate bypass...`)
    
    try {
      // Test with custom WebSocket options to bypass certificate validation
      const client = new Client(url, {
        connectionOptions: {
          rejectUnauthorized: false,
          agent: httpsAgent
        }
      })
      
      await client.connect()
      console.log(`✅ Connected to ${url} (certificate bypass)`)
      
      // Test a simple request
      const serverInfo = await client.request({
        command: 'server_info'
      })
      
      console.log(`📊 Server Info:`)
      console.log(`  - Build Version: ${serverInfo.result.info.build_version}`)
      console.log(`  - Complete Ledgers: ${serverInfo.result.info.complete_ledgers}`)
      console.log(`  - Network ID: ${serverInfo.result.info.network_id || 'N/A'}`)
      console.log(`  - Peers: ${serverInfo.result.info.peers || 0}`)
      console.log(`  - Server State: ${serverInfo.result.info.server_state}`)
      
      await client.disconnect()
      console.log(`✅ Successfully tested ${url} with WSS\n`)
      
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}:`, error.message)
      
      // Try alternative approach with raw WebSocket
      try {
        console.log(`🔄 Trying alternative WebSocket approach for ${url}...`)
        const ws = new WebSocket(url, {
          rejectUnauthorized: false
        })
        
        await new Promise((resolve, reject) => {
          ws.on('open', () => {
            console.log(`✅ Raw WebSocket connected to ${url}`)
            ws.close()
            resolve()
          })
          
          ws.on('error', (err) => {
            console.log(`❌ Raw WebSocket failed for ${url}:`, err.message)
            reject(err)
          })
          
          setTimeout(() => {
            reject(new Error('Connection timeout'))
          }, 5000)
        })
        
      } catch (wsError) {
        console.log(`❌ Alternative WebSocket approach also failed:`, wsError.message)
      }
    }
  }
}

async function testXRPLConnectivity() {
  console.log('🔍 Testing XRPL Local Network Connectivity...\n')

  for (const url of LOCAL_NETWORKS) {
    console.log(`Testing ${url}...`)
    const client = new Client(url)
    
    try {
      await client.connect()
      console.log(`✅ Connected to ${url}`)
      
      // Test a simple request
      const serverInfo = await client.request({
        command: 'server_info'
      })
      
      console.log(`📊 Server Info:`)
      console.log(`  - Build Version: ${serverInfo.result.info.build_version}`)
      console.log(`  - Complete Ledgers: ${serverInfo.result.info.complete_ledgers}`)
      console.log(`  - Network ID: ${serverInfo.result.info.network_id || 'N/A'}`)
      console.log(`  - Peers: ${serverInfo.result.info.peers || 0}`)
      console.log(`  - Server State: ${serverInfo.result.info.server_state}`)
      
      await client.disconnect()
      console.log(`✅ Successfully tested ${url}\n`)
      
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}:`, error.message)
      try {
        await client.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
}

async function testAccountBalance(address = 'rQEVHzXAKPnvmiXYamzLsTSW7SwggnmSLu') {
  console.log(`🔍 Testing account balance for ${address}...\n`)
  
  for (const url of LOCAL_NETWORKS) {
    const client = new Client(url, url.startsWith('wss:') ? {
      connectionOptions: {
        rejectUnauthorized: false,
        agent: httpsAgent
      }
    } : {})
    
    try {
      await client.connect()
      
      const accountInfo = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      })
      
      const balanceInDrops = accountInfo.result.account_data.Balance
      const balanceInXRP = (parseInt(balanceInDrops) / 1000000).toString()
      
      console.log(`✅ Account found on ${url}:`)
      console.log(`  - Balance: ${balanceInXRP} XRP`)
      console.log(`  - Sequence: ${accountInfo.result.account_data.Sequence}`)
      console.log(`  - Account: ${accountInfo.result.account_data.Account}`)
      
      await client.disconnect()
      break
      
    } catch (error) {
      if (error?.data?.error === 'actNotFound') {
        console.log(`❌ Account ${address} not found on ${url}`)
      } else {
        console.log(`❌ Error checking account on ${url}:`, error.message)
      }
      
      try {
        await client.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
}

async function main() {
  console.log('🧪 GemWallet WSS Network Diagnostic\n')
  console.log('====================================\n')
  
  // Focus on WSS testing first
  await testWSSConnectivityWithCertBypass()
  
  console.log('\n====================================\n')
  
  await testXRPLConnectivity()
  
  console.log('\n====================================\n')
  
  await testAccountBalance()
  
  console.log('\n====================================\n')
  console.log('💡 WSS Troubleshooting Tips:')
  console.log('1. Make sure your local rippled is running (docker-compose up)')
  console.log('2. Visit https://localhost:6009 in browser and accept certificate')
  console.log('3. Configure GemWallet with wss://localhost:6009')
  console.log('4. For production, use proper SSL certificates')
  console.log('5. For testing, the script now bypasses certificate validation')
  console.log('6. Make sure the destination account is funded (min 10 XRP)')
  console.log('7. Check GemWallet console for additional errors')
  console.log('\n🔑 Certificate Notes:')
  console.log('- WSS requires valid SSL certificates')
  console.log('- Local development uses self-signed certificates')
  console.log('- This script bypasses certificate validation for testing')
  console.log('- GemWallet may still require manual certificate acceptance')
}

main().catch(console.error) 