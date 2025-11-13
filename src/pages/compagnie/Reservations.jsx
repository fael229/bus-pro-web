import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, CalendarRange } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useSession } from '../../contexts/SessionProvider'

export default function CompagnieReservations() {
  const { session } = useSession()
  const [reservations, setReservations] = useState([])
  const [compagnieId, setCompagnieId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  useEffect(() => {
    loadCompagnieAndReservations()
  }, [session])

  const loadCompagnieAndReservations = async () => {
    if (!session?.user?.id) return

    try {
      // Charger le profil pour obtenir compagnie_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('compagnie_id')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      if (profile.compagnie_id) {
        setCompagnieId(profile.compagnie_id)
        await loadReservations(profile.compagnie_id)
      }
    } catch (error) {
      console.error('Error loading:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async (compagnieId) => {
    try {
      // Récupérer les trajets de la compagnie
      const { data: trajets, error: trajetsError } = await supabase
        .from('trajets')
        .select('id')
        .eq('compagnie_id', compagnieId)

      if (trajetsError) throw trajetsError

      const trajetIds = trajets?.map(t => t.id) || []

      if (trajetIds.length > 0) {
        // Récupérer les réservations pour ces trajets
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            trajets(depart, arrivee)
          `)
          .in('trajet_id', trajetIds)
          .order('created_at', { ascending: false })

        if (error) throw error
        setReservations(data || [])
      }
    } catch (error) {
      console.error('Error loading reservations:', error)
      setReservations([])
    }
  }

  const updateReservationStatus = async (id, statut) => {
    try {
      await supabase
        .from('reservations')
        .update({ statut, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      await loadCompagnieAndReservations()
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (statut) => {
    const config = {
      en_attente: { color: 'bg-warning-light text-warning', icon: Clock, label: 'En attente' },
      confirmee: { color: 'bg-success-light text-success', icon: CheckCircle, label: 'Confirmée' },
      annulee: { color: 'bg-error-light text-error', icon: XCircle, label: 'Annulée' },
      expiree: { color: 'bg-gray-200 text-gray-700', icon: XCircle, label: 'Expirée' },
    }
    const { color, icon: Icon, label } = config[statut] || config.en_attente
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
    )
  }

  const getPaymentBadge = (statut) => {
    const config = {
      pending: { color: 'bg-warning-light text-warning', label: 'En attente' },
      approved: { color: 'bg-success-light text-success', label: 'Payé' },
      declined: { color: 'bg-error-light text-error', label: 'Refusé' },
      canceled: { color: 'bg-gray-200 text-gray-700', label: 'Annulé' },
    }
    const { color, label } = config[statut] || config.pending
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
        {label}
      </span>
    )
  }

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.nom_passager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.telephone_passager?.includes(searchTerm) ||
      r.trajets?.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trajets?.arrivee?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || r.statut === statusFilter
    
    // Filtre de date
    let matchesDate = true
    if (dateStart || dateEnd) {
      const reservationDate = new Date(r.created_at)
      if (dateStart) {
        const startDate = new Date(dateStart)
        startDate.setHours(0, 0, 0, 0)
        matchesDate = matchesDate && reservationDate >= startDate
      }
      if (dateEnd) {
        const endDate = new Date(dateEnd)
        endDate.setHours(23, 59, 59, 999)
        matchesDate = matchesDate && reservationDate <= endDate
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!compagnieId) {
    return (
      <div className="page-container">
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Aucune compagnie assignée
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Contactez un administrateur pour être assigné à une compagnie.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Réservations de ma compagnie
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="annulee">Annulée</option>
              <option value="expiree">Expirée</option>
            </select>
          </div>

          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              placeholder="Date début"
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="relative">
            <CalendarRange className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              placeholder="Date fin"
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        
        {(dateStart || dateEnd || searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredReservations.length} résultat{filteredReservations.length > 1 ? 's' : ''} trouvé{filteredReservations.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateStart('')
                setDateEnd('')
              }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      {filteredReservations.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucune réservation trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Les réservations des clients apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {reservation.nom_passager}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reservation.telephone_passager}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(reservation.statut)}
                      {getPaymentBadge(reservation.statut_paiement)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Trajet</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.trajets?.depart} → {reservation.trajets?.arrivee}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Date voyage</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.date_voyage 
                          ? new Date(reservation.date_voyage).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Non définie'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Horaire</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.horaire || 'Non défini'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Places</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.nb_places}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Montant</p>
                      <p className="font-semibold text-primary">
                        {reservation.montant_total} FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {reservation.statut === 'en_attente' && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'confirmee')}
                      className="btn-primary text-sm"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'annulee')}
                      className="btn-secondary text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
