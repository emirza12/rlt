# Intégration GemWallet pour XRPL Local

Ce projet inclut une intégration complète de GemWallet pour votre réseau XRPL local (`wss://localhost:6009`) avec support des certificats auto-générés.

## 🚀 Fonctionnalités

- ✅ **Connexion GemWallet** avec votre réseau XRPL local
- ✅ **Support des certificats auto-signés** depuis votre conteneur Docker rippled
- ✅ **Récupération du solde XRP** en temps réel
- ✅ **Envoi de paiements XRP** via GemWallet
- ✅ **Signature de messages** pour l'authentification
- ✅ **Interface utilisateur intuitive** avec instructions de configuration
- ✅ **Scripts de test** pour vérifier la connectivité

## 📦 Composants créés

### 1. Composant principal
- **`components/GemWalletConnect.vue`** - Interface de connexion GemWallet
- **`composables/useGemWallet.ts`** - Logique métier et gestion d'état

### 2. Page de démonstration
- **`pages/gemwallet-demo.vue`** - Page complète de test et démonstration

### 3. Documentation
- **`docs/gemwallet-local-setup.md`** - Guide détaillé de configuration
- **`scripts/test-xrpl-connection.js`** - Script de test de connectivité

## 🛠️ Installation et configuration

### 1. Prérequis installés
```bash
npm install @gemwallet/api  # ✅ Déjà installé
```

### 2. Extension GemWallet
1. Visitez [gemwallet.app](https://gemwallet.app)
2. Installez l'extension navigateur
3. Créez ou importez un wallet

### 3. Configuration du réseau local

#### A. Accepter les certificats auto-signés
```bash
# 1. Ouvrez votre navigateur et visitez:
https://localhost:6009

# 2. Acceptez l'avertissement de sécurité
# 3. Cliquez sur "Avancé" puis "Continuer vers localhost (non sécurisé)"
```

#### B. Configurer GemWallet
1. **Ouvrez l'extension GemWallet**
2. **Paramètres** > **Réseaux** > **Ajouter un réseau**
3. **Configuration** :
   - Nom : `Local Development`
   - URL WebSocket : `wss://localhost:6009`
   - Description : `Local XRPL Network`
4. **Sélectionnez** le réseau local

## 🎮 Utilisation

### Test de connectivité XRPL
```bash
# Test basique de connexion
npm run test:xrpl

# Test avec vérification du solde d'un compte
npm run test:xrpl rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
```

### Page de démonstration
```bash
# Démarrer le serveur de développement
npm run dev

# Visitez: http://localhost:3000/gemwallet-demo
```

### Utilisation du composant

```vue
<template>
  <div>
    <!-- Composant de connexion -->
    <GemWalletConnect @connected="onWalletConnected" />
    
    <!-- Utilisation du composable -->
    <div v-if="gemWallet.isConnected.value">
      <p>Adresse: {{ gemWallet.address.value }}</p>
      <p>Solde: {{ gemWallet.balance.value }} XRP</p>
      <button @click="refreshBalance">Actualiser le solde</button>
    </div>
  </div>
</template>

<script setup>
import { gemWallet } from '~/composables/useGemWallet'

const onWalletConnected = (address) => {
  console.log('Wallet connecté:', address)
}

const refreshBalance = async () => {
  await gemWallet.refreshBalance()
}
</script>
```

### API du composable

```typescript
// État
gemWallet.isConnected.value          // boolean
gemWallet.address.value              // string
gemWallet.balance.value              // string | null
gemWallet.currentNetwork.value       // string
gemWallet.isLocalNetwork.value       // boolean

// Méthodes
await gemWallet.connect()            // Connecter le wallet
await gemWallet.disconnect()         // Déconnecter
await gemWallet.fetchBalance(addr)   // Récupérer le solde
await gemWallet.refreshBalance()     // Actualiser le solde
await gemWallet.sendXRP(dest, amount, tag?) // Envoyer XRP
await gemWallet.signMessageData(msg) // Signer un message
```

## 🔧 Configuration Docker rippled

Assurez-vous que votre configuration rippled inclut :

```json
{
  "server": [
    {
      "port": 6009,
      "ip": "0.0.0.0",
      "protocol": ["https", "ws2"],
      "ssl_key": "/etc/ssl/private/server.key",
      "ssl_cert": "/etc/ssl/certs/server.crt",
      "ssl_chain": "/etc/ssl/certs/server.crt"
    }
  ],
  "ssl_verify": false
}
```

## 🚨 Résolution des problèmes

### Erreur : "GemWallet extension not found"
- Installez l'extension GemWallet
- Actualisez la page après installation

### Erreur : "Certificate not trusted"
- Visitez `https://localhost:6009` dans votre navigateur
- Acceptez le certificat auto-signé
- Redémarrez le navigateur

### Erreur : "Network not available"
- Vérifiez que rippled fonctionne sur le port 6009
- Testez avec : `npm run test:xrpl`

### Erreur : "Account not found"
- Compte non financé (normal pour les nouveaux comptes)
- Financez avec au moins 10 XRP pour l'activer

## 🎯 Fonctionnalités testables

1. **Connexion wallet** ✅
2. **Affichage du solde** ✅
3. **Envoi de paiements** ✅
4. **Signature de messages** ✅
5. **Gestion des erreurs** ✅
6. **Interface responsive** ✅

## 📁 Structure des fichiers

```
├── components/
│   └── GemWalletConnect.vue      # Composant de connexion
├── composables/
│   └── useGemWallet.ts           # Logique métier
├── pages/
│   └── gemwallet-demo.vue        # Page de démonstration
├── docs/
│   └── gemwallet-local-setup.md  # Guide détaillé
├── scripts/
│   └── test-xrpl-connection.js   # Script de test
└── README-GemWallet.md          # Ce fichier
```

## 🔒 Sécurité

⚠️ **Important** : Cette configuration est uniquement pour le développement local.

- Les certificats auto-signés ne doivent jamais être utilisés en production
- Les clés privées ne quittent jamais GemWallet
- Toutes les transactions sont signées localement

## 🆘 Support

- **Documentation GemWallet** : [gemwallet.app/docs](https://gemwallet.app/docs)
- **Documentation XRPL** : [xrpl.org](https://xrpl.org)
- **Rippled Docker** : [hub.docker.com/r/rippleci/rippled](https://hub.docker.com/r/rippleci/rippled)

---

**Prêt à tester !** 🚀

Visitez `/gemwallet-demo` dans votre application pour commencer à utiliser GemWallet avec votre réseau XRPL local. 