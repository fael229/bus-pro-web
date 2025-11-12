import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Building2, Search, Filter, X, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminCompagnies() {
  const [compagnies, setCompagnies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompagnie, setEditingCompagnie] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    sortBy: 'created_asc', // created_asc, created_desc, name_asc, name_desc
  })
  
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
      .order('created_at', { ascending: true })
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

  const resetFilters = () => {
    setFilters({
      dateStart: '',
      dateEnd: '',
      sortBy: 'created_asc',
    })
  }

  const countActiveFilters = () => {
    let count = 0
    if (filters.dateStart || filters.dateEnd) count++
    if (filters.sortBy !== 'created_asc') count++
    return count
  }

  const applyFiltersAndSort = (companiesList) => {
    let filtered = [...companiesList]

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone?.includes(searchTerm)
      )
    }

    // Filtre par plage de dates
    if (filters.dateStart) {
      const startDate = new Date(filters.dateStart)
      filtered = filtered.filter(c => new Date(c.created_at) >= startDate)
    }
    if (filters.dateEnd) {
      const endDate = new Date(filters.dateEnd)
      endDate.setHours(23, 59, 59, 999) // Inclure toute la journée de fin
      filtered = filtered.filter(c => new Date(c.created_at) <= endDate)
    }

    // Tri
    switch (filters.sortBy) {
      case 'created_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'name_asc':
        filtered.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
        break
      case 'name_desc':
        filtered.sort((a, b) => b.nom.localeCompare(a.nom, 'fr'))
        break
      case 'created_asc':
      default:
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
    }

    return filtered
  }

  const filteredCompagnies = applyFiltersAndSort(compagnies)

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
              placeholder="Rechercher une compagnie..."
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

            <div className="grid md:grid-cols-3 gap-4">
              {/* Filtre date de début */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Créée après le
                </label>
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              {/* Filtre date de fin */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Créée avant le
                </label>
                <input
                  type="date"
                  value={filters.dateEnd}
                  onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              {/* Tri */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="created_asc">Plus anciennes</option>
                  <option value="created_desc">Plus récentes</option>
                  <option value="name_asc">Nom A-Z</option>
                  <option value="name_desc">Nom Z-A</option>
                </select>
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-primary">{filteredCompagnies.length}</span> résultat{filteredCompagnies.length > 1 ? 's' : ''} trouvé{filteredCompagnies.length > 1 ? 's' : ''}
                {countActiveFilters() > 0 && (
                  <span> avec {countActiveFilters()} filtre{countActiveFilters() > 1 ? 's' : ''} actif{countActiveFilters() > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
        )}
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
          {filteredCompagnies.map((compagnie) => (
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
