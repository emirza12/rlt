# GemWallet Local XRPL Setup Guide

Ce guide vous explique comment configurer GemWallet pour votre réseau XRPL local avec des certificats auto-générés.

## Prérequis

1. **Rippled Docker** en cours d'exécution sur `localhost:6009` avec WSS activé
2. **Extension GemWallet** installée dans votre navigateur
3. **Certificats auto-générés** dans votre conteneur Docker rippled

## Configuration étape par étape

### 1. Installation de GemWallet

1. Visitez [https://gemwallet.app/](https://gemwallet.app/)
2. Téléchargez et installez l'extension pour votre navigateur
3. Créez ou importez un wallet

### 2. Accepter les certificats auto-générés

Avant de configurer GemWallet, vous devez accepter les certificats SSL auto-générés :

1. **Ouvrez votre navigateur** et naviguez vers `https://localhost:6009`
2. **Acceptez l'avertissement de sécurité** :
   - Cliquez sur "Avancé" ou "Advanced"
   - Cliquez sur "Continuer vers localhost (non sécurisé)" ou "Proceed to localhost (unsafe)"
3. **Vous devriez voir** une réponse JSON ou une erreur de rippled (c'est normal)

Cette étape est cruciale car elle permet à votre navigateur (et donc à GemWallet) de faire confiance au certificat auto-généré.

### 3. Configuration du réseau personnalisé dans GemWallet

1. **Ouvrez l'extension GemWallet**
2. **Accédez aux paramètres** (icône d'engrenage)
3. **Ajoutez un réseau personnalisé** :
   - **Nom du réseau** : `Local Development`
   - **URL WebSocket** : `wss://localhost:6009`
   - **Description** : `Local XRPL Network for Development`

4. **Sauvegardez** la configuration
5. **Sélectionnez** le réseau local dans la liste des réseaux

### 4. Test de la connexion

1. Ouvrez l'application de démonstration : [http://localhost:3000/gemwallet-demo](http://localhost:3000/gemwallet-demo)
2. Cliquez sur "Connect GemWallet"
3. Autorisez la connexion dans l'extension GemWallet

## Configuration Docker rippled

Assurez-vous que votre configuration rippled inclut les paramètres WSS appropriés :

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
  "ssl_verify": false,
  "ssl_verify_file": "",
  "ssl_verify_dir": ""
}
```

## Génération des certificats auto-signés

Si vous devez générer de nouveaux certificats pour votre conteneur Docker :

```bash
# Dans votre conteneur Docker rippled
openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/private/server.key -out /etc/ssl/certs/server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Résolution des problèmes

### Erreur : "Certificate not trusted"
- Assurez-vous d'avoir accepté le certificat via `https://localhost:6009`
- Redémarrez votre navigateur après avoir accepté le certificat

### Erreur : "Network not available"
- Vérifiez que rippled est en cours d'exécution sur le port 6009
- Vérifiez que les paramètres WSS sont correctement configurés
- Assurez-vous que le port 6009 est exposé dans votre configuration Docker

### GemWallet ne se connecte pas
- Vérifiez que l'extension est installée et activée
- Assurez-vous d'avoir sélectionné le bon réseau dans GemWallet
- Vérifiez la console du navigateur pour les erreurs

### Erreur : "Account not found"
- C'est normal pour les nouveaux comptes sur un réseau local
- Vous devez financer le compte avec au moins 10 XRP pour l'activer
- Utilisez la console rippled ou un faucet local pour financer le compte

## Fonctionnalités testables

Une fois connecté, vous pouvez tester :

1. **Connexion du wallet** - Affichage de l'adresse et de la clé publique
2. **Envoi de paiements XRP** - Transactions vers d'autres adresses
3. **Signature de messages** - Authentification cryptographique
4. **Transactions personnalisées** - Soumission de transactions XRPL

## Support

Pour plus d'informations :
- [Documentation GemWallet](https://gemwallet.app/docs)
- [Documentation XRPL](https://xrpl.org/)
- [Rippled Docker](https://hub.docker.com/r/rippleci/rippled)

## Notes de sécurité

⚠️ **Attention** : Cette configuration est uniquement pour le développement local. N'utilisez jamais de certificats auto-signés ou de configurations non sécurisées en production. 