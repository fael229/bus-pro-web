import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bus, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useSession } from '../../contexts/SessionProvider'

export default function CompagnieDashboard() {
  const { session } = useSession()
  const [compagnie, setCompagnie] = useState(null)
  const [stats, setStats] = useState({
    totalTrajets: 0,
    totalReservations: 0,
    revenue: 0,
    confirmedReservations: 0,
    pendingReservations: 0,
    canceledReservations: 0
  })
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompagnieData()
  }, [session])

  const loadCompagnieData = async () => {
    if (!session?.user?.id) return

    try {
      // Charger le profil avec compagnie_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('compagnie_id, admin, compagnies(id, nom, logo_url, telephone, adresse)')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      // Si admin, ne pas afficher cette page
      if (profile.admin && !profile.compagnie_id) {
        return
      }

      setCompagnie(profile.compagnies)

      // Charger les statistiques pour cette compagnie
      if (profile.compagnie_id) {
        await loadStats(profile.compagnie_id)
        await loadRecentReservations(profile.compagnie_id)
      }
    } catch (error) {
      console.error('Error loading compagnie data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (compagnieId) => {
    try {
      // Nombre de trajets
      const { data: trajets, error: trajetsError } = await supabase
        .from('trajets')
        .select('id')
        .eq('compagnie_id', compagnieId)

      if (trajetsError) throw trajetsError

      // Réservations pour les trajets de cette compagnie
      const trajetIds = trajets?.map(t => t.id) || []
      
      if (trajetIds.length > 0) {
        const { data: reservations, error: resError } = await supabase
          .from('reservations')
          .select('statut, montant_total, statut_paiement')
          .in('trajet_id', trajetIds)

        if (resError) throw resError

        // Calculer les stats
        const totalReservations = reservations?.length || 0
        const confirmed = reservations?.filter(r => r.statut === 'confirmee').length || 0
        const pending = reservations?.filter(r => r.statut === 'en_attente').length || 0
        const canceled = reservations?.filter(r => r.statut === 'annulee').length || 0
        
        const revenue = reservations
          ?.filter(r => r.statut_paiement === 'approved')
          .reduce((sum, r) => sum + parseFloat(r.montant_total || 0), 0) || 0

        setStats({
          totalTrajets: trajets?.length || 0,
          totalReservations,
          revenue,
          confirmedReservations: confirmed,
          pendingReservations: pending,
          canceledReservations: canceled
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentReservations = async (compagnieId) => {
    try {
      // Récupérer les trajets de la compagnie
      const { data: trajets, error: trajetsError } = await supabase
        .from('trajets')
        .select('id')
        .eq('compagnie_id', compagnieId)

      if (trajetsError) throw trajetsError

      const trajetIds = trajets?.map(t => t.id) || []

      if (trajetIds.length > 0) {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            trajets(depart, arrivee)
          `)
          .in('trajet_id', trajetIds)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        setRecentReservations(data || [])
      }
    } catch (error) {
      console.error('Error loading recent reservations:', error)
    }
  }

  const getStatusBadge = (statut) => {
    const config = {
      en_attente: { color: 'bg-warning-light text-warning', icon: Clock, label: 'En attente' },
      confirmee: { color: 'bg-success-light text-success', icon: CheckCircle, label: 'Confirmée' },
      annulee: { color: 'bg-error-light text-error', icon: XCircle, label: 'Annulée' },
    }
    const { color, icon: Icon, label } = config[statut] || config.en_attente
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="h-3 w-3" />
        <span>{label}</span>
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

  if (!compagnie) {
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
      {/* En-tête avec info compagnie */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {compagnie.logo_url ? (
            <img 
              src={compagnie.logo_url} 
              alt={compagnie.nom}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary-light flex items-center justify-center">
              <Bus className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {compagnie.nom}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tableau de bord de votre compagnie
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trajets actifs
              </p>
              <p className="text-3xl font-bold text-primary">
                {stats.totalTrajets}
              </p>
            </div>
            <Bus className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="card border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Réservations
              </p>
              <p className="text-3xl font-bold text-success">
                {stats.totalReservations}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-success" />
          </div>
        </div>

        <div className="card border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Revenu total
              </p>
              <p className="text-3xl font-bold text-warning">
                {stats.revenue.toLocaleString()} FCFA
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-warning" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Confirmées
              </p>
              <p className="text-2xl font-bold text-success">
                {stats.confirmedReservations}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                En attente
              </p>
              <p className="text-2xl font-bold text-warning">
                {stats.pendingReservations}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Annulées
              </p>
              <p className="text-2xl font-bold text-error">
                {stats.canceledReservations}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-error" />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link to="/compagnie/trajets" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-light rounded-lg">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer mes trajets
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Voir et modifier les trajets
              </p>
            </div>
          </div>
        </Link>

        <Link to="/compagnie/reservations" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success-light rounded-lg">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les réservations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Confirmer ou annuler
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Réservations récentes */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Réservations récentes
        </h2>
        
        {recentReservations.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Aucune réservation pour le moment
          </p>
        ) : (
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div 
                key={reservation.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {reservation.nom_passager}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reservation.telephone_passager}
                    </p>
                  </div>
                  {getStatusBadge(reservation.statut)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Trajet:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {reservation.trajets?.depart} → {reservation.trajets?.arrivee}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Places:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {reservation.nb_places}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Montant:</span>
                    <p className="font-semibold text-primary">
                      {reservation.montant_total} FCFA
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
