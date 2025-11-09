import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminCompagnies() {
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompagnie, setEditingCompagnie] = useState(null)
  
  const [formData, setFormData] = useState({
    nom: '',
    logo_url: '',
    telephone: '',
    adresse: '',
  })

  useEffect(() => {
    loadCompagnies()
  }, [])

  const loadCompagnies = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('compagnies')
      .select('*')
      .order('nom')
    if (!error) setCompagnies(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingCompagnie) {
        await supabase
          .from('compagnies')
          .update(formData)
          .eq('id', editingCompagnie.id)
      } else {
        await supabase.from('compagnies').insert(formData)
      }
      
      await loadCompagnies()
      resetForm()
    } catch (error) {
      console.error('Error saving compagnie:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = (compagnie) => {
    setEditingCompagnie(compagnie)
    setFormData({
      nom: compagnie.nom,
      logo_url: compagnie.logo_url || '',
      telephone: compagnie.telephone || '',
      adresse: compagnie.adresse || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compagnie ?')) return
    
    try {
      await supabase.from('compagnies').delete().eq('id', id)
      await loadCompagnies()
    } catch (error) {
      console.error('Error deleting compagnie:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      logo_url: '',
      telephone: '',
      adresse: '',
    })
    setEditingCompagnie(null)
    setShowForm(false)
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des compagnies
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {compagnies.length} compagnie{compagnies.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle compagnie</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingCompagnie ? 'Modifier la compagnie' : 'Ajouter une compagnie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  URL du logo
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingCompagnie ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des compagnies */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {compagnies.map((compagnie) => (
            <div key={compagnie.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center overflow-hidden">
                    {compagnie.logo_url ? (
                      <img
                        src={compagnie.logo_url}
                        alt={compagnie.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {compagnie.nom}
                    </h3>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(compagnie)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit2 className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(compagnie.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-error" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {compagnie.telephone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Tél:</strong> {compagnie.telephone}
                  </p>
                )}
                {compagnie.adresse && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Adresse:</strong> {compagnie.adresse}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-xs">
                  Créée le {new Date(compagnie.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
