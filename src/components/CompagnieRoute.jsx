import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSession } from '../contexts/SessionProvider'
import { supabase } from '../utils/supabase'

export default function CompagnieRoute({ children }) {
  const { session, loading: sessionLoading } = useSession()
  const [hasCompagnie, setHasCompagnie] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkCompagnie()
  }, [session])

  const checkCompagnie = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('compagnie_id, admin')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      
      // Un utilisateur a accès si :
      // - Il est admin (accès total)
      // - Il a un compagnie_id (gestionnaire de compagnie)
      setHasCompagnie(data?.admin === true || data?.compagnie_id !== null)
    } catch (error) {
      console.error('Error checking compagnie status:', error)
      setHasCompagnie(false)
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!hasCompagnie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous devez être assigné à une compagnie pour accéder à cette page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }

  return children
}
