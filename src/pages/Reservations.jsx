import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, RefreshCw, Users } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'
import { checkTransactionStatus } from '../utils/fedapay'

export default function Reservations() {
  const { session } = useSession()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null) // ID de la réservation en cours de vérification

  useEffect(() => {
    loadReservations()
  }, [session])

  const loadReservations = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          nb_places,
          horaire,
          montant_total,
          nom_passager,
          telephone_passager,
          email_passager,
          statut,
          statut_paiement,
          fedapay_transaction_id,
          created_at,
          trajets:trajet_id (
            id,
            depart,
            arrivee,
            compagnies:compagnie_id (nom)
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReservations(data || [])
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifierStatutPaiement = async (reservation) => {
    if (!reservation.fedapay_transaction_id) {
      alert('ℹ️ Aucune transaction de paiement trouvée')
      return
    }

    try {
      setVerifying(reservation.id)
      console.log('🔍 Vérification du statut pour:', reservation.fedapay_transaction_id)

      const result = await checkTransactionStatus(reservation.fedapay_transaction_id)

      if (result.success) {
        console.log('✅ Statut récupéré:', result.status)

        // Mettre à jour le statut dans Supabase
        const { error: updateError } = await supabase
          .from('reservations')
          .update({
            statut_paiement: result.status,
            statut: result.status === 'approved' ? 'confirmee' : 'en_attente',
          })
          .eq('id', reservation.id)

        if (updateError) {
          console.error('Erreur mise à jour:', updateError)
          throw updateError
        }

        // Message en fonction du statut
        const messages = {
          approved: '✅ Paiement confirmé ! Votre réservation est validée.',
          pending: '⏳ Paiement en attente. Veuillez compléter le paiement.',
          declined: '❌ Paiement refusé. Veuillez réessayer.',
          canceled: '⚠️ Paiement annulé.',
        }

        alert(messages[result.status] || `Statut: ${result.status}`)

        // Recharger la liste
        await loadReservations()
      } else {
        alert('❌ Impossible de vérifier le statut du paiement')
      }
    } catch (error) {
      console.error('❌ Erreur vérification:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setVerifying(null)
    }
  }

  const annulerReservation = async (reservationId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          statut: 'annulee',
          statut_paiement: 'canceled',
        })
        .eq('id', reservationId)
        .eq('statut', 'en_attente') // Seulement si en attente

      if (error) throw error

      alert('✅ Réservation annulée')
      await loadReservations()
    } catch (error) {
      console.error('❌ Erreur annulation:', error)
      alert(`Erreur: ${error.message}`)
    }
  }

  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_attente: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: AlertCircle, label: 'En attente' },
      confirmee: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle, label: 'Confirmée' },
      annulee: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle, label: 'Annulée' },
      expiree: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle, label: 'Expirée' },
    }

    const config = statusConfig[statut] || statusConfig.en_attente
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    )
  }

  const getPaymentStatusBadge = (statut) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'En attente', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Payé', icon: CheckCircle },
      declined: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Refusé', icon: XCircle },
      canceled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Annulé', icon: XCircle },
    }

    const config = statusConfig[statut] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mes réservations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consultez l'historique de vos réservations
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucune réservation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas encore effectué de réservation
          </p>
          <Link to="/trajets" className="btn-primary">
            Rechercher des trajets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info principale */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {reservation.trajets.depart} → {reservation.trajets.arrivee}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reservation.trajets.compagnies?.nom}
                      </p>
                    </div>
                    {getStatusBadge(reservation.statut)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{reservation.horaire}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{reservation.nb_places} place{reservation.nb_places > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      {getPaymentStatusBadge(reservation.statut_paiement)}
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex gap-2 mt-3">
                    {/* Bouton vérifier si paiement en attente */}
                    {reservation.statut_paiement === 'pending' && reservation.fedapay_transaction_id && (
                      <button
                        onClick={() => verifierStatutPaiement(reservation)}
                        disabled={verifying === reservation.id}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${verifying === reservation.id ? 'animate-spin' : ''}`} />
                        <span>{verifying === reservation.id ? 'Vérification...' : 'Vérifier'}</span>
                      </button>
                    )}
                    
                    {/* Bouton payer si en attente */}
                    {reservation.statut === 'en_attente' && reservation.statut_paiement === 'pending' && (
                      <Link
                        to={`/payment/${reservation.id}`}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors"
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>Payer {reservation.montant_total} FCFA</span>
                      </Link>
                    )}
                    
                    {/* Bouton annuler si en attente */}
                    {reservation.statut === 'en_attente' && (
                      <button
                        onClick={() => annulerReservation(reservation.id)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="h-3 w-3" />
                        <span>Annuler</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Prix */}
                <div className="flex flex-col items-end justify-center">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">
                      {reservation.montant_total}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails passager */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>Passager:</strong> {reservation.nom_passager}
                  </div>
                  <div>
                    <strong>Téléphone:</strong> {reservation.telephone_passager}
                  </div>
                  {reservation.email_passager && (
                    <div>
                      <strong>Email:</strong> {reservation.email_passager}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
