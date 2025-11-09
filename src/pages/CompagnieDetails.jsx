import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Building2, Phone, MapPin, Mail, Bus, Star, ArrowRight } from 'lucide-react'
import { supabase } from '../utils/supabase'

export default function CompagnieDetails() {
  const { id } = useParams()
  const [compagnie, setCompagnie] = useState(null)
  const [trajets, setTrajets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompagnie()
    loadTrajets()
  }, [id])

  const loadCompagnie = async () => {
    try {
      console.log('🔍 Loading compagnie with ID:', id)
      
      const { data, error } = await supabase
        .from('compagnies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error loading compagnie:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Compagnie loaded:', data)
      setCompagnie(data)
    } catch (error) {
      console.error('❌ Exception loading compagnie:', error)
      setCompagnie(null)
    } finally {
      setLoading(false)
    }
  }

  const loadTrajets = async () => {
    try {
      const { data, error } = await supabase
        .from('trajets')
        .select('*')
        .eq('compagnie_id', id)
        .order('depart')

      if (error) throw error
      setTrajets(data || [])
    } catch (error) {
      console.error('Error loading trajets:', error)
    }
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
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Compagnie non trouvée
        </h2>
        <Link to="/compagnies" className="btn-primary">
          Retour aux compagnies
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6 mb-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-32 w-32 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {compagnie.logo_url ? (
                  <img
                    src={compagnie.logo_url}
                    alt={compagnie.nom}
                    className="h-24 w-auto object-contain"
                  />
                ) : (
                  <Building2 className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Infos principales */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {compagnie.nom}
              </h1>

              <div className="space-y-3">
                {compagnie.telephone && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-light rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Téléphone</p>
                      <a 
                        href={`tel:${compagnie.telephone}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-primary"
                      >
                        {compagnie.telephone}
                      </a>
                    </div>
                  </div>
                )}

                {compagnie.adresse && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-light rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Adresse</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {compagnie.adresse}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-10 w-10 bg-success-light rounded-lg">
                    <Bus className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Trajets disponibles</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">
                      {trajets.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trajets de la compagnie */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Trajets proposés ({trajets.length})
          </h2>

          {trajets.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Aucun trajet disponible pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trajets.map((trajet) => (
                <Link
                  key={trajet.id}
                  to={`/trajet/${trajet.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {trajet.depart}
                        </span>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {trajet.arrivee}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {trajet.gare && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{trajet.gare}</span>
                          </div>
                        )}
                        {trajet.note > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span>{trajet.note}/5</span>
                          </div>
                        )}
                        {trajet.nb_avis > 0 && (
                          <span>({trajet.nb_avis} avis)</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {trajet.prix} FCFA
                      </div>
                      <span className="text-sm text-primary hover:underline font-medium">
                        Voir le trajet →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
