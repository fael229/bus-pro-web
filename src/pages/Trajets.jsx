import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Filter, X } from 'lucide-react'
import { supabase } from '../utils/supabase'
import TrajetCard from '../components/TrajetCard'
import { useSession } from '../contexts/SessionProvider'

export default function Trajets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { session } = useSession()
  
  const [trajets, setTrajets] = useState([])
  const [favorites, setFavorites] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    depart: searchParams.get('depart') || '',
    arrivee: searchParams.get('arrivee') || '',
    compagnie: searchParams.get('compagnie') || '',
    prixMax: '',
  })

  useEffect(() => {
    loadTrajets()
    if (session) loadFavorites()
  }, [filters, session])

  const loadTrajets = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('trajets')
        .select('id, depart, arrivee, prix, note, nb_avis, horaires, compagnies:compagnie_id(nom)')
        .order('note', { ascending: false })

      if (filters.depart) {
        query = query.ilike('depart', `%${filters.depart}%`)
      }
      if (filters.arrivee) {
        query = query.ilike('arrivee', `%${filters.arrivee}%`)
      }
      if (filters.prixMax) {
        query = query.lte('prix', parseFloat(filters.prixMax))
      }

      const { data, error } = await query

      if (error) throw error

      let results = (data || []).map(t => ({
        ...t,
        compagnie: t?.compagnies?.nom,
      }))

      if (filters.compagnie) {
        results = results.filter(t =>
          t.compagnie?.toLowerCase().includes(filters.compagnie.toLowerCase())
        )
      }

      setTrajets(results)
    } catch (error) {
      console.error('Error loading trajets:', error)
      setTrajets([])
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    if (!session?.user?.id) return
    const { data } = await supabase
      .from('favoris')
      .select('trajet_id')
      .eq('user_id', session.user.id)
    setFavorites(new Set((data || []).map(r => r.trajet_id)))
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      depart: '',
      arrivee: '',
      compagnie: '',
      prixMax: '',
    })
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="page-container min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Rechercher des trajets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trouvez le trajet parfait pour votre voyage
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Départ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.depart}
                onChange={(e) => handleFilterChange('depart', e.target.value)}
                placeholder="Ville de départ"
                className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Arrivée
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filters.arrivee}
                onChange={(e) => handleFilterChange('arrivee', e.target.value)}
                placeholder="Ville d'arrivée"
                className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Compagnie
            </label>
            <input
              type="text"
              value={filters.compagnie}
              onChange={(e) => handleFilterChange('compagnie', e.target.value)}
              placeholder="Nom de la compagnie"
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Prix maximum
            </label>
            <input
              type="number"
              value={filters.prixMax}
              onChange={(e) => handleFilterChange('prixMax', e.target.value)}
              placeholder="Prix max (FCFA)"
              className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
            <span>Effacer les filtres</span>
          </button>
          
          <div className="text-sm font-semibold text-primary">
            {trajets.length} résultat{trajets.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Chargement des trajets...
          </p>
        </div>
      ) : trajets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun trajet trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Essayez de modifier vos critères de recherche
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trajets.map((trajet) => (
            <TrajetCard
              key={trajet.id}
              trajet={trajet}
              isFavorite={favorites.has(trajet.id)}
              onFavoriteToggle={loadFavorites}
            />
          ))}
        </div>
      )}
    </div>
  )
}
