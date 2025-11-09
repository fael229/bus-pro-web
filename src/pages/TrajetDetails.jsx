import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, Star, MapPin, ArrowRight, Heart, Building2, MessageSquare, User } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useSession } from '../contexts/SessionProvider'

export default function TrajetDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  
  const [trajet, setTrajet] = useState(null)
  const [avis, setAvis] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    note: 5,
    commentaire: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadTrajet()
    loadAvis()
    if (session) checkFavorite()
  }, [id, session])

  const loadTrajet = async () => {
    try {
      const { data, error } = await supabase
        .from('trajets')
        .select('*, compagnies:compagnie_id(id, nom, telephone, logo_url)')
        .eq('id', id)
        .single()

      if (error) throw error
      console.log('✅ Trajet loaded:', data)
      console.log('📊 Compagnie data:', data?.compagnies)
      setTrajet(data)
    } catch (error) {
      console.error('Error loading trajet:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvis = async () => {
    try {
      console.log('🔍 Loading avis for trajet:', id)
      
      const { data, error } = await supabase
        .from('avis')
        .select('*')
        .eq('trajet_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading avis:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Avis loaded:', data?.length || 0)
      console.log('📊 Sample avis:', data?.[0])
      
      setAvis(data || [])
    } catch (error) {
      console.error('❌ Exception loading avis:', error)
      setAvis([])
    }
  }

  const checkFavorite = async () => {
    if (!session?.user?.id) return
    const { data } = await supabase
      .from('favoris')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('trajet_id', id)
      .single()
    setIsFavorite(!!data)
  }

  const toggleFavorite = async () => {
    if (!session) {
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favoris')
          .delete()
          .eq('user_id', session.user.id)
          .eq('trajet_id', id)
      } else {
        await supabase
          .from('favoris')
          .insert({ user_id: session.user.id, trajet_id: id })
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!session) {
      navigate('/login')
      return
    }

    setSubmittingReview(true)

    try {
      const { error } = await supabase
        .from('avis')
        .insert({
          user_id: session.user.id,
          trajet_id: id,
          note: reviewData.note,
          commentaire: reviewData.commentaire,
        })

      if (error) throw error

      alert('✅ Avis ajouté avec succès !')
      setReviewData({ note: 5, commentaire: '' })
      setShowReviewForm(false)
      await loadAvis()
      await loadTrajet() // Recharger pour mettre à jour le nombre d'avis
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('❌ Erreur lors de l\'ajout de l\'avis')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!trajet) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Trajet non trouvé
        </h2>
        <Link to="/trajets" className="btn-primary">
          Retour aux trajets
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {trajet.depart} → {trajet.arrivee}
              </h1>
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/compagnies/${trajet.compagnies?.id}`} 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">{trajet.compagnies?.nom}</span>
                </Link>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Heart
                className={`h-6 w-6 ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-light rounded-lg">
                <Star className="h-6 w-6 text-warning fill-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Note</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {trajet.note || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-light rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avis</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {trajet.nb_avis || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success-light rounded-lg">
                <MapPin className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gare</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {trajet.gare || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Horaires disponibles
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trajet.horaires?.map((horaire, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                >
                  {horaire}
                </span>
              )) || (
                <span className="text-gray-600 dark:text-gray-400">
                  Horaires non disponibles
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Prix du billet
              </p>
              <div>
                <span className="text-4xl font-bold text-primary">
                  {trajet.prix}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                  FCFA
                </span>
              </div>
            </div>
            <Link
              to={`/reservation/${trajet.id}`}
              className="btn-primary flex items-center space-x-2 text-lg px-8"
            >
              <span>Réserver</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Avis section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Avis des voyageurs ({avis.length})
            </h2>
            {session && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-primary text-sm"
              >
                {showReviewForm ? 'Annuler' : 'Laisser un avis'}
              </button>
            )}
          </div>

          {/* Formulaire d'avis */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Partagez votre expérience
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, note: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewData.note
                            ? 'text-warning fill-warning'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {reviewData.note}/5
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commentaire *
                </label>
                <textarea
                  value={reviewData.commentaire}
                  onChange={(e) => setReviewData({ ...reviewData, commentaire: e.target.value })}
                  placeholder="Partagez votre expérience avec ce trajet..."
                  rows="4"
                  required
                  className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-600 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewData.commentaire.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Publication...' : 'Publier l\'avis'}
                </button>
              </div>
            </form>
          )}

          {avis.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Aucun avis pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {avis.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Voyageur
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {review.note}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {review.commentaire}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
