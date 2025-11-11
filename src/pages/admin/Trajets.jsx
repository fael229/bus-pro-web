import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Filter, X, DollarSign, Star, TrendingUp, Building2, Clock } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminTrajets() {
  const [trajets, setTrajets] = useState([])
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrajet, setEditingTrajet] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    compagnieId: '',
    prixMin: '',
    prixMax: '',
    noteMin: 0,
    sortBy: 'recent', // recent, prix_asc, prix_desc, note
  })
  
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

  const resetFilters = () => {
    setFilters({
      compagnieId: '',
      prixMin: '',
      prixMax: '',
      noteMin: 0,
      sortBy: 'recent',
    })
  }

  const countActiveFilters = () => {
    let count = 0
    if (filters.compagnieId) count++
    if (filters.prixMin || filters.prixMax) count++
    if (filters.noteMin > 0) count++
    if (filters.sortBy !== 'recent') count++
    return count
  }

  const applyFiltersAndSort = (trajetsList) => {
    let filtered = [...trajetsList]

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.depart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.arrivee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.compagnies?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par compagnie
    if (filters.compagnieId) {
      filtered = filtered.filter(t => t.compagnie_id === filters.compagnieId)
    }

    // Filtre par prix
    if (filters.prixMin) {
      filtered = filtered.filter(t => parseFloat(t.prix) >= parseFloat(filters.prixMin))
    }
    if (filters.prixMax) {
      filtered = filtered.filter(t => parseFloat(t.prix) <= parseFloat(filters.prixMax))
    }

    // Filtre par note
    if (filters.noteMin > 0) {
      filtered = filtered.filter(t => parseFloat(t.note || 0) >= filters.noteMin)
    }

    // Tri
    switch (filters.sortBy) {
      case 'prix_asc':
        filtered.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix))
        break
      case 'prix_desc':
        filtered.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix))
        break
      case 'note':
        filtered.sort((a, b) => parseFloat(b.note || 0) - parseFloat(a.note || 0))
        break
      case 'recent':
      default:
        // Garder l'ordre par défaut (created_at desc)
        break
    }

    return filtered
  }

  const filteredTrajets = applyFiltersAndSort(trajets)

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

      {/* Barre de recherche et filtres */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un trajet..."
              className="input-field pl-10 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center space-x-2 relative ${
              countActiveFilters() > 0 ? 'bg-primary-light text-primary border-primary' : ''
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
            {countActiveFilters() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {countActiveFilters()}
              </span>
            )}
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filtres avancés</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Réinitialiser</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre compagnie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-primary" />
                  Compagnie
                </label>
                <select
                  value={filters.compagnieId}
                  onChange={(e) => setFilters({ ...filters, compagnieId: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Toutes les compagnies</option>
                  {compagnies.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              {/* Filtre prix minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  Prix min (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.prixMin}
                  onChange={(e) => setFilters({ ...filters, prixMin: e.target.value })}
                  placeholder="500"
                  min="0"
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              {/* Filtre prix maximum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-primary" />
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.prixMax}
                  onChange={(e) => setFilters({ ...filters, prixMax: e.target.value })}
                  placeholder="10000"
                  min="0"
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              {/* Filtre note minimale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-primary" />
                  Note minimale
                </label>
                <select
                  value={filters.noteMin}
                  onChange={(e) => setFilters({ ...filters, noteMin: parseFloat(e.target.value) })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="3">3+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="recent">Plus récents</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                  <option value="note">Meilleure note</option>
                </select>
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-primary">{filteredTrajets.length}</span> résultat{filteredTrajets.length > 1 ? 's' : ''} trouvé{filteredTrajets.length > 1 ? 's' : ''}
                {countActiveFilters() > 0 && (
                  <span> avec {countActiveFilters()} filtre{countActiveFilters() > 1 ? 's' : ''} actif{countActiveFilters() > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
        )}
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
