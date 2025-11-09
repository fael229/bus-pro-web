import { useState, useEffect } from 'react'
import { Bus, Search, MapPin, Plus, Edit2, Trash2, X } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useSession } from '../../contexts/SessionProvider'

export default function CompagnieTrajets() {
  const { session } = useSession()
  const [trajets, setTrajets] = useState([])
  const [compagnieId, setCompagnieId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTrajet, setEditingTrajet] = useState(null)
  const [formData, setFormData] = useState({
    depart: '',
    arrivee: '',
    prix: '',
    gare: '',
    horaires: [''],
  })

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

  const openModal = (trajet = null) => {
    if (trajet) {
      setEditingTrajet(trajet)
      setFormData({
        depart: trajet.depart,
        arrivee: trajet.arrivee,
        prix: trajet.prix,
        gare: trajet.gare || '',
        horaires: trajet.horaires || [''],
      })
    } else {
      setEditingTrajet(null)
      setFormData({
        depart: '',
        arrivee: '',
        prix: '',
        gare: '',
        horaires: [''],
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTrajet(null)
    setFormData({
      depart: '',
      arrivee: '',
      prix: '',
      gare: '',
      horaires: [''],
    })
  }

  const addHoraire = () => {
    setFormData({ ...formData, horaires: [...formData.horaires, ''] })
  }

  const removeHoraire = (index) => {
    const newHoraires = formData.horaires.filter((_, i) => i !== index)
    setFormData({ ...formData, horaires: newHoraires.length > 0 ? newHoraires : [''] })
  }

  const updateHoraire = (index, value) => {
    const newHoraires = [...formData.horaires]
    newHoraires[index] = value
    setFormData({ ...formData, horaires: newHoraires })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const horairesFiltres = formData.horaires.filter(h => h.trim() !== '')
      
      const trajetData = {
        depart: formData.depart,
        arrivee: formData.arrivee,
        prix: parseFloat(formData.prix),
        gare: formData.gare || null,
        horaires: horairesFiltres.length > 0 ? horairesFiltres : null,
        compagnie_id: compagnieId,
      }

      if (editingTrajet) {
        const { error } = await supabase
          .from('trajets')
          .update(trajetData)
          .eq('id', editingTrajet.id)
        
        if (error) throw error
        alert('Trajet modifié avec succès')
      } else {
        const { error } = await supabase
          .from('trajets')
          .insert([trajetData])
        
        if (error) throw error
        alert('Trajet ajouté avec succès')
      }

      closeModal()
      await loadTrajets(compagnieId)
    } catch (error) {
      console.error('Error saving trajet:', error)
      alert('Erreur lors de l\'enregistrement : ' + error.message)
    }
  }

  const deleteTrajet = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return

    try {
      const { error } = await supabase
        .from('trajets')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Trajet supprimé avec succès')
      await loadTrajets(compagnieId)
    } catch (error) {
      console.error('Error deleting trajet:', error)
      alert('Erreur lors de la suppression : ' + error.message)
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trajets de ma compagnie
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {trajets.length} trajet{trajets.length > 1 ? 's' : ''} disponible{trajets.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un trajet</span>
        </button>
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

                {/* Actions */}
                <div className="flex space-x-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openModal(trajet)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => deleteTrajet(trajet.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error-dark transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTrajet ? 'Modifier le trajet' : 'Ajouter un trajet'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ville de départ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.depart}
                      onChange={(e) => setFormData({ ...formData, depart: e.target.value })}
                      className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Ex: Cotonou"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ville d'arrivée *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.arrivee}
                      onChange={(e) => setFormData({ ...formData, arrivee: e.target.value })}
                      className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Ex: Porto-Novo"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.prix}
                      onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                      className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Ex: 1500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gare (optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.gare}
                      onChange={(e) => setFormData({ ...formData, gare: e.target.value })}
                      className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Ex: Gare de Jonquet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horaires (optionnel)
                  </label>
                  {formData.horaires.map((horaire, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="time"
                        value={horaire}
                        onChange={(e) => updateHoraire(index, e.target.value)}
                        className="input-field flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      {formData.horaires.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHoraire(index)}
                          className="px-3 py-2 bg-error text-white rounded-lg hover:bg-error-dark transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHoraire}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    + Ajouter un horaire
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingTrajet ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
