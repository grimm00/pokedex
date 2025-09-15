import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { PokemonPage } from '@/pages/PokemonPage'
import './styles/globals.css'

function App() {
  console.log('App component rendering...')

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
                <span className="text-gray-600">Frontend Working! 🎉</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokemon" element={<PokemonPage />} />
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