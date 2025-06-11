#!/usr/bin/env node

/**
 * Script de test pour vérifier la connectivité au réseau XRPL local
 * et récupérer le solde d'un compte
 * 
 * Usage: node scripts/test-xrpl-connection.js [account_address]
 */

const { Client } = require('xrpl');

const LOCAL_NETWORK_URL = 'wss://localhost:6009';

async function testConnection(accountAddress) {
  console.log('🔗 Testing XRPL Local Network Connection...');
  console.log(`📡 Connecting to: ${LOCAL_NETWORK_URL}`);
  
  const client = new Client(LOCAL_NETWORK_URL);
  
  try {
    // Test connection
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Get server info
    console.log('\n📊 Server Information:');
    const serverInfo = await client.request({
      command: 'server_info'
    });
    
    console.log(`- Ledger Index: ${serverInfo.result.info.validated_ledger.seq}`);
    console.log(`- Server Version: ${serverInfo.result.info.build_version}`);
    console.log(`- Network ID: ${serverInfo.result.info.network_id || 'Not specified'}`);
    
    // Test account balance if address provided
    if (accountAddress) {
      console.log(`\n💰 Account Balance for: ${accountAddress}`);
      
      try {
        const accountInfo = await client.request({
          command: 'account_info',
          account: accountAddress,
          ledger_index: 'validated'
        });
        
        const balanceInDrops = accountInfo.result.account_data.Balance;
        const balanceInXRP = (parseInt(balanceInDrops) / 1000000).toString();
        
        console.log(`- Balance: ${balanceInXRP} XRP (${balanceInDrops} drops)`);
        console.log(`- Account Sequence: ${accountInfo.result.account_data.Sequence}`);
        console.log(`- Owner Count: ${accountInfo.result.account_data.OwnerCount}`);
        
      } catch (accountError) {
        if (accountError.data && accountError.data.error === 'actNotFound') {
          console.log('❌ Account not found (unfunded account)');
          console.log('💡 Tip: Fund this account with at least 10 XRP to activate it');
        } else {
          console.error('❌ Error fetching account info:', accountError.message);
        }
      }
    } else {
      console.log('\n💡 Tip: Provide an account address to check balance');
      console.log('   Usage: node scripts/test-xrpl-connection.js rAddress...');
    }
    
    // Test ledger info
    console.log('\n📚 Latest Ledger:');
    const ledgerInfo = await client.request({
      command: 'ledger',
      ledger_index: 'validated'
    });
    
    console.log(`- Hash: ${ledgerInfo.result.ledger.ledger_hash}`);
    console.log(`- Close Time: ${new Date(ledgerInfo.result.ledger.close_time * 1000 + 946684800000).toISOString()}`);
    console.log(`- Transaction Count: ${ledgerInfo.result.ledger.transactions ? ledgerInfo.result.ledger.transactions.length : 0}`);
    
    console.log('\n✅ All tests passed! Your local XRPL network is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('- Connection refused. Is rippled running on localhost:6009?');
    } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('- SSL Certificate error. This is expected with self-signed certificates.');
      console.error('- Try accepting the certificate in your browser first: https://localhost:6009');
    } else {
      console.error(`- Error: ${error.message}`);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure rippled Docker container is running');
    console.error('2. Check that port 6009 is exposed and accessible');
    console.error('3. Verify WSS is enabled in rippled configuration');
    console.error('4. Accept self-signed certificate in browser if needed');
    
    process.exit(1);
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log('\n🔌 Disconnected from XRPL network');
    }
  }
}

// Parse command line arguments
const accountAddress = process.argv[2];

// Validate address format if provided
if (accountAddress && !accountAddress.match(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
  console.error('❌ Invalid XRPL address format');
  console.error('XRPL addresses start with "r" and are 25-34 characters long');
  process.exit(1);
}

// Run the test
testConnection(accountAddress).catch(console.error); 