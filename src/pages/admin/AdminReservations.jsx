import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, CalendarRange, Building2 } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [compagnieFilter, setCompagnieFilter] = useState('all')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  useEffect(() => {
    loadReservations()
    loadCompagnies()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    
    try {
      console.log('🔍 Loading all reservations...')
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          trajets(
            depart,
            arrivee,
            compagnies:compagnie_id(nom)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error loading reservations:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log('✅ Reservations loaded:', data?.length || 0)
      console.log('📊 First reservation:', data?.[0])
      
      setReservations(data || [])
    } catch (error) {
      console.error('❌ Exception in loadReservations:', error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const loadCompagnies = async () => {
    try {
      const { data, error } = await supabase
        .from('compagnies')
        .select('id, nom')
        .order('nom')
      
      if (error) throw error
      setCompagnies(data || [])
    } catch (error) {
      console.error('Error loading compagnies:', error)
    }
  }

  const updateReservationStatus = async (id, statut) => {
    try {
      await supabase
        .from('reservations')
        .update({ statut, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      await loadReservations()
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
    
    const matchesCompagnie = compagnieFilter === 'all' || r.trajets?.compagnies?.nom === compagnieFilter
    
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
    
    return matchesSearch && matchesStatus && matchesCompagnie && matchesDate
  })

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des réservations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
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

          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={compagnieFilter}
              onChange={(e) => setCompagnieFilter(e.target.value)}
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="all">Toutes les compagnies</option>
              {compagnies.map((compagnie) => (
                <option key={compagnie.id} value={compagnie.nom}>
                  {compagnie.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {(dateStart || dateEnd || searchTerm || statusFilter !== 'all' || compagnieFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredReservations.length} résultat{filteredReservations.length > 1 ? 's' : ''} trouvé{filteredReservations.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCompagnieFilter('all')
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
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement des réservations...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
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
                      <p className="text-gray-600 dark:text-gray-400">Compagnie</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.trajets?.compagnies?.nom || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Trajet</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.trajets?.depart} → {reservation.trajets?.arrivee}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Horaire</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.horaire}
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
