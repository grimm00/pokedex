import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { HomePage } from '@/pages/HomePage'
import { PokemonPage } from '@/pages/PokemonPage'
import { AuthPage } from '@/pages/AuthPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

function App() {
  console.log('App component rendering...')
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore()
  const { favoritePokemonIds } = useFavoritesStore()

  // Check authentication status on app mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-pokemon font-bold text-blue-600">
                Pokedex
              </Link>

              <div className="flex items-center space-x-4">
                <Link
                  to="/pokemon"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Pokemon
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Welcome, {user?.username}!</span>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors relative group"
                      aria-label={`Favorites (${favoritePokemonIds.size} items)`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span>Favorites</span>
                      {favoritePokemonIds.size > 0 && (
                        <span 
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse group-hover:animate-none"
                          aria-label={`${favoritePokemonIds.size} favorites`}
                        >
                          {favoritePokemonIds.size > 99 ? '99+' : favoritePokemonIds.size}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokemon" element={<PokemonPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Pokedex. Built with React, TypeScript, and Tailwind CSS.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App