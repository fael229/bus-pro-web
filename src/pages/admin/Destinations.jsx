import { useState, useEffect } from 'react'
import { MapPin, Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([])
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [formData, setFormData] = useState({ nom: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadDestinations()
  }, [])

  useEffect(() => {
    const filtered = destinations.filter(dest =>
      dest.nom.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDestinations(filtered)
  }, [searchTerm, destinations])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('nom', { ascending: true })

      if (error) throw error
      setDestinations(data || [])
      setFilteredDestinations(data || [])
    } catch (error) {
      console.error('Erreur chargement destinations:', error)
      setError('Erreur lors du chargement des destinations')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (destination = null) => {
    setEditingDestination(destination)
    setFormData(destination ? { nom: destination.nom } : { nom: '' })
    setError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDestination(null)
    setFormData({ nom: '' })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validation
    if (!formData.nom.trim()) {
      setError('Le nom de la destination est requis')
      return
    }

    try {
      if (editingDestination) {
        // Modification
        const { error } = await supabase
          .from('destinations')
          .update({ nom: formData.nom.trim() })
          .eq('id', editingDestination.id)

        if (error) throw error
        setSuccessMessage('Destination modifiée avec succès')
      } else {
        // Ajout
        const { error } = await supabase
          .from('destinations')
          .insert([{ nom: formData.nom.trim() }])

        if (error) throw error
        setSuccessMessage('Destination ajoutée avec succès')
      }

      await loadDestinations()
      handleCloseModal()
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erreur:', error)
      if (error.code === '23505') {
        setError('Cette destination existe déjà')
      } else {
        setError('Erreur lors de l\'enregistrement')
      }
    }
  }

  const handleDelete = async (destination) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${destination.nom}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destination.id)

      if (error) throw error
      
      setSuccessMessage('Destination supprimée avec succès')
      await loadDestinations()
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erreur suppression:', error)
      if (error.code === '23503') {
        setError('Impossible de supprimer cette destination car elle est utilisée dans des trajets')
      } else {
        setError('Erreur lors de la suppression')
      }
      
      setTimeout(() => setError(''), 5000)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-light rounded-xl">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Destinations
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {destinations.length} destination{destinations.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-success-light text-success rounded-lg">
          {successMessage}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-6 p-4 bg-error-light text-error rounded-lg">
          {error}
        </div>
      )}

      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Liste des destinations */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Aucune destination trouvée' : 'Aucune destination'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-primary-light rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                    {destination.nom}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleOpenModal(destination)}
                    className="p-2 hover:bg-primary-light rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(destination)}
                    className="p-2 hover:bg-error-light rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {editingDestination ? 'Modifier la destination' : 'Ajouter une destination'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la destination *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Cotonou, Porto-Novo, Parakou..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingDestination ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
