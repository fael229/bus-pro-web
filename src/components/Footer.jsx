import { Link } from 'react-router-dom'
import { Bus, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bus Bénin</span>
            </div>
            <p className="text-sm text-gray-400">
              Votre compagnon de voyage pour tous vos déplacements en bus à travers le Bénin.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/trajets" className="hover:text-primary transition-colors">
                  Trajets
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@busbenin.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+229 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Cotonou, Bénin</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Bus Bénin. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
