import { useState, useEffect } from 'react'
import { Users as UsersIcon, Search, Shield, User, Mail, Phone, Calendar, Edit, Trash2, Ban, CheckCircle } from 'lucide-react'
import { supabase } from '../../utils/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      console.log('👥 Loading users...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error loading users:', error)
        throw error
      }
      
      console.log('✅ Users loaded:', data?.length || 0)
      console.log('📊 First user:', data?.[0])
      setUsers(data || [])
    } catch (error) {
      console.error('❌ Exception in loadUsers:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, isAdmin) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin: isAdmin })
        .eq('id', userId)
      
      if (error) throw error
      
      await loadUsers()
      alert('Rôle mis à jour avec succès')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Erreur lors de la mise à jour du rôle')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      if (error) throw error
      
      await loadUsers()
      alert('Utilisateur supprimé avec succès')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erreur lors de la suppression. Note: Vous ne pouvez pas supprimer un utilisateur avec des réservations.')
    }
  }

  const getRoleBadge = (isAdmin) => {
    const config = isAdmin
      ? { color: 'bg-error-light text-error', icon: Shield, label: 'Admin' }
      : { color: 'bg-primary-light text-primary', icon: User, label: 'Utilisateur' }
    
    const { color, icon: Icon, label } = config
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
    )
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && u.admin) ||
                       (roleFilter === 'user' && !u.admin)
    
    return matchesSearch && matchesRole
  })

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, email..."
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="all">Tous les rôles</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || roleFilter !== 'all') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
              }}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement des utilisateurs...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || roleFilter !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Les utilisateurs inscrits apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info utilisateur */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {user.full_name || user.username || 'Sans nom'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span>{user.email || 'Email non renseigné'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getRoleBadge(user.admin)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Nom d'utilisateur</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.username || 'Non défini'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Mis à jour le</span>
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">ID</p>
                      <p className="font-mono text-xs text-gray-900 dark:text-white truncate">
                        {user.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 lg:w-48">
                  <select
                    value={user.admin ? 'admin' : 'user'}
                    onChange={(e) => updateUserRole(user.id, e.target.value === 'admin')}
                    className="input-field text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="btn-secondary text-sm flex items-center justify-center space-x-2"
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

      {/* Statistiques */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="card border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total utilisateurs
              </p>
              <p className="text-3xl font-bold text-primary">
                {users.length}
              </p>
            </div>
            <UsersIcon className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="card border-l-4 border-error">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Administrateurs
              </p>
              <p className="text-3xl font-bold text-error">
                {users.filter(u => u.admin).length}
              </p>
            </div>
            <Shield className="h-10 w-10 text-error" />
          </div>
        </div>

        <div className="card border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Utilisateurs actifs
              </p>
              <p className="text-3xl font-bold text-success">
                {users.filter(u => !u.admin).length}
              </p>
            </div>
            <User className="h-10 w-10 text-success" />
          </div>
        </div>
      </div>
    </div>
  )
}
