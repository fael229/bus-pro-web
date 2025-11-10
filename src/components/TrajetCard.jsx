import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Star, Heart, ArrowRight } from 'lucide-react'
import { useSession } from '../contexts/SessionProvider'
import { supabase } from '../utils/supabase'

export default function TrajetCard({ trajet, isFavorite, onFavoriteToggle }) {
  const { session } = useSession()
  const [loading, setLoading] = useState(false)

  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session) return
    
    setLoading(true)
    try {
      if (isFavorite) {
        await supabase
          .from('favoris')
          .delete()
          .eq('user_id', session.user.id)
          .eq('trajet_id', trajet.id)
      } else {
        await supabase
          .from('favoris')
          .insert({ user_id: session.user.id, trajet_id: trajet.id })
      }
      onFavoriteToggle?.()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
            {trajet.depart} → {trajet.arrivee}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {trajet.compagnie}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {trajet.note || 'N/A'}
            </span>
            {trajet.nb_avis > 0 && (
              <span className="text-xs text-gray-500">
                ({trajet.nb_avis} avis)
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {session && (
            <button
              onClick={handleFavoriteClick}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400'
                }`}
              />
            </button>
          )}
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {trajet.prix}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              FCFA
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Clock className="h-4 w-4" />
        <span>
          {trajet.horaires?.join(', ') || 'Horaires non disponibles'}
        </span>
      </div>

      <div className="flex space-x-3">
        <Link
          to={`/trajet/${trajet.id}`}
          className="flex-1 btn-outline text-center"
        >
          Voir détails
        </Link>
        <Link
          to={`/reservation/${trajet.id}`}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          <span>Réserver</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
