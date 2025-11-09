import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'
import TrajetCard from '../components/TrajetCard'

export default function Favorites() {
  const { session } = useSession()
  const [favoris, setFavoris] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [session])

  const loadFavorites = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('favoris')
        .select('*, trajets(*, compagnies:compagnie_id(nom))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const trajets = (data || []).map(f => ({
        ...f.trajets,
        compagnie: f.trajets?.compagnies?.nom,
      }))

      setFavoris(trajets)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
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
          Mes favoris
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Retrouvez vos trajets préférés
        </p>
      </div>

      {favoris.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Aucun favori
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ajoutez des trajets à vos favoris pour les retrouver facilement
          </p>
          <Link to="/trajets" className="btn-primary">
            Explorer les trajets
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoris.map((trajet) => (
            <TrajetCard
              key={trajet.id}
              trajet={trajet}
              isFavorite={true}
              onFavoriteToggle={loadFavorites}
            />
          ))}
        </div>
      )}
    </div>
  )
}
