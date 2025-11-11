import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Phone, MapPin, Star, Bus, Search } from 'lucide-react'
import { supabase } from '../utils/supabase'

export default function Compagnies() {
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCompagnies()
  }, [])

  const loadCompagnies = async () => {
    try {
      const { data, error } = await supabase
        .from('compagnies')
        .select('*, trajets(count)')
        .order('nom')

      if (error) throw error
      setCompagnies(data || [])
    } catch (error) {
      console.error('Error loading compagnies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompagnies = compagnies.filter(c =>
    c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compagnies de transport
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Découvrez nos partenaires de transport au Bénin
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
            placeholder="Rechercher une compagnie..."
            className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      </div>

      {/* Liste des compagnies */}
      {filteredCompagnies.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucune compagnie trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Essayez avec un autre terme de recherche' : 'Aucune compagnie disponible'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompagnies.map((compagnie) => (
            <Link
              key={compagnie.id}
              to={`/compagnies/${compagnie.id}`}
              className="card hover:shadow-xl transition-shadow"
            >
              {/* Logo */}
              <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                {compagnie.logo_url ? (
                  <img
                    src={compagnie.logo_url}
                    alt={compagnie.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Infos */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {compagnie.nom}
              </h3>

              <div className="space-y-2 text-sm">
                {compagnie.telephone && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{compagnie.telephone}</span>
                  </div>
                )}

                {compagnie.adresse && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{compagnie.adresse}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-primary font-semibold">
                  <Bus className="h-4 w-4" />
                  <span>
                    {compagnie.trajets?.[0]?.count || 0} trajet{(compagnie.trajets?.[0]?.count || 0) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-primary hover:underline text-sm font-medium">
                  Voir les détails →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
