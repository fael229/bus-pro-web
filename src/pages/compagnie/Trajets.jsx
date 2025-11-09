import { useState, useEffect } from 'react'
import { Bus, Search, MapPin } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useSession } from '../../contexts/SessionProvider'

export default function CompagnieTrajets() {
  const { session } = useSession()
  const [trajets, setTrajets] = useState([])
  const [compagnieId, setCompagnieId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCompagnieAndTrajets()
  }, [session])

  const loadCompagnieAndTrajets = async () => {
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
        await loadTrajets(profile.compagnie_id)
      }
    } catch (error) {
      console.error('Error loading:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrajets = async (compagnieId) => {
    try {
      const { data, error } = await supabase
        .from('trajets')
        .select('*')
        .eq('compagnie_id', compagnieId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrajets(data || [])
    } catch (error) {
      console.error('Error loading trajets:', error)
      setTrajets([])
    }
  }

  const filteredTrajets = trajets.filter(t => {
    const matchesSearch = 
      t.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.gare?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
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
          Trajets de ma compagnie
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {trajets.length} trajet{trajets.length > 1 ? 's' : ''} disponible{trajets.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Recherche */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un trajet (départ, arrivée, gare)..."
            className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        
        {searchTerm && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTrajets.length} résultat{filteredTrajets.length > 1 ? 's' : ''} trouvé{filteredTrajets.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      {filteredTrajets.length === 0 ? (
        <div className="card text-center py-12">
          <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun trajet trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm 
              ? 'Essayez de modifier votre recherche'
              : 'Les trajets de votre compagnie apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrajets.map((trajet) => (
            <div key={trajet.id} className="card hover:shadow-lg transition-shadow">
              {/* En-tête */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-light rounded-lg">
                    <Bus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {trajet.depart}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Départ
                    </p>
                  </div>
                </div>
                <div className="text-primary font-bold text-xl">
                  →
                </div>
              </div>

              {/* Arrivée */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-success-light rounded-lg">
                  <MapPin className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {trajet.arrivee}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Arrivée
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix</span>
                  <span className="font-bold text-primary text-lg">
                    {trajet.prix} FCFA
                  </span>
                </div>

                {trajet.gare && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gare</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trajet.gare}
                    </span>
                  </div>
                )}

                {trajet.horaires && Array.isArray(trajet.horaires) && trajet.horaires.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                      Horaires disponibles
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {trajet.horaires.slice(0, 4).map((h, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold text-gray-900 dark:text-white"
                        >
                          {h}
                        </span>
                      ))}
                      {trajet.horaires.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                          +{trajet.horaires.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {trajet.note > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Note</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-warning">
                        {trajet.note.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({trajet.nb_avis} avis)
                      </span>
                    </div>
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
