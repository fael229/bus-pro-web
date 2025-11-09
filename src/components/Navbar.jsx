import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSession } from '../contexts/SessionProvider'
import { useTheme } from '../contexts/ThemeProvider'
import { supabase } from '../utils/supabase'
import { Bus, Menu, X, Sun, Moon, User, LogOut, Heart, Calendar, Shield } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { session, signOut } = useSession()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    checkAdmin()
  }, [session])

  const checkAdmin = async () => {
    if (!session?.user?.id) {
      setIsAdmin(false)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('admin')
      .eq('id', session.user.id)
      .single()
    setIsAdmin(data?.admin === true)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Bus Bénin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link
              to="/trajets"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
            >
              Trajets
            </Link>
            <Link
              to="/compagnies"
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
            >
              Compagnies
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mon compte
                  </span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profil</span>
                    </Link>
                    <Link
                      to="/reservations"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Mes réservations</span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Favoris</span>
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          <span className="text-sm font-semibold">Admin</span>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/trajets"
                className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Trajets
              </Link>
              <Link
                to="/compagnies"
                className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Compagnies
              </Link>
              
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-700 dark:text-gray-300">Thème</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              {session ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/reservations"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mes réservations
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favoris
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-primary hover:text-primary-dark px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
