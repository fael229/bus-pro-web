import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Retour à l'accueil</span>
          </Link>
          <Link to="/trajets" className="btn-outline flex items-center justify-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Rechercher des trajets</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
