import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
]

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">S</span>
            </motion.div>
            <span className="font-display font-semibold text-lg">Sand Gallery</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/editor"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Editor
                </Link>
                <Link
                  to="/admin"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Admin
                </Link>
                <div className="flex items-center gap-2">
                  <img
                    src={profile?.photoURL || user.photoURL || '/default-avatar.png'}
                    alt={profile?.displayName || user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-zinc-700"
                  />
                  <button
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => import('../../contexts/AuthContext').then(m => m.useAuth().signInWithGoogle())}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
              >
                <User size={18} />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-zinc-800"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-zinc-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/editor"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-zinc-400 hover:text-white"
                >
                  Editor
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-zinc-400 hover:text-white"
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}
