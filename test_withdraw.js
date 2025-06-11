import xrpl from 'xrpl';
import { createRLUSDPlusVault, depositRLUSD, distributeYield, withdrawRLUSD, getUserRLUSDPlusBalance, getCachedHolders, clearHoldersCache } from './functions.js';

async function testWithdraw() {
    
    // Connection
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const client = new xrpl.Client('wss://localhost:6009');
    await client.connect();
    
    // Wallets
    const managerWallet = xrpl.Wallet.fromSeed('snoPBrXtMeMyMHUVTgbuqAfg1SUTb', {algorithm: 'secp256k1'});
    const genesisWallet = managerWallet;
    const userWallet = xrpl.Wallet.fromSeed('sEdVYi5z8R9Nj9FmNHY4EYjQTp2YjuN');
    const rlusdIssuer = 'rMWoqF5yBRQSLchYHTPiHfHLUfuP222r9y';
    
    try {
      // 1. Create the vault
      const {vaultId, MPTokenID} = await createRLUSDPlusVault(client, managerWallet, rlusdIssuer);
      console.log(`🏗️ Vault created - ID: ${vaultId}`);
      console.log(`🪙 MPTokenID: ${MPTokenID}`);
      
      // 2. User deposits RLUSD to get RLUSD+
      console.log('\n💰 === INITIAL DEPOSIT ===');
      await depositRLUSD(client, vaultId, userWallet, 50, rlusdIssuer);
      console.log('✅ Deposit completed');
      
      // 4. Check initial balance
      console.log('\n📊 === BALANCE AFTER DEPOSIT ===');
      const initialBalance = await getUserRLUSDPlusBalance(client, MPTokenID, userWallet.address);
      console.log(`👤 User: ${initialBalance} RLUSD+`);
      
      // 5. Genesis distributes yield
      console.log('\n🎁 === YIELD DISTRIBUTION ===');
      const yieldAmount = 20;
      console.log(`🏦 Genesis will distribute ${yieldAmount} RLUSD as yield`);
      
      await distributeYield(client, vaultId, MPTokenID, genesisWallet, yieldAmount, rlusdIssuer);
      
      // 6. Check balance after yield
      console.log('\n📊 === BALANCE AFTER YIELD ===');
      clearHoldersCache();
      const balanceAfterYield = await getUserRLUSDPlusBalance(client, MPTokenID, userWallet.address);
      const yieldReceived = balanceAfterYield - initialBalance;
      console.log(`👤 User: ${initialBalance} → ${balanceAfterYield} RLUSD+ (+${yieldReceived})`);
      
      // 7. User withdraws part of their RLUSD+
      console.log('\n🔄 === WITHDRAW TEST ===');
      const withdrawAmount = 30; // Withdraw 30 RLUSD+
      console.log(`👤 User will withdraw ${withdrawAmount} RLUSD+ for RLUSD`);
      
      try {
        const withdrawResult = await withdrawRLUSD(client, vaultId, MPTokenID, userWallet, withdrawAmount);
        console.log('✅ Withdrawal successful!');
        console.log(`🔥 ${withdrawResult.rlusdPlusBurned} RLUSD+ burned`);
        console.log(`📝 Transaction: ${withdrawResult.transactionHash}`);
      } catch (error) {
        console.error('❌ Withdraw error:', error.message);
      }
      
      // 8. Check final balance
      console.log('\n📊 === BALANCE AFTER WITHDRAW ===');
      clearHoldersCache();
      const finalBalance = await getUserRLUSDPlusBalance(client, MPTokenID, userWallet.address);
      const balanceChange = finalBalance - balanceAfterYield;
      console.log(`👤 User: ${balanceAfterYield} → ${finalBalance} RLUSD+ (${balanceChange})`);
      
      // 9. Complete summary
      console.log(`\n✅ === COMPLETE SUMMARY ===`);
      console.log(`📊 Initial deposit: ${initialBalance} RLUSD+`);
      console.log(`🎁 Yield received: +${yieldReceived} RLUSD+`);
      console.log(`🔄 Withdrawal made: -${withdrawAmount} RLUSD+`);
      console.log(`📊 Final balance: ${finalBalance} RLUSD+`);
      console.log(`📈 Net gain: ${finalBalance - initialBalance} RLUSD+ (+${((finalBalance - initialBalance) / initialBalance * 100).toFixed(1)}%)`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    await client.disconnect();
}

// Run the test
testWithdraw(); 