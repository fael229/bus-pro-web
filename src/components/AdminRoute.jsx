import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSession } from '../contexts/SessionProvider'
import { supabase } from '../utils/supabase'

export default function AdminRoute({ children }) {
  const { session, loading: sessionLoading } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [session])

  const checkAdmin = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('admin')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      setIsAdmin(data?.admin === true)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accès refusé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }

  return children
}
