import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, Clock, CreditCard, User, Phone, Mail, Smartphone, CheckCircle, Loader, Shield, ExternalLink, Calendar } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'
import { createTransaction, openPaymentUrl, formatAmount, checkTransactionStatus } from '../utils/fedapay'

export default function Reservation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  
  const [trajet, setTrajet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('') // '', 'mtn', 'moov', 'celtiis'
  const [reservationCreated, setReservationCreated] = useState(null)
  const [formData, setFormData] = useState({
    nb_places: 1,
    horaire: '',
    date_voyage: '',
    nom_passager: '',
    telephone_passager: '',
    email_passager: session?.user?.email || '',
  })

  useEffect(() => {
    loadTrajet()
  }, [id])

  const loadTrajet = async () => {
    try {
      const { data, error } = await supabase
        .from('trajets')
        .select('*, compagnies:compagnie_id(nom)')
        .eq('id', id)
        .single()

      if (error) throw error
      setTrajet(data)
    } catch (error) {
      console.error('Error loading trajet:', error)
      navigate('/trajets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!paymentMethod) {
      alert('⚠️ Veuillez sélectionner votre opérateur Mobile Money')
      return
    }

    if (!formData.telephone_passager.match(/^\+229\d{8,10}$/)) {
      alert('⚠️ Le numéro de téléphone doit être au format +229XXXXXXXX')
      return
    }

    setSubmitting(true)

    try {
      const montantTotal = trajet.prix * formData.nb_places

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: session.user.id,
          trajet_id: trajet.id,
          nb_places: formData.nb_places,
          horaire: formData.horaire,
          date_voyage: formData.date_voyage,
          nom_passager: formData.nom_passager,
          telephone_passager: formData.telephone_passager,
          email_passager: formData.email_passager,
          montant_total: montantTotal,
          statut: 'en_attente',
          statut_paiement: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // Stocker la réservation et lancer le paiement
      setReservationCreated(reservation)
      await handlePayment(reservation, montantTotal)
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Une erreur est survenue lors de la réservation')
      setSubmitting(false)
    }
  }

  const handlePayment = async (reservation, amount) => {
    setProcessing(true)

    try {
      console.log('🚀 Starting payment process...')

      // Créer la transaction FedaPay avec l'opérateur sélectionné
      const result = await createTransaction({
        amount: formatAmount(amount),
        description: `Réservation ${trajet.depart} → ${trajet.arrivee} - ${formData.nb_places} place(s)`,
        customerId: session.user.id,
        customerEmail: formData.email_passager || session.user.email,
        customerName: formData.nom_passager,
        customerPhone: formData.telephone_passager,
        mobileMoneyOperator: paymentMethod, // 'mtn', 'moov', ou 'celtiis'
      })

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création de la transaction')
      }

      console.log('✅ Transaction created:', result.transactionId)

      // Sauvegarder l'ID de transaction dans la réservation
      await supabase
        .from('reservations')
        .update({
          fedapay_transaction_id: result.transactionId,
        })
        .eq('id', reservation.id)

      // Ouvrir le lien de paiement dans une nouvelle fenêtre
      openPaymentUrl(result.paymentUrl, true)

      // Afficher un message d'information
      const continueProcess = confirm(
        '💳 Une fenêtre de paiement FedaPay s\'est ouverte.\n\n' +
        'Veuillez compléter votre paiement dans cette fenêtre.\n\n' +
        '✅ Après avoir payé, cliquez sur "OK" pour vérifier votre paiement.\n' +
        '❌ Si vous n\'avez pas payé, cliquez sur "Annuler".'
      )
      
      if (continueProcess) {
        // L'utilisateur dit avoir payé, vérifier le statut
        console.log('🔍 Vérification du paiement...')
        
        // Attendre un peu que FedaPay traite le paiement
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const statusCheck = await checkTransactionStatus(result.transactionId)
        
        console.log('📊 Statut reçu:', statusCheck)
        
        if (statusCheck.success) {
          if (statusCheck.status === 'approved') {
            // Paiement confirmé
            await updateReservationStatus(reservation.id, 'approved', result.transactionId)
            alert('✅ Paiement confirmé !\n\nVotre réservation est validée.')
            navigate('/reservations')
          } else if (statusCheck.status === 'pending') {
            // Toujours en attente
            alert(
              '⏳ Paiement en cours de traitement...\n\n' +
              'Nous vérifions votre paiement. Cela peut prendre quelques minutes.\n\n' +
              'Vous pouvez vérifier le statut dans "Mes réservations".'
            )
            navigate('/reservations')
          } else {
            // Décliné ou annulé
            alert(
              '❌ Paiement non confirmé.\n\n' +
              `Statut: ${statusCheck.status}\n\n` +
              'Vous pouvez réessayer depuis "Mes réservations".'
            )
            navigate('/reservations')
          }
        } else {
          // Erreur de vérification
          alert(
            '⚠️ Impossible de vérifier le paiement pour le moment.\n\n' +
            'Veuillez vérifier le statut dans "Mes réservations" dans quelques instants.'
          )
          navigate('/reservations')
        }
      } else {
        // L'utilisateur n'a pas payé
        alert(
          'ℹ️ Paiement non effectué.\n\n' +
          'Votre réservation est sauvegardée.\n' +
          'Vous pouvez la payer plus tard depuis "Mes réservations".'
        )
        navigate('/reservations')
      }

    } catch (error) {
      console.error('❌ Payment error:', error)
      alert(`❌ Erreur : ${error.message}\n\nLa réservation est sauvegardée, vous pouvez payer plus tard depuis "Mes réservations".`)
      navigate('/reservations')
    } finally {
      setProcessing(false)
      setSubmitting(false)
    }
  }

  const updateReservationStatus = async (reservationId, status, transactionId) => {
    try {
      await supabase
        .from('reservations')
        .update({
          statut_paiement: status,
          statut: status === 'approved' ? 'confirmee' : 'annulee',
          fedapay_transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
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

  if (!trajet) {
    return null
  }

  const montantTotal = trajet.prix * formData.nb_places

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Réservation de billet
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Détails du trajet
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {trajet.depart} → {trajet.arrivee}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Compagnie: {trajet.compagnies?.nom}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prix unitaire: {trajet.prix} FCFA
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de places
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.nb_places}
                    onChange={(e) => setFormData({ ...formData, nb_places: parseInt(e.target.value) })}
                    required
                    className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date de voyage
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date_voyage}
                    onChange={(e) => setFormData({ ...formData, date_voyage: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} // Empêcher les dates passées
                    required
                    className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Sélectionnez votre date de voyage (minimum aujourd'hui)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horaire
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.horaire}
                    onChange={(e) => setFormData({ ...formData, horaire: e.target.value })}
                    required
                    className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Sélectionner un horaire</option>
                    {trajet.horaires?.map((horaire, index) => (
                      <option key={index} value={horaire}>
                        {horaire}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Informations du passager
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom_passager}
                        onChange={(e) => setFormData({ ...formData, nom_passager: e.target.value })}
                        placeholder="Jean Dupont"
                        required
                        className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone (Mobile Money) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.telephone_passager}
                        onChange={(e) => setFormData({ ...formData, telephone_passager: e.target.value })}
                        placeholder="+22997123456"
                        required
                        className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Format: +229XXXXXXXX (ce numéro sera utilisé pour le paiement Mobile Money)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email_passager}
                        onChange={(e) => setFormData({ ...formData, email_passager: e.target.value })}
                        placeholder="email@example.com"
                        className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sélection de l'opérateur Mobile Money */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Opérateur Mobile Money
                  </h3>
                  <span className="text-red-500">*</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* MTN Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'mtn'
                        ? 'border-[#FFCC00] bg-[#FFF9E6]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#FFCC00]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full bg-[#FFCC00] flex items-center justify-center mb-2 ${
                        paymentMethod === 'mtn' ? 'ring-4 ring-[#FFCC00]/30' : ''
                      }`}>
                        <span className="text-lg font-bold text-black">MTN</span>
                      </div>
                      <p className={`text-sm font-semibold text-center ${
                        paymentMethod === 'mtn' ? 'text-gray-900 dark:text-gray-900' : 'text-gray-600'
                      }`}>
                        MTN Mobile Money
                      </p>
                      {paymentMethod === 'mtn' && (
                        <CheckCircle className="h-5 w-5 text-[#FFCC00] mt-2" />
                      )}
                    </div>
                  </button>

                  {/* Moov Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('moov')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'moov'
                        ? 'border-[#009CDE] bg-[#E6F7FF]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#009CDE]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full bg-[#009CDE] flex items-center justify-center mb-2 ${
                        paymentMethod === 'moov' ? 'ring-4 ring-[#009CDE]/30' : ''
                      }`}>
                        <span className="text-base font-bold text-white">moov</span>
                      </div>
                      <p className={`text-sm font-semibold text-center ${
                        paymentMethod === 'moov' ? 'text-gray-900 dark:text-gray-900' : 'text-gray-600'
                      }`}>
                        Moov Money
                      </p>
                      {paymentMethod === 'moov' && (
                        <CheckCircle className="h-5 w-5 text-[#009CDE] mt-2" />
                      )}
                    </div>
                  </button>

                  {/* Celtiis Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('celtiis')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'celtiis'
                        ? 'border-[#FF6B00] bg-[#FFF3E6]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center mb-2 ${
                        paymentMethod === 'celtiis' ? 'ring-4 ring-[#FF6B00]/30' : ''
                      }`}>
                        <span className="text-sm font-bold text-white">Celtiis</span>
                      </div>
                      <p className={`text-sm font-semibold text-center ${
                        paymentMethod === 'celtiis' ? 'text-gray-900 dark:text-gray-900' : 'text-gray-600'
                      }`}>
                        Celtiis Cash
                      </p>
                      {paymentMethod === 'celtiis' && (
                        <CheckCircle className="h-5 w-5 text-[#FF6B00] mt-2" />
                      )}
                    </div>
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  Le numéro de téléphone doit correspondre à votre compte Mobile Money
                </p>
              </div>

              {/* Message de sécurité */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Paiement 100% sécurisé</p>
                    <p className="text-xs">
                      Vos données bancaires sont cryptées et sécurisées par FedaPay.
                      Nous ne stockons jamais vos informations de paiement.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || processing || !paymentMethod}
                className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting || processing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>
                      {processing ? 'Paiement en cours...' : 'Réservation en cours...'}
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Payer {montantTotal} FCFA</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                Paiement sécurisé par FedaPay (Mobile Money)
              </p>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="md:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Récapitulatif
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Prix unitaire</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trajet.prix} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Nombre de places</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formData.nb_places}
                  </span>
                </div>
                {formData.date_voyage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Date de voyage</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(formData.date_voyage).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {formData.horaire && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Horaire</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formData.horaire}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-2xl text-primary">
                      {montantTotal} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>📋 Note:</strong> Une fenêtre de paiement sécurisée s'ouvrira après validation.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-300">
                    <strong>✅ Paiement Mobile Money uniquement</strong> - Votre réservation sera confirmée après le paiement réussi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
