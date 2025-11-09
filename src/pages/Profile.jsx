import { useState, useEffect } from 'react'
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'

export default function Profile() {
  const { session } = useSession()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
  })

  useEffect(() => {
    loadProfile()
  }, [session])

  const loadProfile = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        email: data.email || session.user.email,
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)

      if (error) throw error

      await loadProfile()
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Une erreur est survenue lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mon profil
          </h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>Modifier</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    username: profile.username || '',
                    full_name: profile.full_name || '',
                    email: profile.email || '',
                  })
                }}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="card">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">
                {formData.username?.[0]?.toUpperCase() || formData.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!editing}
                  minLength={3}
                  className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="input-field pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {profile && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <strong>Compte créé:</strong>{' '}
                    {new Date(session.user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {profile.updated_at && (
                    <p>
                      <strong>Dernière modification:</strong>{' '}
                      {new Date(profile.updated_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
