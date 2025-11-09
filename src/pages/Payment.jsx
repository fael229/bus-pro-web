import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Smartphone, CheckCircle, XCircle, Loader, Shield, ExternalLink } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'
import { createTransaction, openPaymentUrl, formatAmount, checkTransactionStatus } from '../utils/fedapay'

export default function Payment() {
  const { id } = useParams() // reservation ID
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session } = useSession()
  
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // null, 'success', 'error'
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')

  useEffect(() => {
    loadReservation()
  }, [id])

  const loadReservation = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, trajets(*, compagnies:compagnie_id(nom))')
        .eq('id', id)
        .eq('user_id', session?.user?.id)
        .single()

      if (error) throw error

      // Vérifier que la réservation est en attente de paiement
      if (data.statut_paiement !== 'pending') {
        navigate('/reservations')
        return
      }

      setReservation(data)
    } catch (error) {
      console.error('Error loading reservation:', error)
      navigate('/reservations')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    setPaymentStatus(null)

    try {
      const amount = formatAmount(reservation.montant_total)

      console.log('🚀 Starting payment process...')

      // Créer la transaction FedaPay
      const result = await createTransaction({
        amount: amount,
        description: `Réservation ${reservation.trajets.depart} → ${reservation.trajets.arrivee}`,
        customerId: session.user.id,
        customerEmail: reservation.email_passager,
        customerName: reservation.nom_passager,
        customerPhone: reservation.telephone_passager,
        mobileMoneyOperator: paymentMethod === 'mobile_money' ? 'mtn' : undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de la transaction')
      }

      console.log('✅ Transaction created:', result.transactionId)

      // Sauvegarder l'ID de transaction
      await supabase
        .from('reservations')
        .update({
          fedapay_transaction_id: result.transactionId,
        })
        .eq('id', id)

      // Ouvrir le lien de paiement
      openPaymentUrl(result.paymentUrl, true)

      // Afficher un message
      alert('💳 Une fenêtre de paiement s\'est ouverte.\n\nAprès avoir payé, revenez sur cette page.')

      // Vérifier le statut après un délai
      setTimeout(async () => {
        const statusCheck = await checkTransactionStatus(result.transactionId)
        
        if (statusCheck.success && statusCheck.status === 'approved') {
          await updateReservationStatus('approved', result.transactionId)
          setPaymentStatus('success')
          setTimeout(() => navigate('/reservations'), 2000)
        } else {
          setPaymentStatus('error')
          alert('⏳ Paiement en attente ou échoué. Vérifiez votre transaction.')
        }
        
        setProcessing(false)
      }, 3000)

    } catch (error) {
      console.error('❌ Payment error:', error)
      setPaymentStatus('error')
      alert(`❌ Erreur : ${error.message}`)
      setProcessing(false)
    }
  }

  // Mode démo pour tester sans FedaPay (enlever en production)
  const handlePaymentDemo = async () => {
    setProcessing(true)
    setPaymentStatus(null)

    try {
      console.log('🧪 Mode DEMO - Simulation de paiement')
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Marquer comme payé
      const demoTransactionId = 'demo-' + Date.now()
      await updateReservationStatus('approved', demoTransactionId)
      
      setPaymentStatus('success')
      
      setTimeout(() => {
        navigate('/reservations')
      }, 2000)
    } catch (error) {
      console.error('Demo payment error:', error)
      setPaymentStatus('error')
    } finally {
      setProcessing(false)
    }
  }

  const updateReservationStatus = async (status, transactionId) => {
    try {
      await supabase
        .from('reservations')
        .update({
          statut_paiement: status,
          statut: status === 'approved' ? 'confirmee' : 'annulee',
          fedapay_transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!reservation) {
    return null
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paiement sécurisé
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complétez votre réservation en effectuant le paiement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Formulaire de paiement */}
          <div className="md:col-span-2 space-y-6">
            {/* Statut de paiement */}
            {paymentStatus === 'success' && (
              <div className="card bg-success-light border-2 border-success">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div>
                    <h3 className="text-lg font-bold text-success">Paiement réussi !</h3>
                    <p className="text-sm text-gray-700">
                      Votre réservation a été confirmée. Vous allez être redirigé...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="card bg-error-light border-2 border-error">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-8 w-8 text-error" />
                  <div>
                    <h3 className="text-lg font-bold text-error">Échec du paiement</h3>
                    <p className="text-sm text-gray-700">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Méthodes de paiement */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Méthode de paiement
              </h2>

              <div className="space-y-3">
                {/* Mobile Money */}
                <button
                  onClick={() => setPaymentMethod('mobile_money')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'mobile_money'
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-6 w-6 text-primary" />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Mobile Money
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        MTN Mobile Money, Moov Money
                      </p>
                    </div>
                    {paymentMethod === 'mobile_money' && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>

                {/* Carte bancaire */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary-light'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Carte bancaire
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Visa, Mastercard
                      </p>
                    </div>
                    {paymentMethod === 'card' && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Sécurité */}
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Paiement 100% sécurisé</p>
                  <p>
                    Vos données bancaires sont cryptées et sécurisées par FedaPay.
                    Nous ne stockons jamais vos informations de paiement.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <button
              onClick={handlePayment}
              disabled={processing || paymentStatus === 'success'}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Traitement en cours...</span>
                </span>
              ) : (
                `Payer ${reservation.montant_total} FCFA`
              )}
            </button>

            {/* Mode Démo - À enlever en production */}
            {import.meta.env.DEV && (
              <button
                onClick={handlePaymentDemo}
                disabled={processing || paymentStatus === 'success'}
                className="w-full btn-secondary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧪 Mode DEMO (Test sans FedaPay)
              </button>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              En cliquant sur "Payer", vous acceptez nos{' '}
              <a href="#" className="text-primary hover:underline">
                conditions générales
              </a>
            </p>
          </div>

          {/* Récapitulatif */}
          <div className="md:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Récapitulatif
              </h3>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Trajet
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reservation.trajets.depart} → {reservation.trajets.arrivee}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Compagnie
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reservation.trajets.compagnies?.nom}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Horaire
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reservation.horaire}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Passager
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reservation.nom_passager}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Places
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reservation.nb_places}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sous-total
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {reservation.montant_total} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Frais de service
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    0 FCFA
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total à payer
                    </span>
                    <span className="font-bold text-2xl text-primary">
                      {reservation.montant_total} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
