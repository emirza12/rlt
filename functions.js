// ✅ SIMPLE - Créer un vault RLUSD+
export async function createRLUSDPlusVault(client, managerWallet, rlusdIssuer) {
    console.log('🏗️ Création du Vault RLUSD+...');
    
    const vaultCreateTx = {
      TransactionType: 'VaultCreate',
      Account: managerWallet.address,
      Asset: {
        currency: '524C555344000000000000000000000000000000',
        issuer: rlusdIssuer
      },
      MPTokenMetadata: Buffer.from(JSON.stringify({
        name: "RLUSD Plus",
        symbol: "RLUSD+",
        description: "Rebasing RLUSD with Treasury yield"
      })).toString('hex'),
      WithdrawalPolicy: 1,
      Flags: 0,
    };

    try {
      // 2. ✅ AUTOFILL calcule automatiquement Fee, Sequence, LastLedgerSequence
      console.log('🔄 Calcul automatique des fees et sequence...');
      const prepared = await client.autofill(vaultCreateTx);
      
      console.log('📊 Transaction préparée:', {
        Fee: prepared.Fee,
        Sequence: prepared.Sequence,
        LastLedgerSequence: prepared.LastLedgerSequence
      });
  
      // 3. Signer la transaction préparée
      const signed = managerWallet.sign(prepared);
      
      // 4. Soumettre et attendre
      const result = await client.submitAndWait(signed.tx_blob);
      
      if (result.result.meta.TransactionResult === 'tesSUCCESS') {
        // Chercher dynamiquement le node Vault au lieu d'utiliser l'index fixe [4]
        const vaultNode = result.result.meta.AffectedNodes.find(node => 
          node.CreatedNode && node.CreatedNode.LedgerEntryType === 'Vault'
        );
        
        if (vaultNode) {
          console.log('🔍 Structure complète du vaultNode:', JSON.stringify(vaultNode, null, 2));
          const vaultId = vaultNode.CreatedNode.LedgerIndex;
          const MPTokenID = vaultNode.CreatedNode.NewFields.ShareMPTID;
          console.log('✅ Vault créé! ID:', vaultId);
          console.log('🪙 MPTokenID récupéré:', MPTokenID);
          return {vaultId: vaultId, MPTokenID: MPTokenID};
        } else {
          console.error('❌ Impossible de trouver le Vault dans les AffectedNodes');
          throw new Error('Vault node non trouvé dans la réponse');
        }
      } else {
        console.error('❌ Échec:', result.result.meta.TransactionResult);
        throw new Error(`Échec création vault: ${result.result.meta.TransactionResult}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error.message);
      throw error;
    }
  
  };

// ✅ NOUVEAU - Créer un RLUSD séparé avec un issuer différent
export async function createSeparateRLUSD(client, issuerWallet, genesisWallet, initialSupply = 10000000) {
  console.log('🏦 Création d\'un RLUSD séparé...');
  
  const RLUSD_CURRENCY_CODE = '524C555344000000000000000000000000000000'; // "RLUSD" en hex
  
  try {
    // 1. Activer Default Ripple sur l'issuer
    console.log('⚙️ Configuration de l\'issuer...');
    const accountSetTx = {
      TransactionType: "AccountSet",
      Account: issuerWallet.address,
      SetFlag: 8 // Default Ripple
    };
    
    const prepared = await client.autofill(accountSetTx);
    const signed = issuerWallet.sign(prepared);
    await client.submitAndWait(signed.tx_blob);
    console.log('✅ Default Ripple activé');

    // 2. Créer une trustline du genesis vers l'issuer
    console.log('🤝 Création de la trustline...');
    const trustlineTx = {
      TransactionType: "TrustSet",
      Account: genesisWallet.address,
      LimitAmount: {
        currency: RLUSD_CURRENCY_CODE,
        issuer: issuerWallet.address,
        value: initialSupply.toString()
      }
    };
    
    const preparedTrust = await client.autofill(trustlineTx);
    const signedTrust = genesisWallet.sign(preparedTrust);
    await client.submitAndWait(signedTrust.tx_blob);
    console.log('✅ Trustline créée');

    // 3. Émettre les tokens RLUSD vers le genesis
    console.log(`💰 Émission de ${initialSupply} RLUSD vers Genesis...`);
    const issueTx = {
      TransactionType: "Payment",
      Account: issuerWallet.address,
      Destination: genesisWallet.address,
      Amount: {
        currency: RLUSD_CURRENCY_CODE,
        issuer: issuerWallet.address,
        value: initialSupply.toString()
      }
    };
    
    const preparedIssue = await client.autofill(issueTx);
    const signedIssue = issuerWallet.sign(preparedIssue);
    const result = await client.submitAndWait(signedIssue.tx_blob);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      console.log('✅ RLUSD séparé créé avec succès!');
      console.log(`🏦 Issuer: ${issuerWallet.address}`);
      console.log(`💰 Genesis balance: ${initialSupply} RLUSD`);
      
      return {
        issuerAddress: issuerWallet.address,
        currencyCode: RLUSD_CURRENCY_CODE,
        initialSupply: initialSupply,
        genesisBalance: initialSupply
      };
    } else {
      throw new Error(`Échec création RLUSD: ${result.result.meta.TransactionResult}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du RLUSD séparé:', error.message);
    throw error;
  }
}

// ✅ NOUVEAU - Créer une trustline pour recevoir du RLUSD
export async function createRLUSDTrustline(client, userWallet, rlusdIssuer, limit = 1000000) {
  console.log(`🤝 Création trustline RLUSD pour ${userWallet.address}...`);
  
  const RLUSD_CURRENCY_CODE = '524C555344000000000000000000000000000000';
  
  const trustlineTx = {
    TransactionType: "TrustSet",
    Account: userWallet.address,
    LimitAmount: {
      currency: RLUSD_CURRENCY_CODE,
      issuer: rlusdIssuer,
      value: limit.toString()
    }
  };
  
  try {
    const prepared = await client.autofill(trustlineTx);
    const signed = userWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
      console.log('✅ Trustline RLUSD créée');
      return { success: true, limit: limit };
    } else {
      throw new Error(`Échec trustline: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error('❌ Erreur création trustline:', error.message);
    throw error;
  }
}

// ✅ UTILITAIRE - Arrondir un montant à un nombre de décimales spécifique
function roundAmount(amount, decimals = 6) {
  // Pour les MPTokens, XRPL n'accepte que des entiers
  // Arrondir au nombre entier le plus proche
  let rounded = Math.round(amount);
  
  // S'assurer qu'on a au moins 1 unité pour éviter les montants zéro
  const minAmount = 1;
  if (rounded > 0 && rounded < minAmount) {
    rounded = minAmount;
  }
  
  return rounded;
}

// ✅ UTILITAIRE - Convertir un montant en string avec précision fixe pour XRPL
function formatAmountForTransaction(amount, decimals = 6) {
  const rounded = roundAmount(amount, decimals);
  
  if (rounded === 0) {
    return "0";
  }
  
  // Pour les MPTokens, retourner simplement l'entier comme string
  return rounded.toString();
}

// ✅ NOUVEAU - Envoyer du RLUSD d'un wallet à un autre
export async function sendRLUSD(client, fromWallet, toAddress, amount, rlusdIssuer) {
  // Arrondir le montant avant l'envoi
  const roundedAmount = roundAmount(amount, 6);
  console.log(`💸 Envoi de ${roundedAmount} RLUSD à ${toAddress}...`);
  
  const RLUSD_CURRENCY_CODE = '524C555344000000000000000000000000000000';
  
  const paymentTx = {
    TransactionType: "Payment",
    Account: fromWallet.address,
    Destination: toAddress,
    Amount: {
      currency: RLUSD_CURRENCY_CODE,
      issuer: rlusdIssuer,
      value: formatAmountForTransaction(roundedAmount)
    }
  };
  
  try {
    const prepared = await client.autofill(paymentTx);
    const signed = fromWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
      console.log('✅ RLUSD envoyé');
      return { success: true, amount: roundedAmount };
    } else {
      throw new Error(`Échec envoi RLUSD: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error('❌ Erreur envoi RLUSD:', error.message);
    throw error;
  }
}

// ✅ SIMPLE - Déposer RLUSD et recevoir RLUSD+
export async function depositRLUSD(client, vaultId, userWallet, rlusdAmount, rlusdIssuer) {
  // Arrondir le montant avant le dépôt
  const roundedAmount = roundAmount(rlusdAmount, 6);
  console.log(`💰 Dépôt de ${roundedAmount} RLUSD`);
  
  const depositTx = {
    TransactionType: 'VaultDeposit',
    Account: userWallet.address,
    VaultID: vaultId,
    Amount: {
      currency: '524C555344000000000000000000000000000000',
      issuer: rlusdIssuer,
      value: formatAmountForTransaction(roundedAmount)
    }
  };

  const result = await client.submitAndWait(depositTx, { wallet: userWallet });
  
  if (result.result.meta.TransactionResult === 'tesSUCCESS') {
    console.log('✅ Dépôt réussi!');
    return {
      success: true,
      rlusdDeposited: roundedAmount,
      transactionHash: result.result.hash
    };
  }
  
  throw new Error('Échec dépôt');
}

// ✅ NOUVELLE STRATÉGIE - Distribuer les rendements via dépôt et redistribution
export async function distributeYield(client, vaultId, MPTokenID, genesisWallet, yieldInRLUSD, rlusdIssuer) {
  console.log(`🎯 Distribution de ${yieldInRLUSD} RLUSD en rendements`);
  
  // 1. Obtenir les holders actuels
  const holders = await getCachedHolders(client, MPTokenID);
  
  if (holders.length === 0) {
    console.log('⚠️ Aucun holder, pas de distribution');
    return;
  }

  // 2. Calculer la supply totale et proportions de chaque holder
  const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0);
  
  console.log(`💰 Yield de ${yieldInRLUSD} RLUSD pour ${holders.length} holders`);
  console.log(`💰 Supply totale actuelle: ${totalSupply} tokens`);

  // 3. Genesis dépose le yield en RLUSD dans le vault pour recevoir des RLUSD+
  console.log(`🏦 Genesis dépose ${yieldInRLUSD} RLUSD dans le vault...`);
  const depositResult = await depositRLUSD(client, vaultId, genesisWallet, yieldInRLUSD, rlusdIssuer);
  
  if (!depositResult.success) {
    throw new Error('Échec du dépôt de yield par Genesis');
  }

  console.log(`✅ Genesis a reçu ${depositResult.rlusdDeposited} RLUSD+ à redistribuer`);
  
  // 4. Calculer les montants à distribuer en s'assurant que le total ne dépasse pas ce qui est disponible
  const availableToDistribute = depositResult.rlusdDeposited; // Montant réellement déposé (arrondi)
  
  // Calculer les proportions et les montants entiers
  const distributions = holders.map(holder => {
    const holderProportion = holder.balance / totalSupply;
    const rawYieldForHolder = availableToDistribute * holderProportion;
    const roundedYieldForHolder = Math.floor(rawYieldForHolder); // Arrondi à l'entier inférieur
    
    return {
      address: holder.address,
      proportion: holderProportion,
      rawAmount: rawYieldForHolder,
      roundedAmount: roundedYieldForHolder
    };
  });
  
  // Calculer le total arrondi
  const totalRounded = distributions.reduce((sum, dist) => sum + dist.roundedAmount, 0);
  
  // Distribuer le reste aux holders avec les plus grandes proportions
  const remainder = availableToDistribute - totalRounded;
  if (remainder > 0) {
    // Trier par proportion décroissante pour donner le reste aux plus grands holders
    const sortedDistributions = [...distributions].sort((a, b) => b.proportion - a.proportion);
    for (let i = 0; i < remainder && i < sortedDistributions.length; i++) {
      const originalIndex = distributions.findIndex(d => d.address === sortedDistributions[i].address);
      distributions[originalIndex].roundedAmount += 1;
    }
  }

  // 5. Redistribuer les RLUSD+ aux holders
  console.log('🎁 Redistribution aux holders...');
  
  for (const distribution of distributions) {
    if (distribution.roundedAmount > 0) {
      const result = await sendRLUSDPlusToHolder(client, genesisWallet, distribution.address, distribution.roundedAmount, MPTokenID);
      if (result.selfPayment) {
        console.log(`💰 ${distribution.address}: +${distribution.roundedAmount} RLUSD+ (proportion: ${(distribution.proportion * 100).toFixed(1)}%) - Auto-distribution (Genesis garde ses tokens)`);
      } else {
        console.log(`💰 ${distribution.address}: +${distribution.roundedAmount} RLUSD+ (proportion: ${(distribution.proportion * 100).toFixed(1)}%)`);
      }
    } else {
      console.log(`⚠️ ${distribution.address}: aucun token à distribuer (proportion trop petite)`);
    }
  }

  const totalDistributed = distributions.reduce((sum, dist) => sum + dist.roundedAmount, 0);
  console.log(`✅ Distribution terminée! Total distribué: ${totalDistributed}/${availableToDistribute} RLUSD+`);
  
  return { 
    yieldDistributed: totalDistributed, 
    totalHolders: holders.length, 
    totalSupply: totalSupply,
    newTotalSupply: totalSupply + totalDistributed
  };
}

// ✅ Fonction pour envoyer des RLUSD+ d'un wallet à un autre
export async function sendRLUSDPlusToHolder(client, fromWallet, toAddress, amount, MPTokenID) {
  // Vérifier si on essaie d'envoyer à soi-même
  if (fromWallet.address === toAddress) {
    console.log(`⚠️ Pas d'envoi nécessaire: ${fromWallet.address} est déjà le destinataire`);
    return { success: true, amount: amount, selfPayment: true };
  }
  
  // Arrondir le montant avant l'envoi
  const roundedAmount = roundAmount(amount, 6);
  
  const paymentTx = {
    TransactionType: 'Payment',
    Account: fromWallet.address,
    Destination: toAddress,
    Amount: {
      mpt_issuance_id: MPTokenID,
      value: formatAmountForTransaction(roundedAmount)
    }
  };

  try {
    const prepared = await client.autofill(paymentTx);
    const signed = fromWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
      return { success: true, amount: roundedAmount };
    } else {
      throw new Error(`Échec envoi vers ${toAddress}: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error(`❌ Erreur envoi vers ${toAddress}:`, error.message);
    throw error;
  }
}

// ✅ SIMPLE - Mint des nouveaux tokens (rebasing)
export async function mintTokensForUser(client, vaultId, managerWallet, userAddress, amount) {
  const mintTx = {
    TransactionType: 'VaultSet',
    Account: managerWallet.address,
    VaultID: vaultId,
    Data: Buffer.from(JSON.stringify({
      operation: 'rebase_mint',
      recipient: userAddress,
      amount: amount,
      timestamp: Date.now()
    })).toString('hex')
  };

  const result = await client.submitAndWait(mintTx, { wallet: managerWallet });
  
  if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
    throw new Error(`Échec mint pour ${userAddress}`);
  }
}

// ✅ SIMPLE - Retirer RLUSD+ contre RLUSD
export async function withdrawRLUSD(client, vaultId, MPTokenID, userWallet, rlusdPlusAmount) {
  // Arrondir le montant avant le retrait
  const roundedAmount = roundAmount(rlusdPlusAmount, 6);
  console.log(`🔄 Retrait de ${roundedAmount} RLUSD+`);
  
  const withdrawTx = {
    TransactionType: 'VaultWithdraw',
    Account: userWallet.address,
    VaultID: vaultId,
    Amount: {
      mpt_issuance_id: MPTokenID,
      value: formatAmountForTransaction(roundedAmount)
    }
  };

  try {
    const prepared = await client.autofill(withdrawTx);
    const signed = userWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    
    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
      console.log('✅ Retrait réussi!');
      return {
        success: true,
        rlusdPlusBurned: roundedAmount,
        transactionHash: result.result.hash
      };
    } else {
      console.log(`❌ Échec retrait: ${result.result.meta.TransactionResult}`);
      throw new Error(`Échec retrait: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error('❌ Erreur retrait détaillée:', error.message);
    throw new Error(`Échec retrait: ${error.message}`);
  }
}

// ✅ SIMPLE - Obtenir tous les holders d'un MPToken
export async function getAllRLUSDPlusHolders(client, MPTokenID) {
  console.log(`🔍 Recherche des holders pour MPToken: ${MPTokenID}`);
  
  try {
    return await scanCompleteLedger(client, MPTokenID);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des holders:', error.message);
    return [];
  }
}

// Fonction principale pour scanner le ledger
async function scanCompleteLedger(client, MPTokenID) {
  console.log('🔄 Scan du ledger pour les MPTokens...');
  const holders = [];
  let marker = undefined;
  let pageCount = 0;
  
  try {
    do {
      pageCount++;
      console.log(`📄 Page ${pageCount}...`);
      
      const response = await client.request({
        command: 'ledger_data',
        ledger_index: 'validated',
        marker: marker,
        limit: 1000
      });
      
      const relevantTokens = response.result.state.filter(obj => 
        obj.LedgerEntryType === 'MPToken' && 
        obj.MPTokenIssuanceID === MPTokenID &&
        parseFloat(obj.MPTAmount || '0') > 0
      );
      
      console.log(`🎯 Page ${pageCount}: ${relevantTokens.length} holders trouvés`);
      
      relevantTokens.forEach(token => {
        holders.push({
          address: token.Account,
          balance: parseFloat(token.MPTAmount || '0'),
          flags: token.Flags || 0
        });
      });
      
      marker = response.result.marker;
      
      // Limite de sécurité
      if (pageCount > 100) {
        console.log('⚠️ Limite de 100 pages atteinte, arrêt');
        break;
      }
      
    } while (marker);
    
    console.log(`✅ Scan terminé: ${holders.length} holders trouvés sur ${pageCount} pages`);
    return holders;
    
  } catch (error) {
    console.error('❌ Erreur scan:', error.message);
    return [];
  }
}

// ✅ Cache pour éviter les requêtes répétées
const holdersCache = new Map();
const CACHE_DURATION = 30000; // 30 secondes

// ✅ UTILITAIRE - Vider le cache des holders
export function clearHoldersCache() {
  holdersCache.clear();
  console.log('🗑️ Cache des holders vidé');
}

export async function getCachedHolders(client, MPTokenID) {
  const cacheKey = `holders_${MPTokenID}`;
  const cached = holdersCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📋 Utilisation du cache');
    return cached.data;
  }
  
  console.log('🔄 Récupération des holders...');
  const holders = await getAllRLUSDPlusHolders(client, MPTokenID);
  
  holdersCache.set(cacheKey, {
    data: holders,
    timestamp: Date.now()
  });
  
  return holders;
}

// ✅ Fonction utilitaire pour obtenir la balance d'un holder spécifique
export async function getHolderBalance(client, MPTokenID, address) {
  const holders = await getCachedHolders(client, MPTokenID);
  const holder = holders.find(h => h.address === address);
  return holder ? holder.balance : 0;
}

// ✅ SIMPLE - Obtenir la balance d'un utilisateur (alias pour compatibilité)
export async function getUserRLUSDPlusBalance(client, MPTokenID, userAddress) {
  return await getHolderBalance(client, MPTokenID, userAddress);
}