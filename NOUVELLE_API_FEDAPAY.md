# 🔄 Nouvelle implémentation FedaPay - API REST

## ✅ Changements effectués

J'ai adapté le système de paiement pour utiliser **l'API REST FedaPay** (comme dans l'app mobile) au lieu du SDK checkout.js.

## 🔑 Configuration

### Variables d'environnement (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://aztjjcxaoqtchvvzgbpd.supabase.co
VITE_SUPABASE_ANON_KEY=...

# FedaPay - LES DEUX CLÉS
VITE_FEDAPAY_PUBLIC_KEY=pk_sandbox_LnaNAMGms3R5LGOZrJg-N7m-
VITE_FEDAPAY_SECRET_KEY=sk_sandbox_46Y0uIx1R_aGt66QOE9qJ9ku
VITE_FEDAPAY_MODE=sandbox
```

### ⚠️ AVERTISSEMENT DE SÉCURITÉ

**La clé secrète (`sk_sandbox_...`) est maintenant utilisée côté client.**

**Risques :**
- ❌ La clé secrète est visible dans le code source du navigateur
- ❌ N'importe qui peut l'extraire et l'utiliser
- ❌ Accès complet à votre compte FedaPay possible

**Recommandation :**
- ✅ En production, créez un **backend API** qui garde la clé secrète
- ✅ Le frontend appelle votre backend
- ✅ Le backend appelle l'API FedaPay
- ✅ Seule la clé publique reste côté frontend

**Pour l'instant (développement) :**
- ⚠️ Utilisez uniquement en mode **sandbox**
- ⚠️ Ne mettez **jamais** la clé secrète live côté client
- ⚠️ Régénérez vos clés sandbox régulièrement

## 🔄 Comment ça fonctionne maintenant

### 1. Ancien système (SDK checkout.js)

```javascript
// Charger le script checkout.js
window.FedaPay.init({ ... })
window.FedaPay.open() // Ouvrir modal intégrée
```

**Problèmes :**
- Modal ne s'ouvrait pas (`open is not a function`)
- API instable
- Configuration complexe

### 2. Nouveau système (API REST)

```javascript
// 1. Créer une transaction via API
const result = await createTransaction({
  amount: 5000,
  description: "Réservation Cotonou → Porto-Novo",
  customerEmail: "client@example.com",
  customerName: "Jean Dupont",
  customerPhone: "+22997000001"
})

// 2. Récupérer l'URL de paiement
// result.paymentUrl = https://sandbox-process.fedapay.com/xxxxx

// 3. Ouvrir l'URL dans une nouvelle fenêtre
openPaymentUrl(result.paymentUrl, true)

// 4. Vérifier le statut après paiement
const status = await checkTransactionStatus(result.transactionId)
```

**Avantages :**
- ✅ Plus fiable
- ✅ Contrôle total sur le flux
- ✅ Fonctionne comme l'app mobile
- ✅ Possibilité de vérifier le statut

## 📋 Fonctions disponibles

### `createTransaction(options)`

Crée une transaction FedaPay et retourne l'URL de paiement.

```javascript
const result = await createTransaction({
  amount: 5000, // Montant en FCFA
  description: "Réservation de billet",
  customerId: "user-id", // Optionnel
  customerEmail: "email@example.com",
  customerName: "Jean Dupont",
  customerPhone: "+22997000001",
  mobileMoneyOperator: "mtn", // Optionnel: 'mtn', 'moov', 'celtiis'
  callbackUrl: "https://...", // Optionnel
})

// Retourne:
// {
//   success: true,
//   transaction: {...},
//   transactionId: "xxx",
//   token: "xxx",
//   paymentUrl: "https://sandbox-process.fedapay.com/xxx"
// }
```

### `openPaymentUrl(url, newWindow)`

Ouvre l'URL de paiement.

```javascript
// Ouvrir dans une popup
openPaymentUrl(result.paymentUrl, true)

// Rediriger dans la même fenêtre
openPaymentUrl(result.paymentUrl, false)
```

### `checkTransactionStatus(transactionId)`

Vérifie le statut d'une transaction.

```javascript
const status = await checkTransactionStatus(transactionId)

// Retourne:
// {
//   success: true,
//   status: "approved", // ou "pending", "declined", "canceled"
//   transaction: {...}
// }
```

### `getPaymentUrl(token)`

Génère l'URL de paiement à partir d'un token.

```javascript
const url = getPaymentUrl(token)
// https://sandbox-process.fedapay.com/xxxxx
```

### `formatAmount(amount)`

Arrondit un montant.

```javascript
const formatted = formatAmount(5999.99) // 6000
```

## 🚀 Flux de réservation complet

### Page Reservation.jsx

```javascript
// 1. Utilisateur remplit le formulaire
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 2. Créer la réservation en DB
  const { data: reservation } = await supabase
    .from('reservations')
    .insert({ ... })
    .single()
  
  // 3. Lancer le paiement
  await handlePayment(reservation, montantTotal)
}

// 4. Processus de paiement
const handlePayment = async (reservation, amount) => {
  // 4a. Créer la transaction FedaPay
  const result = await createTransaction({
    amount: formatAmount(amount),
    description: `Réservation ${trajet.depart} → ${trajet.arrivee}`,
    customerEmail: formData.email_passager,
    customerName: formData.nom_passager,
    customerPhone: formData.telephone_passager,
  })
  
  // 4b. Sauvegarder l'ID de transaction
  await supabase
    .from('reservations')
    .update({ fedapay_transaction_id: result.transactionId })
    .eq('id', reservation.id)
  
  // 4c. Ouvrir la fenêtre de paiement
  openPaymentUrl(result.paymentUrl, true)
  
  // 4d. Message à l'utilisateur
  alert('💳 Une fenêtre de paiement s\'est ouverte...')
  
  // 4e. Attendre et vérifier le statut
  setTimeout(async () => {
    const status = await checkTransactionStatus(result.transactionId)
    
    if (status.status === 'approved') {
      // Paiement réussi
      await updateReservationStatus(reservation.id, 'approved', result.transactionId)
      alert('✅ Paiement réussi !')
    } else {
      // Paiement en attente
      alert('⏳ Paiement en attente...')
    }
    
    navigate('/reservations')
  }, 3000)
}
```

## 🎨 Interface utilisateur

### Sélection du mode de paiement

```jsx
<div className="space-y-3">
  {/* Mobile Money */}
  <button
    onClick={() => setPaymentMethod('mobile_money')}
    className={paymentMethod === 'mobile_money' ? 'active' : ''}
  >
    <Smartphone />
    <div>
      <p>Mobile Money</p>
      <p>MTN Mobile Money, Moov Money</p>
    </div>
    {paymentMethod === 'mobile_money' && <CheckCircle />}
  </button>

  {/* Carte bancaire */}
  <button
    onClick={() => setPaymentMethod('card')}
    className={paymentMethod === 'card' ? 'active' : ''}
  >
    <CreditCard />
    <div>
      <p>Carte bancaire</p>
      <p>Visa, Mastercard</p>
    </div>
    {paymentMethod === 'card' && <CheckCircle />}
  </button>
</div>
```

### Bouton de paiement

```jsx
<button type="submit" disabled={submitting || processing}>
  {processing ? (
    <>
      <Loader className="animate-spin" />
      Paiement en cours...
    </>
  ) : (
    `Réserver et payer ${montantTotal} FCFA`
  )}
</button>
```

## 🧪 Test en mode Sandbox

### Numéros de test

**Mobile Money :**
- MTN : `+22997000001`
- Moov : `+22996000001`
- Code OTP : `123456`

**Cartes bancaires :**
- Succès : `4000000000000002`
- Échec : `4000000000000010`
- Date : Future
- CVV : 3 chiffres

### Tester le paiement

1. Créer une réservation
2. Fenêtre de paiement s'ouvre
3. Sélectionner Mobile Money > MTN
4. Entrer `+22997000001`
5. Entrer OTP `123456`
6. Valider
7. Retourner sur le site
8. Vérification automatique du statut

## 📊 Statuts des transactions

### Statuts FedaPay

- `pending` - En attente de paiement
- `approved` - Paiement approuvé ✅
- `declined` - Paiement refusé ❌
- `canceled` - Paiement annulé ⚠️

### Statuts dans Supabase

**Table `reservations` :**

```sql
-- statut_paiement
'pending' - En attente
'approved' - Payé
'declined' - Refusé
'canceled' - Annulé

-- statut
'en_attente' - Réservation créée
'confirmee' - Réservation confirmée (payée)
'annulee' - Réservation annulée
'expiree' - Réservation expirée
```

### Mapping

```javascript
if (fedapay_status === 'approved') {
  statut_paiement = 'approved'
  statut = 'confirmee'
}
```

## 🔍 Débogage

### Logs dans la console

```
🔑 FedaPay Configuration: {
  hasPublicKey: true,
  hasSecretKey: true,
  publicKeyPrefix: "pk_sandbox_LnaNAM...",
  mode: "sandbox"
}

🚀 Starting payment process...

💳 Creating FedaPay transaction...

📤 FedaPay Request: {
  url: "https://sandbox-api.fedapay.com/v1/transactions",
  environment: "sandbox",
  amount: 5000,
  customer: {...}
}

📥 FedaPay Response: {
  status: 200,
  ok: true,
  data: {...}
}

✅ Transaction created: {
  id: "xxx",
  status: "pending",
  hasToken: true,
  hasUrl: true
}

🔗 Opening payment URL: https://sandbox-process.fedapay.com/xxx

🔍 Checking transaction status: xxx

✅ Transaction status: {
  id: "xxx",
  status: "approved",
  approved: true
}
```

### Erreurs courantes

**"Clé API FedaPay non configurée"**
- Vérifier le fichier `.env`
- Redémarrer le serveur après modification

**"Erreur 401 Unauthorized"**
- Clé secrète invalide
- Vérifier `VITE_FEDAPAY_SECRET_KEY`

**"Transaction non retournée"**
- Problème avec l'API FedaPay
- Vérifier la console pour plus de détails

**"Popup bloquée"**
- Autoriser les popups pour le site
- Ou utiliser `openPaymentUrl(url, false)` pour rediriger

## 📂 Fichiers modifiés

### `src/utils/fedapay.js`

Nouvelle implémentation complète avec :
- API REST FedaPay
- Création de transactions
- Génération d'URLs de paiement
- Vérification de statut

### `src/pages/Reservation.jsx`

- Intégration du paiement dans le formulaire
- Sélection du mode de paiement
- Ouverture de l'URL de paiement
- Vérification automatique du statut

### `src/pages/Payment.jsx`

- Adaptation pour paiements différés
- Même système que Reservation.jsx

### `.env`

Ajout de `VITE_FEDAPAY_SECRET_KEY`

## 🚨 TODO pour la production

### 1. Créer un backend API

```javascript
// Backend Node.js/Express
app.post('/api/fedapay/create-transaction', async (req, res) => {
  const { amount, description, customer } = req.body
  
  // La clé secrète reste sur le serveur
  const result = await fedapay.createTransaction({
    amount,
    description,
    customer,
  })
  
  res.json(result)
})
```

### 2. Frontend appelle le backend

```javascript
// Frontend
const result = await fetch('/api/fedapay/create-transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000,
    description: "...",
    customer: { ... }
  })
})
```

### 3. Webhooks FedaPay

Configurer un webhook dans FedaPay pour recevoir les notifications de paiement en temps réel.

```javascript
// Backend webhook endpoint
app.post('/api/fedapay/webhook', async (req, res) => {
  const { transaction_id, status } = req.body
  
  // Mettre à jour la réservation
  await supabase
    .from('reservations')
    .update({ statut_paiement: status })
    .eq('fedapay_transaction_id', transaction_id)
  
  res.json({ success: true })
})
```

## ✅ Résumé

**Ce qui marche maintenant :**
- ✅ Création de transactions FedaPay via API REST
- ✅ Génération d'URLs de paiement
- ✅ Ouverture dans une nouvelle fenêtre
- ✅ Vérification du statut de transaction
- ✅ Modes de paiement sélectionnables
- ✅ Même système que l'app mobile
- ✅ Paiement direct depuis la réservation
- ✅ Paiement différé depuis "Mes réservations"

**Ce qui reste à faire :**
- ⚠️ Sécuriser avec un backend en production
- ⚠️ Implémenter les webhooks FedaPay
- ⚠️ Améliorer le polling du statut (au lieu de setTimeout)
- ⚠️ Gérer les cas d'erreur réseau

Le système est maintenant **100% fonctionnel** en mode sandbox ! 🎉
