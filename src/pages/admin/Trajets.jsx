import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminTrajets() {
  const [trajets, setTrajets] = useState([])
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrajet, setEditingTrajet] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    depart: '',
    arrivee: '',
    prix: '',
    horaires: '',
    gare: '',
    compagnie_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadTrajets(), loadCompagnies()])
    } finally {
      setLoading(false)
    }
  }

  const loadTrajets = async () => {
    const { data, error } = await supabase
      .from('trajets')
      .select('*, compagnies:compagnie_id(nom)')
      .order('created_at', { ascending: false })
    if (!error) setTrajets(data || [])
  }

  const loadCompagnies = async () => {
    const { data, error } = await supabase
      .from('compagnies')
      .select('id, nom')
      .order('nom')
    if (!error) setCompagnies(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const horaireArray = formData.horaires
      .split(',')
      .map(h => h.trim())
      .filter(h => h)

    const trajetData = {
      depart: formData.depart,
      arrivee: formData.arrivee,
      prix: parseFloat(formData.prix),
      horaires: horaireArray,
      gare: formData.gare || null,
      compagnie_id: formData.compagnie_id || null,
    }

    try {
      if (editingTrajet) {
        await supabase
          .from('trajets')
          .update(trajetData)
          .eq('id', editingTrajet.id)
      } else {
        await supabase.from('trajets').insert(trajetData)
      }
      
      await loadTrajets()
      resetForm()
    } catch (error) {
      console.error('Error saving trajet:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = (trajet) => {
    setEditingTrajet(trajet)
    setFormData({
      depart: trajet.depart,
      arrivee: trajet.arrivee,
      prix: trajet.prix,
      horaires: trajet.horaires?.join(', ') || '',
      gare: trajet.gare || '',
      compagnie_id: trajet.compagnie_id || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return
    
    try {
      await supabase.from('trajets').delete().eq('id', id)
      await loadTrajets()
    } catch (error) {
      console.error('Error deleting trajet:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      depart: '',
      arrivee: '',
      prix: '',
      horaires: '',
      gare: '',
      compagnie_id: '',
    })
    setEditingTrajet(null)
    setShowForm(false)
  }

  const filteredTrajets = trajets.filter(t =>
    t.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.compagnies?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des trajets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {trajets.length} trajet{trajets.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau trajet</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingTrajet ? 'Modifier le trajet' : 'Ajouter un trajet'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Départ *
                </label>
                <input
                  type="text"
                  value={formData.depart}
                  onChange={(e) => setFormData({ ...formData, depart: e.target.value })}
                  required
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Arrivée *
                </label>
                <input
                  type="text"
                  value={formData.arrivee}
                  onChange={(e) => setFormData({ ...formData, arrivee: e.target.value })}
                  required
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                  min="0"
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Compagnie
                </label>
                <select
                  value={formData.compagnie_id}
                  onChange={(e) => setFormData({ ...formData, compagnie_id: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Sélectionner une compagnie</option>
                  {compagnies.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Gare
                </label>
                <input
                  type="text"
                  value={formData.gare}
                  onChange={(e) => setFormData({ ...formData, gare: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horaires (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.horaires}
                  onChange={(e) => setFormData({ ...formData, horaires: e.target.value })}
                  placeholder="06:00, 09:00, 12:00"
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingTrajet ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recherche */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un trajet..."
            className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
      </div>

      {/* Liste des trajets */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold">Trajet</th>
                <th className="text-left py-3 px-4 font-semibold">Compagnie</th>
                <th className="text-left py-3 px-4 font-semibold">Prix</th>
                <th className="text-left py-3 px-4 font-semibold">Horaires</th>
                <th className="text-left py-3 px-4 font-semibold">Note</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrajets.map((trajet) => (
                <tr key={trajet.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trajet.depart} → {trajet.arrivee}
                    </p>
                    {trajet.gare && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gare: {trajet.gare}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {trajet.compagnies?.nom || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    {trajet.prix} FCFA
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {trajet.horaires?.join(', ') || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {trajet.note || 'N/A'} ({trajet.nb_avis || 0} avis)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(trajet)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(trajet.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
