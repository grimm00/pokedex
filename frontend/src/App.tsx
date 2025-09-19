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

function App() {
  console.log('App component rendering...')
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore()

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
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Favorites
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