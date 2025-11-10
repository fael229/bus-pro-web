import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, Bus, Calendar, TrendingUp, DollarSign, 
  Activity, CheckCircle, Clock, XCircle, MapPin 
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import ReservationsChart from '../../components/admin/ReservationsChart'
import RevenueChart from '../../components/admin/RevenueChart'
import CompagniesChart from '../../components/admin/CompagniesChart'
import StatusChart from '../../components/admin/StatusChart'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReservations: 0,
    totalTrajets: 0,
    totalRevenue: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    canceledReservations: 0,
  })
  const [recentReservations, setRecentReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    reservations: [],
    revenue: [],
    compagnies: [],
    status: []
  })

  useEffect(() => {
    loadStats()
    loadRecentReservations()
    loadChartData()
  }, [])

  const loadStats = async () => {
    try {
      console.log('📊 Loading dashboard stats...')
      
      // Nombre d'utilisateurs
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) console.error('Error loading users count:', usersError)

      // Nombre de réservations
      const { count: reservationsCount, error: resError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
      
      if (resError) console.error('Error loading reservations count:', resError)

      // Nombre de trajets
      const { count: trajetsCount } = await supabase
        .from('trajets')
        .select('*', { count: 'exact', head: true })

      // Réservations en attente
      const { count: pendingCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'en_attente')

      // Réservations confirmées
      const { count: confirmedCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'confirmee')

      // Réservations annulées
      const { count: canceledCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'annulee')

      // Revenu total (réservations confirmées)
      const { data: revenueData } = await supabase
        .from('reservations')
        .select('montant_total')
        .eq('statut_paiement', 'approved')

      const totalRevenue = revenueData?.reduce((sum, r) => sum + parseFloat(r.montant_total || 0), 0) || 0

      setStats({
        totalUsers: usersCount || 0,
        totalReservations: reservationsCount || 0,
        totalTrajets: trajetsCount || 0,
        totalRevenue: totalRevenue,
        pendingReservations: pendingCount || 0,
        confirmedReservations: confirmedCount || 0,
        canceledReservations: canceledCount || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentReservations = async () => {
    try {
      console.log('🔍 Loading recent reservations...')
      
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
        .limit(5)

      if (error) {
        console.error('❌ Error loading reservations:', error)
        throw error
      }

      console.log('✅ Reservations loaded:', data?.length || 0)
      console.log('📊 Sample data:', data?.[0])
      
      setRecentReservations(data || [])
    } catch (error) {
      console.error('❌ Exception loading recent reservations:', error)
      // Ne pas bloquer l'affichage, juste logger l'erreur
      setRecentReservations([])
    }
  }

  const loadChartData = async () => {
    try {
      // Récupérer toutes les réservations
      const { data: allReservations } = await supabase
        .from('reservations')
        .select('created_at, statut, montant_total, statut_paiement, trajets(compagnies:compagnie_id(nom))')
        .order('created_at', { ascending: true })

      if (!allReservations) return

      // Données pour le graphique des réservations par jour (7 derniers jours)
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
        
        const dayReservations = allReservations.filter(r => {
          const rDate = new Date(r.created_at)
          return rDate.toDateString() === date.toDateString()
        })
        
        last7Days.push({
          date: dateStr,
          reservations: dayReservations.length,
          confirmees: dayReservations.filter(r => r.statut === 'confirmee').length
        })
      }

      // Données pour le graphique des revenus (7 derniers jours)
      const revenueData = last7Days.map(day => ({
        date: day.date,
        revenue: allReservations
          .filter(r => {
            const rDate = new Date(r.created_at)
            const dayDate = day.date.split('/').reverse().join('-')
            return rDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) === day.date &&
                   r.statut_paiement === 'approved'
          })
          .reduce((sum, r) => sum + parseFloat(r.montant_total || 0), 0)
      }))

      // Données pour le graphique des compagnies
      const compagniesMap = {}
      allReservations.forEach(r => {
        const companyName = r.trajets?.compagnies?.nom || 'Autre'
        compagniesMap[companyName] = (compagniesMap[companyName] || 0) + 1
      })
      const compagniesData = Object.entries(compagniesMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 7)

      // Données pour le graphique des statuts
      const statusData = [
        { name: 'En attente', value: allReservations.filter(r => r.statut === 'en_attente').length },
        { name: 'Confirmée', value: allReservations.filter(r => r.statut === 'confirmee').length },
        { name: 'Annulée', value: allReservations.filter(r => r.statut === 'annulee').length },
        { name: 'Expirée', value: allReservations.filter(r => r.statut === 'expiree').length }
      ].filter(s => s.value > 0)

      setChartData({
        reservations: last7Days,
        revenue: revenueData,
        compagnies: compagniesData,
        status: statusData
      })
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  const getStatusBadge = (statut) => {
    const config = {
      en_attente: { color: 'bg-warning-light text-warning', icon: Clock },
      confirmee: { color: 'bg-success-light text-success', icon: CheckCircle },
      annulee: { color: 'bg-error-light text-error', icon: XCircle },
    }
    const { color, icon: Icon } = config[statut] || config.en_attente
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold ${color}`}>
        <Icon className="h-3 w-3" />
        <span>{statut}</span>
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
          Dashboard Admin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble de la plateforme Bus Bénin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Utilisateurs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-primary-light rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Réservations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalReservations}
              </p>
            </div>
            <div className="p-3 bg-success-light rounded-lg">
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trajets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTrajets}
              </p>
            </div>
            <div className="p-3 bg-warning-light rounded-lg">
              <Bus className="h-8 w-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Revenu Total
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRevenue.toLocaleString()} FCFA
              </p>
            </div>
            <div className="p-3 bg-success-light rounded-lg">
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                En attente
              </p>
              <p className="text-3xl font-bold text-warning">
                {stats.pendingReservations}
              </p>
            </div>
            <Clock className="h-10 w-10 text-warning" />
          </div>
        </div>

        <div className="card border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Confirmées
              </p>
              <p className="text-3xl font-bold text-success">
                {stats.confirmedReservations}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
        </div>

        <div className="card border-l-4 border-error">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Annulées
              </p>
              <p className="text-3xl font-bold text-error">
                {stats.canceledReservations}
              </p>
            </div>
            <XCircle className="h-10 w-10 text-error" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/trajets" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-light rounded-lg">
              <Bus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les trajets
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ajouter, modifier ou supprimer
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/compagnies" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-success-light rounded-lg">
              <Activity className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les compagnies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Liste des transporteurs
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/reservations" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-warning-light rounded-lg">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les réservations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Voir et modifier
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-error-light rounded-lg">
              <Users className="h-6 w-6 text-error" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les utilisateurs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modifier les rôles
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/destinations" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary-light rounded-lg">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Gérer les destinations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Villes et localités
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Réservations Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Réservations (7 derniers jours)
          </h2>
          <ReservationsChart data={chartData.reservations} type="line" />
        </div>

        {/* Revenue Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Revenus (7 derniers jours)
          </h2>
          <RevenueChart data={chartData.revenue} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Compagnies Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Réservations par compagnie
          </h2>
          <CompagniesChart data={chartData.compagnies} />
        </div>

        {/* Status Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Statuts des réservations
          </h2>
          <StatusChart data={chartData.status} />
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Réservations récentes
          </h2>
          <Link to="/admin/reservations" className="text-primary hover:underline text-sm font-medium">
            Voir tout
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            Aucune réservation récente
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Trajet
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Montant
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reservation.nom_passager || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reservation.telephone_passager}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {reservation.trajets?.depart} → {reservation.trajets?.arrivee}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {reservation.montant_total} FCFA
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(reservation.statut)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
