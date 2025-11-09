// Service de paiement FedaPay
// Configuration des clés
const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_LnaNAMGms3R5LGOZrJg-N7m-'
const FEDAPAY_SECRET_KEY = import.meta.env.VITE_FEDAPAY_SECRET_KEY || 'sk_sandbox_46Y0uIx1R_aGt66QOE9qJ9ku'
const FEDAPAY_MODE = import.meta.env.VITE_FEDAPAY_MODE || 'sandbox'

console.log('🔑 FedaPay Configuration:', {
  hasPublicKey: !!FEDAPAY_PUBLIC_KEY,
  hasSecretKey: !!FEDAPAY_SECRET_KEY,
  publicKeyPrefix: FEDAPAY_PUBLIC_KEY?.substring(0, 20),
  mode: FEDAPAY_MODE,
})

// Base URL selon l'environnement
const getBaseUrl = () => {
  return FEDAPAY_MODE === 'sandbox'
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1'
}

// Headers pour les requêtes API
const getHeaders = () => ({
  'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
  'Content-Type': 'application/json',
})

/**
 * Initialise FedaPay
 * @returns {Promise<void>}
 */
export const initFedaPay = () => {
  if (typeof window === 'undefined') return Promise.resolve()

  return new Promise((resolve, reject) => {
    // Si déjà chargé
    if (window.FedaPay) {
      resolve()
      return
    }

    // Si le script est déjà présent, attendre qu'il charge
    const existingScript = document.getElementById('fedapay-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load FedaPay')))
      return
    }

    // Charger le script FedaPay
    const script = document.createElement('script')
    script.id = 'fedapay-script'
    script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
    script.async = true
    
    script.onload = () => {
      console.log('✅ FedaPay loaded successfully')
      resolve()
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load FedaPay script')
      reject(new Error('Failed to load FedaPay'))
    }
    
    document.body.appendChild(script)
  })
}

/**
 * Crée une transaction FedaPay via API REST
 * @param {Object} options - Options de la transaction
 * @returns {Promise<Object>} Résultat de la transaction avec l'URL de paiement
 */
export const createTransaction = async ({
  amount,
  description,
  customerId,
  customerEmail,
  customerName,
  customerPhone,
  callbackUrl,
  mobileMoneyOperator,
  onSuccess,
  onError,
  onClose,
}) => {
  try {
    // Vérifier que la clé secrète est configurée
    if (!FEDAPAY_SECRET_KEY || FEDAPAY_SECRET_KEY.length < 20) {
      throw new Error('Clé API FedaPay non configurée. Veuillez vérifier votre fichier .env')
    }

    console.log('💳 Creating FedaPay transaction...')

    const transactionData = {
      description: description || 'Réservation Bus Bénin',
      amount: amount,
      currency: {
        iso: 'XOF', // Franc CFA
      },
      customer: {
        firstname: customerName?.split(' ')[0] || 'Client',
        lastname: customerName?.split(' ').slice(1).join(' ') || 'BusBenin',
        email: customerEmail,
        phone_number: {
          number: customerPhone?.replace(/\s+/g, ''),
          country: 'BJ', // Bénin
        },
      },
    }

    // Ajouter le callback_url si fourni
    if (callbackUrl && (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://'))) {
      transactionData.callback_url = callbackUrl
    }

    // Ajouter le mode de paiement si l'opérateur est spécifié
    if (mobileMoneyOperator) {
      transactionData.mode = mobileMoneyOperator
    }

    console.log('📤 FedaPay Request:', {
      url: `${getBaseUrl()}/transactions`,
      environment: FEDAPAY_MODE,
      amount: transactionData.amount,
      customer: transactionData.customer,
    })

    const response = await fetch(`${getBaseUrl()}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transactionData),
    })

    const data = await response.json()

    console.log('📥 FedaPay Response:', {
      status: response.status,
      ok: response.ok,
      data,
    })

    if (!response.ok) {
      const errorMessage = data.message || data.error || data.v1?.message || 'Erreur lors de la création de la transaction'
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

    // FedaPay retourne les données dans "v1/transaction"
    const transaction = data['v1/transaction'] || data.transaction || data.v1?.transaction

    if (!transaction) {
      throw new Error('Transaction non retournée par FedaPay')
    }

    console.log('✅ Transaction created:', {
      id: transaction.id,
      status: transaction.status,
      hasToken: !!transaction.payment_token,
      hasUrl: !!transaction.payment_url,
    })

    // Générer l'URL de paiement
    const paymentUrl = getPaymentUrl(transaction.payment_url || transaction.payment_token)

    return {
      success: true,
      transaction: transaction,
      transactionId: transaction.id,
      token: transaction.payment_token,
      paymentUrl: paymentUrl,
      // Callbacks pour compatibilité
      onSuccess,
      onError,
      onClose,
    }
  } catch (error) {
    console.error('❌ Error creating transaction:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la création de la transaction',
    }
  }
}

/**
 * Ouvrir le lien de paiement FedaPay (nouvelle fenêtre ou redirection)
 * @param {string} paymentUrl - URL de paiement
 * @param {boolean} newWindow - Ouvrir dans une nouvelle fenêtre (true) ou rediriger (false)
 */
export const openPaymentUrl = (paymentUrl, newWindow = true) => {
  if (!paymentUrl) {
    console.error('❌ No payment URL provided')
    return
  }

  console.log('🔗 Opening payment URL:', paymentUrl)

  if (newWindow) {
    // Ouvrir dans une nouvelle fenêtre popup
    const width = 600
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    window.open(
      paymentUrl,
      'FedaPayPayment',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  } else {
    // Rediriger dans la même fenêtre
    window.location.href = paymentUrl
  }
}

/**
 * Générer le lien de paiement
 * @param {string} token - Token de la transaction OU l'URL complète
 * @returns {string} - URL de paiement
 */
export const getPaymentUrl = (token) => {
  // Si c'est déjà une URL complète, la retourner directement
  if (token?.startsWith('http://') || token?.startsWith('https://')) {
    return token
  }
  
  // Sinon, construire l'URL avec le token
  const baseUrl = FEDAPAY_MODE === 'sandbox' 
    ? 'https://sandbox-process.fedapay.com'
    : 'https://process.fedapay.com'
  return `${baseUrl}/${token}`
}

/**
 * Vérifie le statut d'une transaction
 * @param {string} transactionId - ID de la transaction
 * @returns {Promise<Object>} Statut de la transaction
 */
export const checkTransactionStatus = async (transactionId) => {
  try {
    if (!transactionId) {
      throw new Error('Transaction ID requis')
    }

    console.log('🔍 Checking transaction status:', transactionId)

    const response = await fetch(`${getBaseUrl()}/transactions/${transactionId}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la vérification de la transaction')
    }

    // FedaPay retourne les données dans "v1/transaction"
    const transaction = data['v1/transaction'] || data.transaction || data.v1?.transaction
    
    console.log('✅ Transaction status:', {
      id: transaction?.id,
      status: transaction?.status,
      approved: transaction?.status === 'approved',
    })

    return {
      success: true,
      status: transaction?.status, // 'pending', 'approved', 'declined', 'canceled'
      transaction,
    }
  } catch (error) {
    console.error('❌ Error checking transaction:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Formate un montant pour FedaPay
 * @param {number} amount - Montant en FCFA
 * @returns {number} Montant formaté
 */
export const formatAmount = (amount) => {
  return Math.round(amount)
}

/**
 * Options de paiement disponibles
 */
export const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  CARD: 'card',
  ALL: 'all',
}

/**
 * Opérateurs mobile money supportés au Bénin
 */
export const MOBILE_OPERATORS = {
  MTN: 'mtn',
  MOOV: 'moov',
}
